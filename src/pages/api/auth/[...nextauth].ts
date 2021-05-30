import { query as q } from "faunadb";
import NextAuth from "next-auth";
import { session } from "next-auth/client";
import Providers from "next-auth/providers";
import { fauna } from "../../../services/fauna";

type User = {
  ref: {
    id: string;
  };
};

export default NextAuth({
  providers: [
    Providers.GitHub({
      clientId: process.env.GITHUB_ID,
      clientSecret: process.env.GITHUB_SECRET,
      scope: "read:user,user:email",
    }),
  ],
  callbacks: {
    async session(session) {
      try {
        const userActiveSubscription = await fauna.query(
          q.Get(
            q.Intersection([
              q.Match(
                q.Index("subscription_by_user_ref"),
                q.Select(
                  "ref",
                  q.Get(
                    q.Match(
                      q.Index("user_by_email"),
                      q.Casefold(session.user.email)
                    )
                  )
                )
              ),
              q.Match(q.Index("subscription_by_status"), "active"),
            ])
          )
        );

        return {
          ...session,
          activeSubscription: userActiveSubscription,
        };
      } catch {
        return {
          ...session,
          activeSubscription: null,
        };
      }
    },
    async signIn(user, account) {
      if (!user.email) return false;
      try {
        const response: User = await fauna.query(
          q.If(
            q.Not(q.Exists(q.Match(q.Index("user_by_id"), account.id))),
            q.Create(q.Collection("users"), {
              data: {
                id: account.id,
                email: user.email,
              },
            }),
            q.Get(q.Match(q.Index("user_by_id"), account.id))
          )
        );

        await fauna.query(
          q.Update(q.Ref(q.Collection("users"), response.ref.id), {
            data: {
              email: user.email,
            },
          })
        );
        return true;
      } catch {
        return false;
      }
    },
  },
});

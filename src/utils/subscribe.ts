import { Session } from "next-auth";
import { signIn } from "next-auth/client";
import { axios } from "../services/axios";
import { getStripeJS } from "../services/stripe-js";

export const startSubscribe = (session: Session, priceId: string) => {
  if (!session) {
    signIn("github");
    return;
  }

  if (session.activeSubscription) {
    return false;
  }

  axios
    .post("/checkout/create", { priceId })
    .then(async (res) => {
      const { sessionId } = res.data;

      const stripe = await getStripeJS();

      await stripe.redirectToCheckout({
        sessionId,
      });
    })
    .catch((err) => {
      alert(err.message);
    });

  return true;
};

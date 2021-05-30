import { GetStaticPaths, GetStaticProps } from "next";
import { useSession } from "next-auth/client";
import Head from "next/head";
import { useRouter } from "next/router";
import { RichText } from "prismic-dom";
import { useEffect } from "react";
import { getPrismicClient } from "../../../services/prismic";
import { stripe } from "../../../services/stripe";
import { startSubscribe } from "../../../utils/subscribe";
import styles from "../post.module.scss";

interface PostInterface {
  slug: string;
  title: string;
  content: string;
  updatedAt: string;
}

interface PostPreviewProps {
  post: PostInterface;
  priceId: string;
}

export default function PostPreview({ post, priceId }: PostPreviewProps) {
  const [session] = useSession();
  const router = useRouter();

  useEffect(() => {
    if (session && session.activeSubscription) {
      router.push(`/posts/${post.slug}`);
      return;
    }
  }, [session]);

  const handleSubscribe = () => {
    if (!startSubscribe(session, priceId)) {
      router.push(`/posts/${post.slug}`);
      return;
    }
  };

  return (
    <>
      <Head>
        <title>{`${post.title} | ig.news`}</title>
      </Head>

      <main className={styles.container}>
        <article className={styles.post}>
          <h1>{post.title}</h1>
          <time>{post.updatedAt}</time>
          <div
            className={`${styles.content} ${styles.previewContent}`}
            dangerouslySetInnerHTML={{ __html: post.content }}
          />
          <div className={styles.continueReading} onClick={handleSubscribe}>
            Wanna continue reading?
            <a>Subscribe now 😃</a>
          </div>
        </article>
      </main>
    </>
  );
}

export const getStaticPaths: GetStaticPaths = async () => {
  return {
    paths: [],
    fallback: "blocking",
  };
};

export const getStaticProps: GetStaticProps = async ({ params }) => {
  const price = await stripe.prices.retrieve("price_1IvqyFKxZOmt0MIgku2mo6md");
  const { slug } = params;

  const prismic = getPrismicClient();

  const response = await prismic.getByUID("posts", String(slug), {});

  try {
    const post = {
      slug,
      title: RichText.asText(response.data.title),
      content: RichText.asHtml(response.data.content.splice(0, 3)),
      updatedAt: new Date(response.last_publication_date).toLocaleDateString(
        "en-US",
        {
          day: "2-digit",
          month: "long",
          year: "numeric",
        }
      ),
    };

    return {
      props: {
        priceId: price.id,
        post,
      },
      revalidate: 60 * 30, // 30 minutes
    };
  } catch {
    return {
      redirect: {
        destination: "/",
        permanent: false,
      },
      revalidate: 60 * 30, // 30 minutes
    };
  }
};

import { GetStaticProps } from "next";
import Head from "next/head";
import { SubscribeButton } from "../components/subscribeButton";
import { stripe } from "../services/stripe";
import styles from "../styles/home.module.scss";

interface HomeProps {
  product: {
    priceId: string;
    price: number | string;
  };
}

export default function Home({ product }: HomeProps) {
  return (
    <>
      <Head>
        <title>Home | ig.news</title>
      </Head>
      <main className={styles.container}>
        <section className={styles.hero}>
          <span>👋 Hey, welcome</span>
          <h1>
            News about the <span>React</span> world.
          </h1>
          <p>
            Get access to all the publications <br />
            <span>for {product.price} month.</span>
          </p>
          <SubscribeButton priceId={product.priceId} />
        </section>
        <img src="/images/avatar.svg" alt="Coding" />
      </main>
    </>
  );
}

export const getStaticProps: GetStaticProps = async () => {
  const price = await stripe.prices.retrieve("price_1IvqyFKxZOmt0MIgku2mo6md");

  const product = {
    priceId: price.id,
    price: new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(price.unit_amount / 100),
  };

  return {
    props: {
      product,
    },
    revalidate: 60 * 60 * 24, // 60s 60m 24h
  };
};

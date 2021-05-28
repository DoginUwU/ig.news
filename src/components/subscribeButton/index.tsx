import { signIn, useSession } from "next-auth/client";
import { axios } from "../../services/axios";
import { getStripeJS } from "../../services/stripe-js";
import styles from "./styles.module.scss";

interface SubscribeButtonProps {
  priceId: string;
}

export function SubscribeButton({ priceId }: SubscribeButtonProps) {
  const [session] = useSession();

  const handleSubscribe = () => {
    if (!session) {
      signIn("github");
      return;
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
  };

  return (
    <button
      type="button"
      className={styles.subscribeButton}
      onClick={handleSubscribe}
    >
      Subscribe Now
    </button>
  );
}

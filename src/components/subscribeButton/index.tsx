import { useSession } from "next-auth/client";
import { useRouter } from "next/router";
import { startSubscribe } from "../../utils/subscribe";
import styles from "./styles.module.scss";

interface SubscribeButtonProps {
  priceId: string;
}

export function SubscribeButton({ priceId }: SubscribeButtonProps) {
  const [session] = useSession();
  const router = useRouter();

  const handleSubscribe = () => {
    if (!startSubscribe(session, priceId)) {
      router.push("/posts");
    }
  };

  return (
    <button
      type="button"
      className={styles.subscribeButton}
      onClick={handleSubscribe}
    >
      {session?.activeSubscription ? "Already Subscribed" : "Subscribe Now"}
    </button>
  );
}

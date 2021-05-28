import { SignInButton } from "../singInButton";
import styles from "./styles.module.scss";

export function Header() {
  return (
    <header className={styles.Container}>
      <div className={styles.Content}>
        <img src="/images/logo.svg" alt="IG.NEWS" />
        <nav>
          <a className={styles.active} href="">
            Home
          </a>
          <a href="">Posts</a>
        </nav>
        <SignInButton />
      </div>
    </header>
  );
}

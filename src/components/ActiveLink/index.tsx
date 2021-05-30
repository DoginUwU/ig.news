import { useRouter } from "next/router";
import { ReactElement, cloneElement } from "react";
import Link, { LinkProps } from "next/link";

interface ActiveLinkProps extends LinkProps {
  children: ReactElement;
  activeClassName: string;
}

export function ActiveLink({
  children,
  activeClassName,
  ...others
}: ActiveLinkProps) {
  const { asPath } = useRouter();

  const className = asPath === others.href ? activeClassName : "";

  return (
    <Link {...others}>
      {cloneElement(children, {
        className,
      })}
    </Link>
  );
}

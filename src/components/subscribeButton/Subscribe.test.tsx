import { render, screen, fireEvent } from "@testing-library/react";
import { mocked } from "ts-jest/utils";
import { useSession } from "next-auth/client";
import { SubscribeButton } from ".";
import { useRouter } from "next/router";

jest.mock("next-auth/client");
jest.mock("next/router");

describe("SubscribeButton component", () => {
  it("renders correctly", () => {
    const useSessionMocked = mocked(useSession);
    useSessionMocked.mockReturnValueOnce([null, false]);
    render(<SubscribeButton priceId="1" />);

    expect(screen.getByText("Subscribe Now")).toBeInTheDocument();
  });

  it("renders correctly when user is subscribe", () => {
    const useSessionMocked = mocked(useSession);
    useSessionMocked.mockReturnValueOnce([defaultSessionMock, true]);
    render(<SubscribeButton priceId="1" />);

    expect(screen.getByText("Already Subscribed")).toBeInTheDocument();
  });

  it("redirects user to posts when user is subscribe", () => {
    const useSessionMocked = mocked(useSession);
    useSessionMocked.mockReturnValueOnce([defaultSessionMock, true]);
    const useRouterMocked = mocked(useRouter);
    const pushMock = jest.fn();
    useRouterMocked.mockReturnValueOnce({
      push: pushMock,
    } as any);
    render(<SubscribeButton priceId="1" />);

    const subscribeButton = screen.getByText("Already Subscribed");

    fireEvent.click(subscribeButton);

    expect(pushMock).toHaveBeenCalledWith("/posts");
  });
});

const defaultSessionMock = {
  activeSubscription: true,
  name: "John Doe",
  email: "john_doe@provider.com",
};

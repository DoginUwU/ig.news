import { startSubscribe } from "../../utils/subscribe";
import { mocked } from "ts-jest/utils";
import { signIn } from "next-auth/client";

jest.mock("next-auth/client", () => {
  return {
    signIn: jest.fn(),
  };
});

describe("Subscribe Function", () => {
  it("returns signIn on user not authenticated", () => {
    const signInMocked = mocked(signIn);
    startSubscribe(undefined, "fake-price-id");

    expect(signInMocked).toBeCalledWith("github");
  });

  it("returns false when user is authenticated and subscribed", () => {
    const response = startSubscribe(
      { activeSubscription: true },
      "fake-price-id"
    );

    expect(response).toEqual(false);
  });

  it("returns true when user is authenticated and not subscribed", () => {
    const response = startSubscribe(
      { activeSubscription: false },
      "fake-price-id"
    );

    expect(response).toEqual(true);
  });
});

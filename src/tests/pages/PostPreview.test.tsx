import { render, screen, fireEvent } from "@testing-library/react";
import Post, { getStaticProps } from "../../pages/posts/preview/[slug]";
import { useSession } from "next-auth/client";
import { mocked } from "ts-jest/utils";
import { getPrismicClient } from "../../services/prismic";
import { useRouter } from "next/router";
import { stripe } from "../../services/stripe";

jest.mock("../../services/prismic");
jest.mock("next-auth/client");
jest.mock("next/router");
jest.mock("../../services/stripe");

describe("PostPreview page", () => {
  it("renders correctly", () => {
    const useSessionMocked = mocked(useSession);
    useSessionMocked.mockReturnValueOnce([null, false]);
    render(<Post post={post} priceId="fake-priceId" />);

    expect(screen.getByText(post.title)).toBeInTheDocument();
    expect(screen.getByText("Post excerpt")).toBeInTheDocument();
    expect(screen.getByText("Wanna continue reading?")).toBeInTheDocument();
  });

  it("redirects user to full post when user is subscribed", () => {
    const useSessionMocked = mocked(useSession);
    const useRouterMocked = mocked(useRouter);
    const pushMock = jest.fn();
    useSessionMocked.mockReturnValueOnce([
      {
        activeSubscription: "fake-active-subscription",
      },
      false,
    ]);
    useRouterMocked.mockReturnValueOnce({
      push: pushMock,
    } as any);
    render(<Post post={post} priceId="fake-priceId" />);
    const subscribeButton = screen.getByTestId("button_subscribe");
    fireEvent.click(subscribeButton);

    expect(pushMock).toHaveBeenCalledWith(`/posts/${post.slug}`);
  });

  it("loads initial data", async () => {
    const stripePricesMocked = mocked(stripe.prices.retrieve);
    stripePricesMocked.mockResolvedValueOnce({
      id: "fake-price-id",
      unit_amount: 1000,
    } as any);
    const getPrismicClientMocked = mocked(getPrismicClient);
    getPrismicClientMocked.mockReturnValueOnce({
      getByUID: jest.fn().mockResolvedValueOnce({
        data: {
          title: [
            {
              type: "heading",
              text: "New Post",
            },
          ],
          content: [
            {
              type: "paragraph",
              text: "Post content",
            },
          ],
        },
        last_publication_date: "05-13-2004",
      }),
    } as any);

    const response = await getStaticProps({
      params: {
        slug: post.slug,
      },
    } as any);

    expect(response).toEqual(
      expect.objectContaining({
        props: expect.objectContaining({
          post: {
            slug: post.slug,
            title: "New Post",
            content: "<p>Post content</p>",
            updatedAt: "May 13, 2004",
          },
        }),
      })
    );
  });
});

const post = {
  slug: "new-post",
  title: "New Post",
  content: "<p>Post excerpt</p>",
  updatedAt: "532424",
};

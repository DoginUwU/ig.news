import { render, screen } from "@testing-library/react";
import Post, { getServerSideProps } from "../../pages/posts/[slug]";
import { getSession } from "next-auth/client";
import { mocked } from "ts-jest/utils";
import { getPrismicClient } from "../../services/prismic";

jest.mock("../../services/prismic");
jest.mock("next-auth/client");

describe("Post page", () => {
  it("renders correctly", () => {
    render(<Post post={post} />);

    expect(screen.getByText(post.title)).toBeInTheDocument();
    expect(screen.getByText("Post excerpt")).toBeInTheDocument();
  });

  it("redirects user to preview if no subscribe found", async () => {
    const getSessionMocked = mocked(getSession);

    getSessionMocked.mockResolvedValueOnce({
      activeSubscription: null,
    });

    const response = await getServerSideProps({
      params: {
        slug: post.slug,
      },
    } as any);

    expect(response).toEqual(
      expect.objectContaining({
        redirect: {
          destination: `/posts/preview/${post.slug}`,
          permanent: false,
        },
      })
    );
  });

  it("loads initial data", async () => {
    const getSessionMocked = mocked(getSession);
    getSessionMocked.mockResolvedValueOnce({
      activeSubscription: "fake-active-subscription",
    });
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

    const response = await getServerSideProps({
      params: {
        slug: post.slug,
      },
    } as any);

    expect(response).toEqual(
      expect.objectContaining({
        props: {
          post: {
            slug: post.slug,
            title: "New Post",
            content: "<p>Post content</p>",
            updatedAt: "May 13, 2004",
          },
        },
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

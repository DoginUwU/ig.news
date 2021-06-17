import { render, screen } from "@testing-library/react";
import Posts, { getStaticProps } from "../../pages/posts";
import { mocked } from "ts-jest/utils";
import { getPrismicClient } from "../../services/prismic";

jest.mock("../../services/prismic");

describe("Posts page", () => {
  it("renders correctly", () => {
    render(<Posts posts={posts} />);

    expect(screen.getByText(posts[0].title)).toBeInTheDocument();
  });

  it("loads initial data", async () => {
    const getPrismicClientMocked = mocked(getPrismicClient);
    getPrismicClientMocked.mockReturnValueOnce({
      query: jest.fn().mockResolvedValueOnce({
        results: [
          {
            uid: "new-post",
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
                  text: "Post excerpt",
                },
              ],
            },
            last_publication_date: "05-13-2004",
          },
        ],
      }),
    } as any);

    const response = await getStaticProps({});

    expect(response).toEqual(
      expect.objectContaining({
        props: {
          posts: [
            {
              slug: "new-post",
              title: "New Post",
              excerpt: "Post excerpt",
              updatedAt: "May 13, 2004",
            },
          ],
        },
      })
    );
  });
});

const posts = [
  {
    slug: "new-post",
    title: "New Post",
    excerpt: "Post excerpt",
    updatedAt: "532424",
  },
  {
    slug: "new-post 2",
    title: "New Post 2",
    excerpt: "Post excerpt 2",
    updatedAt: "6546546",
  },
];

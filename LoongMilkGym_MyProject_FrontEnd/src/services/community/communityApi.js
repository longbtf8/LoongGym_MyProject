import { createApi } from "@reduxjs/toolkit/query/react";
import { axiosBaseQuery } from "../baseQuery";

export const communityApi = createApi({
  reducerPath: "communityApi",
  baseQuery: axiosBaseQuery({
    baseUrl: import.meta.env.VITE_API_BASE_URL,
  }),
  tagTypes: ["Post", "PostDetail"],

  endpoints: (builder) => ({
    getPosts: builder.query({
      query: ({ page = 1, limit = 10, authorId = null } = {}) => ({
        url: "/community/posts",
        params: { page, limit, authorId },
      }),
      providesTags: (result) =>
        result?.data
          ? [
              ...result.data.map(({ id }) => ({ type: "Post", id })),
              { type: "Post", id: "LIST" },
            ]
          : [{ type: "Post", id: "LIST" }],
    }),
    getPostById: builder.query({
      query: (id) => ({
        url: `/community/posts/${id}`,
      }),
      providesTags: (result, error, id) => [{ type: "PostDetail", id }],
    }),
    createPost: builder.mutation({
      query: (formData) => ({
        url: "/community/posts",
        method: "POST",
        data: formData,
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }),
      invalidatesTags: [{ type: "Post", id: "LIST" }],
    }),
    deletePost: builder.mutation({
      query: (id) => ({
        url: `/community/posts/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: [{ type: "Post", id: "LIST" }],
    }),
    toggleReaction: builder.mutation({
      query: ({ postId, reactionType = "like" }) => ({
        url: `/community/posts/${postId}/react`,
        method: "POST",
        data: { reactionType },
      }),
      invalidatesTags: (result, error, { postId }) => [
        { type: "Post", id: postId },
        { type: "PostDetail", id: postId },
      ],
    }),
    deleteReaction: builder.mutation({
      query: ({ postId, reactionType = "like" }) => ({
        url: `/community/posts/${postId}/react`,
        method: "DELETE",
        params: { reactionType },
      }),
      invalidatesTags: (result, error, { postId }) => [
        { type: "Post", id: postId },
        { type: "PostDetail", id: postId },
      ],
    }),
    addComment: builder.mutation({
      query: ({ postId, content, parentCommentId }) => ({
        url: `/community/posts/${postId}/comments`,
        method: "POST",
        data: { content, parentCommentId },
      }),
      invalidatesTags: (result, error, { postId }) => [
        { type: "Post", id: postId },
        { type: "PostDetail", id: postId },
      ],
    }),
  }),
});

export const {
  useGetPostsQuery,
  useGetPostByIdQuery,
  useCreatePostMutation,
  useDeletePostMutation,
  useToggleReactionMutation,
  useDeleteReactionMutation,
  useAddCommentMutation,
} = communityApi;

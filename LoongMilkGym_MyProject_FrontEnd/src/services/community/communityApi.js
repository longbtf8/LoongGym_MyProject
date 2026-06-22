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
      query: ({ page = 1, limit = 10, authorId = null, feedType = null } = {}) => ({
        url: "/community/posts",
        params: { page, limit, authorId, feedType },
      }),
      providesTags: (result) =>
        result?.data
          ? [
              ...result.data.map(({ id }) => ({ type: "Post", id })),
              { type: "Post", id: "LIST" },
            ]
          : [{ type: "Post", id: "LIST" }],
      async onCacheEntryAdded(arg, { updateCachedData, cacheDataLoaded, cacheEntryRemoved }) {
        try {
          await cacheDataLoaded;
          const { default: socketClient } = await import("@/utils/socketClient");
          const channel = socketClient.subscribe("community-feed");

          const getCurrentUserId = () => {
            try {
              const token = localStorage.getItem("loongmilkgym_accessToken");
              if (!token) return null;
              const base64Url = token.split(".")[1];
              const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
              const atobFn = typeof window !== "undefined" ? window.atob : (str) => Buffer.from(str, "base64").toString("binary");
              return JSON.parse(atobFn(base64)).userId || null;
            } catch (e) {
              return null;
            }
          };

          channel.bind("post.created", (newPost) => {
            updateCachedData((draft) => {
              if (!draft?.data) return;
              if (draft.data.some((p) => p.id === newPost.id)) return;
              draft.data.unshift(newPost);
            });
          });

          channel.bind("post.updated", (updatedPost) => {
            updateCachedData((draft) => {
              if (!draft?.data) return;
              const idx = draft.data.findIndex((p) => p.id === updatedPost.id);
              if (idx !== -1) {
                draft.data[idx] = { ...draft.data[idx], ...updatedPost };
              }
            });
          });

          channel.bind("post.deleted", ({ postId }) => {
            updateCachedData((draft) => {
              if (!draft?.data) return;
              draft.data = draft.data.filter((p) => p.id !== postId);
            });
          });

          channel.bind("post.reaction.updated", ({ postId, reactions, reactionsCount, activeReactions }) => {
            updateCachedData((draft) => {
              if (!draft?.data) return;
              const p = draft.data.find((x) => x.id === postId);
              if (p) {
                const currentUserId = getCurrentUserId();
                p.reactionsCount = reactionsCount;
                p.activeReactions = activeReactions;
                p.hasReacted = reactions.some((r) => r.userId === currentUserId);
                p.userReaction = reactions.find((r) => r.userId === currentUserId)?.reactionType || null;
              }
            });
          });

          await cacheEntryRemoved;
          channel.unbind_all();
          socketClient.unsubscribe("community-feed");
        } catch (err) {
          console.error("Error in onCacheEntryAdded for getPosts:", err);
        }
      },
    }),
    getPostById: builder.query({
      query: (id) => ({
        url: `/community/posts/${id}`,
      }),
      providesTags: (result, error, id) => [{ type: "PostDetail", id }],
      async onCacheEntryAdded(id, { updateCachedData, cacheDataLoaded, cacheEntryRemoved }) {
        try {
          await cacheDataLoaded;
          const { default: socketClient } = await import("@/utils/socketClient");
          const channelName = `post-${id}`;
          const channel = socketClient.subscribe(channelName);

          const getCurrentUserId = () => {
            try {
              const token = localStorage.getItem("loongmilkgym_accessToken");
              if (!token) return null;
              const base64Url = token.split(".")[1];
              const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
              const atobFn = typeof window !== "undefined" ? window.atob : (str) => Buffer.from(str, "base64").toString("binary");
              return JSON.parse(atobFn(base64)).userId || null;
            } catch (e) {
              return null;
            }
          };

          channel.bind("post.reaction.updated", ({ reactions, reactionsCount, activeReactions }) => {
            updateCachedData((draft) => {
              if (!draft?.data) return;
              const currentUserId = getCurrentUserId();
              draft.data.reactionsCount = reactionsCount;
              draft.data.activeReactions = activeReactions;
              draft.data.hasReacted = reactions.some((r) => r.userId === currentUserId);
              draft.data.userReaction = reactions.find((r) => r.userId === currentUserId)?.reactionType || null;
            });
          });

          await cacheEntryRemoved;
          channel.unbind_all();
          socketClient.unsubscribe(channelName);
        } catch (err) {
          console.error("Error in onCacheEntryAdded for getPostById:", err);
        }
      },
    }),
    getMediaById: builder.query({
      query: (id) => ({
        url: `/community/media/${id}`,
      }),
      providesTags: (result, error, id) => [{ type: "PostDetail", id: `MEDIA-${id}` }],
    }),
    getArchivedPosts: builder.query({
      query: ({ page = 1, limit = 10 } = {}) => ({
        url: "/community/posts/archives/me",
        params: { page, limit },
      }),
      providesTags: [{ type: "Post", id: "ARCHIVE" }],
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
    updatePost: builder.mutation({
      query: ({ postId, formData }) => ({
        url: `/community/posts/${postId}`,
        method: "PATCH",
        data: formData,
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }),
      invalidatesTags: (result, error, { postId }) => [
        { type: "Post", id: postId },
        { type: "PostDetail", id: postId },
        { type: "Post", id: "LIST" },
        { type: "Post", id: "ARCHIVE" },
      ],
    }),
    deletePost: builder.mutation({
      query: (id) => ({
        url: `/community/posts/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: [{ type: "Post", id: "LIST" }, { type: "Post", id: "ARCHIVE" }],
    }),
    archivePostOnProfile: builder.mutation({
      query: (postId) => ({
        url: `/community/posts/${postId}/archive-profile`,
        method: "POST",
      }),
      invalidatesTags: [{ type: "Post", id: "LIST" }, { type: "Post", id: "ARCHIVE" }],
    }),
    restorePostToProfile: builder.mutation({
      query: (postId) => ({
        url: `/community/posts/${postId}/archive-profile`,
        method: "DELETE",
      }),
      invalidatesTags: [{ type: "Post", id: "LIST" }, { type: "Post", id: "ARCHIVE" }],
    }),
    hidePostForMe: builder.mutation({
      query: (postId) => ({
        url: `/community/posts/${postId}/hide`,
        method: "POST",
      }),
      invalidatesTags: (result, error, postId) => [
        { type: "Post", id: postId },
        { type: "PostDetail", id: postId },
        { type: "Post", id: "LIST" },
      ],
    }),
    reportPost: builder.mutation({
      query: ({ postId, reason }) => ({
        url: `/community/posts/${postId}/report`,
        method: "POST",
        data: { reason },
      }),
      invalidatesTags: (result, error, { postId }) => [
        { type: "Post", id: postId },
        { type: "PostDetail", id: postId },
      ],
    }),
    toggleReaction: builder.mutation({
      query: ({ postId, reactionType = "like" }) => ({
        url: `/community/posts/${postId}/reactions`,
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
        url: `/community/posts/${postId}/reactions`,
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
    addMediaComment: builder.mutation({
      query: ({ mediaId, content }) => ({
        url: `/community/media/${mediaId}/comments`,
        method: "POST",
        data: { content },
      }),
      invalidatesTags: (result, error, { mediaId, postId }) => [
        { type: "PostDetail", id: `MEDIA-${mediaId}` },
        ...(postId ? [{ type: "Post", id: postId }, { type: "PostDetail", id: postId }] : []),
      ],
    }),
    toggleMediaReaction: builder.mutation({
      query: ({ mediaId, reactionType = "like" }) => ({
        url: `/community/media/${mediaId}/reactions`,
        method: "POST",
        data: { reactionType },
      }),
      invalidatesTags: (result, error, { mediaId, postId }) => [
        { type: "PostDetail", id: `MEDIA-${mediaId}` },
        ...(postId ? [{ type: "Post", id: postId }, { type: "PostDetail", id: postId }] : []),
      ],
    }),
    deleteMediaReaction: builder.mutation({
      query: ({ mediaId, reactionType = "like" }) => ({
        url: `/community/media/${mediaId}/reactions`,
        method: "DELETE",
        params: { reactionType },
      }),
      invalidatesTags: (result, error, { mediaId, postId }) => [
        { type: "PostDetail", id: `MEDIA-${mediaId}` },
        ...(postId ? [{ type: "Post", id: postId }, { type: "PostDetail", id: postId }] : []),
      ],
    }),
    toggleMediaCommentReaction: builder.mutation({
      query: ({ commentId, reactionType = "like" }) => ({
        url: `/community/media-comments/${commentId}/reactions`,
        method: "POST",
        data: { reactionType },
      }),
      invalidatesTags: (result, error, { mediaId, postId }) => [
        ...(mediaId ? [{ type: "PostDetail", id: `MEDIA-${mediaId}` }] : []),
        ...(postId ? [{ type: "Post", id: postId }, { type: "PostDetail", id: postId }] : []),
      ],
    }),
    deleteMediaCommentReaction: builder.mutation({
      query: ({ commentId }) => ({
        url: `/community/media-comments/${commentId}/reactions`,
        method: "DELETE",
      }),
      invalidatesTags: (result, error, { mediaId, postId }) => [
        ...(mediaId ? [{ type: "PostDetail", id: `MEDIA-${mediaId}` }] : []),
        ...(postId ? [{ type: "Post", id: postId }, { type: "PostDetail", id: postId }] : []),
      ],
    }),
    savePost: builder.mutation({
      query: (postId) => ({
        url: `/community/posts/${postId}/save`,
        method: "POST",
      }),
      invalidatesTags: (result, error, postId) => [
        { type: "Post", id: postId },
        { type: "PostDetail", id: postId },
        { type: "Post", id: "LIST" },
      ],
    }),
    unsavePost: builder.mutation({
      query: (postId) => ({
        url: `/community/posts/${postId}/save`,
        method: "DELETE",
      }),
      invalidatesTags: (result, error, postId) => [
        { type: "Post", id: postId },
        { type: "PostDetail", id: postId },
        { type: "Post", id: "LIST" },
      ],
    }),
    searchUsers: builder.query({
      query: (q) => ({
        url: "/community/users/search",
        params: { q },
      }),
    }),
    toggleCommentReaction: builder.mutation({
      query: ({ commentId, reactionType = "like" }) => ({
        url: `/community/comments/${commentId}/reactions`,
        method: "POST",
        data: { reactionType },
      }),
      invalidatesTags: (result, error, { postId }) => [
        { type: "Post", id: postId },
        { type: "PostDetail", id: postId },
      ],
    }),
    deleteCommentReaction: builder.mutation({
      query: ({ commentId }) => ({
        url: `/community/comments/${commentId}/reactions`,
        method: "DELETE",
      }),
      invalidatesTags: (result, error, { postId }) => [
        { type: "Post", id: postId },
        { type: "PostDetail", id: postId },
      ],
    }),
    editComment: builder.mutation({
      query: ({ commentId, content }) => ({
        url: `/community/comments/${commentId}`,
        method: "PATCH",
        data: { content },
      }),
      invalidatesTags: (result, error, { postId }) => [
        { type: "Post", id: postId },
        { type: "PostDetail", id: postId },
      ],
    }),
    deleteComment: builder.mutation({
      query: ({ commentId }) => ({
        url: `/community/comments/${commentId}`,
        method: "DELETE",
      }),
      invalidatesTags: (result, error, { postId }) => [
        { type: "Post", id: postId },
        { type: "PostDetail", id: postId },
      ],
    }),
    hideComment: builder.mutation({
      query: ({ commentId }) => ({
        url: `/community/comments/${commentId}/hide`,
        method: "POST",
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
  useGetMediaByIdQuery,
  useGetArchivedPostsQuery,
  useCreatePostMutation,
  useUpdatePostMutation,
  useDeletePostMutation,
  useArchivePostOnProfileMutation,
  useRestorePostToProfileMutation,
  useHidePostForMeMutation,
  useReportPostMutation,
  useToggleReactionMutation,
  useDeleteReactionMutation,
  useAddCommentMutation,
  useAddMediaCommentMutation,
  useToggleMediaReactionMutation,
  useDeleteMediaReactionMutation,
  useToggleMediaCommentReactionMutation,
  useDeleteMediaCommentReactionMutation,
  useSavePostMutation,
  useUnsavePostMutation,
  useSearchUsersQuery,
  useToggleCommentReactionMutation,
  useDeleteCommentReactionMutation,
  useEditCommentMutation,
  useDeleteCommentMutation,
  useHideCommentMutation,
} = communityApi;

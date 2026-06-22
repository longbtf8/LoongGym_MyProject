import { createApi } from "@reduxjs/toolkit/query/react";
import { axiosBaseQuery } from "../baseQuery";
import { STORAGE_KEYS } from "@/config/appConfig";

export const authApi = createApi({
  reducerPath: "authApi",
  baseQuery: axiosBaseQuery({
    baseUrl: import.meta.env.VITE_API_BASE_URL,
  }),
  tagTypes: ["User", "Devices", "UserProfile"],

  endpoints: (builder) => ({
    getUserInfo: builder.query({
      query: () => ({
        url: `/auth/me`,
      }),
      providesTags: ["User"],
    }),
    login: builder.mutation({
      query: (credentials) => ({
        url: `/auth/login`,
        method: "POST",
        data: credentials,
      }),
      invalidatesTags: ["User", "Devices"],
    }),
    register: builder.mutation({
      query: (credentials) => ({
        url: "/auth/register",
        method: "POST",
        data: credentials,
      }),
      invalidatesTags: ["User", "Devices"],
    }),
    forgotPassword: builder.mutation({
      query: (data) => ({
        url: "/auth/forgot-password",
        method: "POST",
        data: data,
      }),
    }),
    resetPassword: builder.mutation({
      query: (credentials) => ({
        url: "/auth/reset-password",
        method: "POST",
        data: credentials,
      }),
      invalidatesTags: ["User"],
    }),
    logout: builder.mutation({
      query: () => ({
        url: "/auth/logout",
        method: "POST",
      }),
      invalidatesTags: ["User", "Devices"],
    }),
    verifyEmail: builder.mutation({
      query: (data) => ({
        url: "/auth/verify-email",
        method: "POST",
        data,
      }),
    }),
    changePassword: builder.mutation({
      query: (data) => ({
        url: "/auth/change-password",
        method: "POST",
        data,
      }),
    }),
    resendVerification: builder.mutation({
      query: (data) => ({
        url: "/auth/resend-verification",
        method: "POST",
        data,
      }),
    }),
    getDevices: builder.query({
      query: () => {
        const token = localStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN);
        return {
          url: "/auth/devices",
          headers: token ? { "x-refresh-token": token } : {},
        };
      },
      providesTags: ["Devices"],
    }),
    revokeDevice: builder.mutation({
      query: (id) => ({
        url: `/auth/devices/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Devices"],
    }),
    updateProfile: builder.mutation({
      query: (data) => ({
        url: "/users/me",
        method: "PUT",
        data,
      }),
      invalidatesTags: ["User"],
    }),
    uploadAvatar: builder.mutation({
      query: (formData) => ({
        url: "/users/me/upload-avatar",
        method: "POST",
        data: formData,
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }),
      invalidatesTags: ["User", "UserProfile"],
    }),
    uploadCover: builder.mutation({
      query: (formData) => ({
        url: "/users/me/upload-cover",
        method: "POST",
        data: formData,
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }),
      invalidatesTags: ["User", "UserProfile"],
    }),
    updateAvatarPhoto: builder.mutation({
      query: (data) => ({
        url: "/users/me/avatar-photo",
        method: "PATCH",
        data,
      }),
      invalidatesTags: ["User", "UserProfile"],
    }),
    updateCoverPhoto: builder.mutation({
      query: (data) => ({
        url: "/users/me/cover-photo",
        method: "PATCH",
        data,
      }),
      invalidatesTags: ["User", "UserProfile"],
    }),
    getUserProfileById: builder.query({
      query: (id) => ({
        url: `/users/${id}`,
      }),
      providesTags: (result, error, id) => ["UserProfile", { type: "UserProfile", id }],
    }),
    followUser: builder.mutation({
      query: (id) => ({
        url: `/community/users/${id}/follow`,
        method: "POST",
      }),
      invalidatesTags: (result, error, id) => [{ type: "UserProfile", id }, "User"],
    }),
    unfollowUser: builder.mutation({
      query: (id) => ({
        url: `/community/users/${id}/follow`,
        method: "DELETE",
      }),
      invalidatesTags: (result, error, id) => [{ type: "UserProfile", id }, "User"],
    }),
  }),
});

export const {
  useGetUserInfoQuery,
  useLoginMutation,
  useRegisterMutation,
  useForgotPasswordMutation,
  useResetPasswordMutation,
  useLogoutMutation,
  useVerifyEmailMutation,
  useChangePasswordMutation,
  useResendVerificationMutation,
  useGetDevicesQuery,
  useRevokeDeviceMutation,
  useUpdateProfileMutation,
  useUploadAvatarMutation,
  useUploadCoverMutation,
  useUpdateAvatarPhotoMutation,
  useUpdateCoverPhotoMutation,
  useGetUserProfileByIdQuery,
  useFollowUserMutation,
  useUnfollowUserMutation,
} = authApi;

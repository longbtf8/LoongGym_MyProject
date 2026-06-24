import { createApi } from "@reduxjs/toolkit/query/react";
import { axiosBaseQuery } from "../baseQuery";

export const adminApi = createApi({
  reducerPath: "adminApi",
  baseQuery: axiosBaseQuery({
    baseUrl: import.meta.env.VITE_API_BASE_URL,
  }),
  tagTypes: ["Dashboard", "Users", "UserDetail", "Reports", "ReportDetail", "Posts", "PostDetail", "Products", "ProductDetail", "ProductCategories", "WorkoutPrograms", "WorkoutProgramDetail", "WorkoutProgramFilters", "Exercises", "ExerciseDetail"],

  endpoints: (builder) => ({
    getDashboard: builder.query({
      query: () => ({
        url: "/admin/dashboard",
        method: "GET",
      }),
      providesTags: ["Dashboard"],
      async onCacheEntryAdded(arg, { updateCachedData, cacheDataLoaded, cacheEntryRemoved }) {
        try {
          await cacheDataLoaded;
          const { default: socketClient } = await import("@/utils/socketClient");
          const channel = socketClient.subscribe("admin-reports");

          const handleStatsUpdate = ({ stats }) => {
            updateCachedData((draft) => {
              if (draft?.data?.reports && stats) {
                draft.data.reports.total = stats.total;
                draft.data.reports.pending = stats.pending;
                draft.data.reports.resolved = stats.resolved;
              }
            });
          };

          channel.bind("report.created", handleStatsUpdate);
          channel.bind("report.resolved", handleStatsUpdate);

          await cacheEntryRemoved;
          channel.unbind_all();
          socketClient.unsubscribe("admin-reports");
        } catch (err) {
          console.error("Error in onCacheEntryAdded for getDashboard:", err);
        }
      }
    }),
    getUsers: builder.query({
      query: (params) => ({
        url: "/admin/users",
        method: "GET",
        params,
      }),
      providesTags: ["Users"],
      async onCacheEntryAdded(arg, { updateCachedData, cacheDataLoaded, cacheEntryRemoved }) {
        try {
          await cacheDataLoaded;
          const { default: socketClient } = await import("@/utils/socketClient");
          const channel = socketClient.subscribe("admin-users");

          channel.bind("user.updated", ({ user }) => {
            updateCachedData((draft) => {
              if (!draft?.data?.items || !user) return;
              const idx = draft.data.items.findIndex((item) => item.id === user.id);
              if (idx !== -1) {
                draft.data.items[idx] = { ...draft.data.items[idx], ...user };
              }
            });
          });

          await cacheEntryRemoved;
          channel.unbind_all();
          socketClient.unsubscribe("admin-users");
        } catch (err) {
          console.error("Error in onCacheEntryAdded for getUsers:", err);
        }
      },
    }),
    getUserDetail: builder.query({
      query: (id) => ({
        url: `/admin/users/${id}`,
        method: "GET",
      }),
      providesTags: (result, error, id) => [{ type: "UserDetail", id }],
    }),
    updateUserStatus: builder.mutation({
      query: ({ id, ...body }) => ({
        url: `/admin/users/${id}/status`,
        method: "PATCH",
        data: body,
      }),
      invalidatesTags: (result, error, { id }) => [
        "Users",
        { type: "UserDetail", id },
        "Dashboard",
      ],
    }),
    updateUserRole: builder.mutation({
      query: ({ id, ...body }) => ({
        url: `/admin/users/${id}/role`,
        method: "PATCH",
        data: body,
      }),
      invalidatesTags: (result, error, { id }) => [
        "Users",
        { type: "UserDetail", id },
        "Dashboard",
      ],
    }),
    getReports: builder.query({
      query: (params) => ({
        url: "/admin/reports",
        method: "GET",
        params,
      }),
      providesTags: ["Reports"],
      async onCacheEntryAdded(arg, { updateCachedData, cacheDataLoaded, cacheEntryRemoved }) {
        try {
          await cacheDataLoaded;
          const { default: socketClient } = await import("@/utils/socketClient");
          const channel = socketClient.subscribe("admin-reports");

          channel.bind("report.created", ({ report }) => {
            updateCachedData((draft) => {
              if (!draft?.data?.items) return;
              const queryStatus = arg?.status || "PENDING";
              const matchesStatus = (queryStatus.toUpperCase() === report.status.toUpperCase());
              
              if (matchesStatus) {
                if (draft.data.items.some((item) => item.id === report.id)) return;
                draft.data.items.unshift(report);
              }
            });
          });

          channel.bind("report.resolved", ({ reportId, status }) => {
            updateCachedData((draft) => {
              if (!draft?.data?.items) return;
              const queryStatus = arg?.status || "PENDING";
              const matchesStatus = (queryStatus.toUpperCase() === status.toUpperCase());

              if (!matchesStatus) {
                draft.data.items = draft.data.items.filter((item) => item.id !== reportId);
              } else {
                const item = draft.data.items.find((item) => item.id === reportId);
                if (item) {
                  item.status = status;
                }
              }
            });
          });

          channel.bind("post.restored", ({ postId }) => {
            updateCachedData((draft) => {
              if (!draft?.data?.items) return;
              draft.data.items.forEach((item) => {
                if (item.postId === postId) {
                  if (item.post) {
                    item.post.moderationStatus = "VISIBLE";
                  }
                }
              });
            });
          });

          await cacheEntryRemoved;
          channel.unbind_all();
          socketClient.unsubscribe("admin-reports");
        } catch (err) {
          console.error("Error in onCacheEntryAdded for getReports:", err);
        }
      }
    }),
    getReportDetail: builder.query({
      query: (id) => ({
        url: `/admin/reports/${id}`,
        method: "GET",
      }),
      providesTags: (result, error, id) => [{ type: "ReportDetail", id }],
    }),
    resolveReport: builder.mutation({
      query: ({ id, ...body }) => ({
        url: `/admin/reports/${id}/resolve`,
        method: "PATCH",
        data: body,
      }),
      invalidatesTags: (result, error, { id }) => [
        "Reports",
        { type: "ReportDetail", id },
        "Dashboard",
        "Users",
        "Posts",
      ],
    }),
    getPosts: builder.query({
      query: (params) => ({
        url: "/admin/posts",
        method: "GET",
        params,
      }),
      providesTags: ["Posts"],
      async onCacheEntryAdded(arg, { updateCachedData, cacheDataLoaded, cacheEntryRemoved }) {
        try {
          await cacheDataLoaded;
          const { default: socketClient } = await import("@/utils/socketClient");
          const channel = socketClient.subscribe("admin-posts");

          channel.bind("post.moderated", ({ postId, moderationStatus, post }) => {
            updateCachedData((draft) => {
              if (!draft?.data?.items) return;
              const item = draft.data.items.find((p) => p.id === postId);
              if (item) {
                item.moderationStatus = moderationStatus;
                if (post) Object.assign(item, post);
              }
            });
          });

          await cacheEntryRemoved;
          channel.unbind_all();
          socketClient.unsubscribe("admin-posts");
        } catch (err) {
          console.error("Error in onCacheEntryAdded for getPosts:", err);
        }
      },
    }),
    getPostDetail: builder.query({
      query: (id) => ({
        url: `/admin/posts/${id}`,
        method: "GET",
      }),
      providesTags: (result, error, id) => [{ type: "PostDetail", id }],
    }),
    moderatePost: builder.mutation({
      query: ({ id, ...body }) => ({
        url: `/admin/posts/${id}/moderation`,
        method: "PATCH",
        data: body,
      }),
      invalidatesTags: (result, error, { id }) => [
        "Posts",
        { type: "PostDetail", id },
        "Dashboard",
        "Reports",
      ],
    }),
    getProducts: builder.query({
      query: (params) => ({
        url: "/admin/products",
        method: "GET",
        params,
      }),
      providesTags: ["Products"],
      async onCacheEntryAdded(arg, { updateCachedData, cacheDataLoaded, cacheEntryRemoved }) {
        try {
          await cacheDataLoaded;
          const { default: socketClient } = await import("@/utils/socketClient");
          const channel = socketClient.subscribe("admin-products");

          channel.bind("product.created", ({ product }) => {
            updateCachedData((draft) => {
              if (!draft?.data?.items || !product) return;
              if (draft.data.items.some((item) => item.id === product.id)) return;
              draft.data.items.unshift(product);
            });
          });

          channel.bind("product.updated", ({ product }) => {
            updateCachedData((draft) => {
              if (!draft?.data?.items || !product) return;
              const idx = draft.data.items.findIndex((item) => item.id === product.id);
              if (idx !== -1) {
                draft.data.items[idx] = { ...draft.data.items[idx], ...product };
              }
            });
          });

          channel.bind("product.deleted", ({ productId }) => {
            updateCachedData((draft) => {
              if (!draft?.data?.items) return;
              draft.data.items = draft.data.items.filter((item) => item.id !== productId);
            });
          });

          await cacheEntryRemoved;
          channel.unbind_all();
          socketClient.unsubscribe("admin-products");
        } catch (err) {
          console.error("Error in onCacheEntryAdded for getProducts:", err);
        }
      },
    }),
    getProductDetail: builder.query({
      query: (id) => ({
        url: `/admin/products/${id}`,
        method: "GET",
      }),
      providesTags: (result, error, id) => [{ type: "ProductDetail", id }],
    }),
    getProductCategories: builder.query({
      query: () => ({
        url: "/product-categories",
        method: "GET",
      }),
      providesTags: ["ProductCategories"],
    }),
    getProductBrands: builder.query({
      query: () => ({
        url: "/admin/products/brands",
        method: "GET",
      }),
      providesTags: ["ProductBrands"],
    }),
    createProduct: builder.mutation({
      query: (formData) => ({
        url: "/admin/products",
        method: "POST",
        data: formData,
      }),
      invalidatesTags: ["Products", "Dashboard"],
    }),
    updateProduct: builder.mutation({
      query: ({ id, formData }) => ({
        url: `/admin/products/${id}`,
        method: "PATCH",
        data: formData,
      }),
      invalidatesTags: (result, error, { id }) => [
        "Products",
        { type: "ProductDetail", id },
        "Dashboard",
      ],
    }),
    updateProductStatus: builder.mutation({
      query: ({ id, action }) => ({
        url: `/admin/products/${id}/status`,
        method: "PATCH",
        data: { action },
      }),
      invalidatesTags: (result, error, { id }) => [
        "Products",
        { type: "ProductDetail", id },
        "Dashboard",
      ],
    }),
    deleteProduct: builder.mutation({
      query: (id) => ({
        url: `/admin/products/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Products", "Dashboard"],
    }),
    getAdminWorkoutPrograms: builder.query({
      query: (params) => ({
        url: "/admin/workout-programs",
        method: "GET",
        params,
      }),
      providesTags: ["WorkoutPrograms"],
      async onCacheEntryAdded(arg, { updateCachedData, cacheDataLoaded, cacheEntryRemoved }) {
        try {
          await cacheDataLoaded;
          const { default: socketClient } = await import("@/utils/socketClient");
          const channel = socketClient.subscribe("admin-workout-programs");

          channel.bind("program.created", ({ program }) => {
            updateCachedData((draft) => {
              if (!draft?.data?.items || !program) return;
              if (draft.data.items.some((item) => item.id === program.id)) return;
              draft.data.items.unshift(program);
            });
          });

          channel.bind("program.updated", ({ program }) => {
            updateCachedData((draft) => {
              if (!draft?.data?.items || !program) return;
              const idx = draft.data.items.findIndex((item) => item.id === program.id);
              if (idx !== -1) {
                draft.data.items[idx] = { ...draft.data.items[idx], ...program };
              }
            });
          });

          channel.bind("program.deleted", ({ programId }) => {
            updateCachedData((draft) => {
              if (!draft?.data?.items) return;
              draft.data.items = draft.data.items.filter((item) => item.id !== programId);
            });
          });

          await cacheEntryRemoved;
          channel.unbind_all();
          socketClient.unsubscribe("admin-workout-programs");
        } catch (err) {
          console.error("Error in onCacheEntryAdded for getAdminWorkoutPrograms:", err);
        }
      },
    }),
    getWorkoutProgramFilters: builder.query({
      query: () => ({
        url: "/admin/workout-programs/distinct-filters",
        method: "GET",
      }),
      providesTags: ["WorkoutProgramFilters"],
    }),
    getAdminWorkoutProgramDetail: builder.query({
      query: (id) => ({
        url: `/admin/workout-programs/${id}`,
        method: "GET",
      }),
      providesTags: (result, error, id) => [{ type: "WorkoutProgramDetail", id }],
    }),
    createWorkoutProgram: builder.mutation({
      query: (formData) => ({
        url: "/admin/workout-programs",
        method: "POST",
        data: formData,
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }),
      invalidatesTags: ["WorkoutPrograms", "WorkoutProgramFilters", "Dashboard"],
    }),
    updateWorkoutProgram: builder.mutation({
      query: ({ id, formData }) => ({
        url: `/admin/workout-programs/${id}`,
        method: "PATCH",
        data: formData,
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }),
      invalidatesTags: (result, error, { id }) => [
        "WorkoutPrograms",
        { type: "WorkoutProgramDetail", id },
        "WorkoutProgramFilters",
        "Dashboard",
      ],
    }),
    updateWorkoutProgramStatus: builder.mutation({
      query: ({ id, action }) => ({
        url: `/admin/workout-programs/${id}/status`,
        method: "PATCH",
        data: { action },
      }),
      invalidatesTags: (result, error, { id }) => [
        "WorkoutPrograms",
        { type: "WorkoutProgramDetail", id },
        "Dashboard",
      ],
    }),
    deleteWorkoutProgram: builder.mutation({
      query: (id) => ({
        url: `/admin/workout-programs/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["WorkoutPrograms", "WorkoutProgramFilters", "Dashboard"],
    }),
    addWorkoutProgramDay: builder.mutation({
      query: ({ id, ...body }) => ({
        url: `/admin/workout-programs/${id}/days`,
        method: "POST",
        data: body,
      }),
      invalidatesTags: (result, error, { id }) => [
        "WorkoutPrograms",
        { type: "WorkoutProgramDetail", id: id },
      ],
    }),
    updateWorkoutProgramDay: builder.mutation({
      query: ({ id, dayId, ...body }) => ({
        url: `/admin/workout-programs/${id}/days/${dayId}`,
        method: "PATCH",
        data: body,
      }),
      invalidatesTags: (result, error, { id }) => [
        "WorkoutPrograms",
        { type: "WorkoutProgramDetail", id: id },
      ],
    }),
    deleteWorkoutProgramDay: builder.mutation({
      query: ({ id, dayId }) => ({
        url: `/admin/workout-programs/${id}/days/${dayId}`,
        method: "DELETE",
      }),
      invalidatesTags: (result, error, { id }) => [
        "WorkoutPrograms",
        { type: "WorkoutProgramDetail", id: id },
      ],
    }),
    addWorkoutProgramExercise: builder.mutation({
      query: ({ id, dayId, ...body }) => ({
        url: `/admin/workout-programs/${id}/days/${dayId}/exercises`,
        method: "POST",
        data: body,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: "WorkoutProgramDetail", id: id },
      ],
    }),
    updateWorkoutProgramExercise: builder.mutation({
      query: ({ id, dayId, templateExerciseId, ...body }) => ({
        url: `/admin/workout-programs/${id}/days/${dayId}/exercises/${templateExerciseId}`,
        method: "PATCH",
        data: body,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: "WorkoutProgramDetail", id: id },
      ],
    }),
    deleteWorkoutProgramExercise: builder.mutation({
      query: ({ id, dayId, templateExerciseId }) => ({
        url: `/admin/workout-programs/${id}/days/${dayId}/exercises/${templateExerciseId}`,
        method: "DELETE",
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: "WorkoutProgramDetail", id: id },
      ],
    }),
    getAdminExercises: builder.query({
      query: (params) => ({
        url: "/admin/workout-programs/exercises",
        method: "GET",
        params,
      }),
      providesTags: ["Exercises"],
    }),
    getMuscleGroups: builder.query({
      query: () => ({
        url: "/muscle-groups",
        method: "GET",
      }),
    }),
    getExercisesList: builder.query({
      query: (params) => ({
        url: "/admin/exercises",
        method: "GET",
        params,
      }),
      providesTags: ["Exercises"],
      async onCacheEntryAdded(arg, { updateCachedData, cacheDataLoaded, cacheEntryRemoved }) {
        try {
          await cacheDataLoaded;
          const { default: socketClient } = await import("@/utils/socketClient");
          const channel = socketClient.subscribe("admin-exercises");

          channel.bind("exercise.created", ({ exercise }) => {
            updateCachedData((draft) => {
              if (!draft?.data?.items || !exercise) return;
              if (draft.data.items.some((item) => item.id === exercise.id)) return;
              draft.data.items.unshift(exercise);
            });
          });

          channel.bind("exercise.updated", ({ exercise }) => {
            updateCachedData((draft) => {
              if (!draft?.data?.items || !exercise) return;
              const idx = draft.data.items.findIndex((item) => item.id === exercise.id);
              if (idx !== -1) {
                draft.data.items[idx] = { ...draft.data.items[idx], ...exercise };
              }
            });
          });

          channel.bind("exercise.deleted", ({ exerciseId }) => {
            updateCachedData((draft) => {
              if (!draft?.data?.items) return;
              draft.data.items = draft.data.items.filter((item) => item.id !== exerciseId);
            });
          });

          await cacheEntryRemoved;
          channel.unbind_all();
          socketClient.unsubscribe("admin-exercises");
        } catch (err) {
          console.error("Error in onCacheEntryAdded for getExercisesList:", err);
        }
      },
    }),
    getExerciseDetail: builder.query({
      query: (id) => ({
        url: `/admin/exercises/${id}`,
        method: "GET",
      }),
      providesTags: (result, error, id) => [{ type: "ExerciseDetail", id }],
    }),
    createExercise: builder.mutation({
      query: (formData) => ({
        url: "/admin/exercises",
        method: "POST",
        data: formData,
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }),
      invalidatesTags: ["Exercises"],
    }),
    updateExercise: builder.mutation({
      query: ({ id, formData }) => ({
        url: `/admin/exercises/${id}`,
        method: "PATCH",
        data: formData,
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }),
      invalidatesTags: (result, error, { id }) => [
        "Exercises",
        { type: "ExerciseDetail", id },
      ],
    }),
    deleteExercise: builder.mutation({
      query: (id) => ({
        url: `/admin/exercises/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Exercises"],
    }),
  }),
});

export const {
  useGetDashboardQuery,
  useGetUsersQuery,
  useGetUserDetailQuery,
  useUpdateUserStatusMutation,
  useUpdateUserRoleMutation,
  useGetReportsQuery,
  useGetReportDetailQuery,
  useResolveReportMutation,
  useGetPostsQuery,
  useGetPostDetailQuery,
  useModeratePostMutation,
  useGetProductsQuery,
  useGetProductDetailQuery,
  useGetProductCategoriesQuery,
  useGetProductBrandsQuery,
  useCreateProductMutation,
  useUpdateProductMutation,
  useUpdateProductStatusMutation,
  useDeleteProductMutation,
  useGetAdminWorkoutProgramsQuery,
  useGetWorkoutProgramFiltersQuery,
  useGetAdminWorkoutProgramDetailQuery,
  useCreateWorkoutProgramMutation,
  useUpdateWorkoutProgramMutation,
  useUpdateWorkoutProgramStatusMutation,
  useDeleteWorkoutProgramMutation,
  useAddWorkoutProgramDayMutation,
  useUpdateWorkoutProgramDayMutation,
  useDeleteWorkoutProgramDayMutation,
  useAddWorkoutProgramExerciseMutation,
  useUpdateWorkoutProgramExerciseMutation,
  useDeleteWorkoutProgramExerciseMutation,
  useGetAdminExercisesQuery,
  useGetMuscleGroupsQuery,
  useGetExercisesListQuery,
  useGetExerciseDetailQuery,
  useCreateExerciseMutation,
  useUpdateExerciseMutation,
  useDeleteExerciseMutation,
} = adminApi;
export default adminApi;


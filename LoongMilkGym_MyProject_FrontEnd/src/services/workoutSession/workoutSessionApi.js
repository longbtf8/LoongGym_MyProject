import { createApi } from "@reduxjs/toolkit/query/react";
import { axiosBaseQuery } from "../baseQuery";

export const workoutSessionApi = createApi({
  reducerPath: "workoutSessionApi",
  baseQuery: axiosBaseQuery({
    baseUrl: import.meta.env.VITE_API_BASE_URL,
  }),
  tagTypes: ["WorkoutSession"],

  endpoints: (builder) => ({
    startSession: builder.mutation({
      query: (data) => ({
        url: "/workout-sessions/start",
        method: "POST",
        data,
      }),
      invalidatesTags: ["WorkoutSession"],
    }),
    getSession: builder.query({
      query: (id) => ({
        url: `/workout-sessions/${id}`,
        method: "GET",
      }),
      providesTags: (result, error, id) => [{ type: "WorkoutSession", id }],
    }),
    addSet: builder.mutation({
      query: ({ sessionId, sessionExerciseId, data }) => ({
        url: `/workout-sessions/${sessionId}/exercises/${sessionExerciseId}/sets`,
        method: "POST",
        data,
      }),
      invalidatesTags: (result, error, { sessionId }) => [{ type: "WorkoutSession", id: sessionId }],
    }),
    updateSet: builder.mutation({
      query: ({ setId, sessionId, data }) => ({
        url: `/workout-sets/${setId}`,
        method: "PATCH",
        data,
      }),
      invalidatesTags: (result, error, { sessionId }) => [{ type: "WorkoutSession", id: sessionId }],
    }),
    completeSession: builder.mutation({
      query: ({ sessionId, data }) => ({
        url: `/workout-sessions/${sessionId}/complete`,
        method: "POST",
        data,
      }),
      invalidatesTags: ["WorkoutSession"],
    }),
  }),
});

export const {
  useStartSessionMutation,
  useGetSessionQuery,
  useLazyGetSessionQuery,
  useAddSetMutation,
  useUpdateSetMutation,
  useCompleteSessionMutation,
} = workoutSessionApi;

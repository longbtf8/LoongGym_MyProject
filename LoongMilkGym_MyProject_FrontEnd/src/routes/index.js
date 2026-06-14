import React, { lazy } from "react";
import paths from "@/config/path";

// Pages statically imported for instantaneous entry (Trang chủ và Đăng nhập/Đăng ký tải tức thì)
import Home from "@/pages/home";
import Login from "@/pages/auth/login";
import Register from "@/pages/auth/register";

// Pages lazily loaded to save massive initial bundle size (Tải chậm để giảm dung lượng file bundle ban đầu)
const ForgotPassword = lazy(() => import("@/pages/auth/forgotPassword"));
const ResetPassword = lazy(() => import("@/pages/auth/resetPassword"));
const VerifyEmail = lazy(() => import("@/pages/auth/verifyEmail"));
const Profile = lazy(() => import("@/pages/account/profile/index.jsx"));
const NotFound = lazy(() => import("@/pages/notFound"));
const Exercises = lazy(() => import("@/pages/exercises/index.jsx"));
const ExerciseDetail = lazy(() => import("@/pages/exercises/detail/index.jsx"));
const Dashboard = lazy(() => import("@/pages/dashboard/index.jsx"));
const MyPlan = lazy(() => import("@/pages/myPlan/index.jsx"));
const TodayWorkout = lazy(() => import("@/pages/todayWorkout/index.jsx"));
const Nutrition = lazy(() => import("@/pages/nutrition/index.jsx"));
const Recovery = lazy(() => import("@/pages/recovery/index.jsx"));
const AICoach = lazy(() => import("@/pages/aiCoach/index.jsx"));

// Layouts
import DefaultLayout from "@/layouts/DefaultLayout";
import AuthLayout from "@/layouts/AuthLayout";
import MessageLayout from "@/layouts/MessageLayout";

// Guards
import AuthGuard from "@/components/Guards/AuthGuard";
import GuestGuard from "@/components/Guards/GuestGuard";

// Public Routes (Ai cũng xem được)
const publicRoutes = [
  { path: paths.home, component: Home, layout: DefaultLayout },
  { path: paths.login, component: Login, layout: AuthLayout, guard: GuestGuard },
  { path: paths.register, component: Register, layout: AuthLayout, guard: GuestGuard },
  { path: paths.forgotPassword, component: ForgotPassword, layout: AuthLayout, guard: GuestGuard },
  { path: paths.resetPassword, component: ResetPassword, layout: AuthLayout },
  { path: paths.verifyEmail, component: VerifyEmail, layout: MessageLayout, guard: GuestGuard },
  { path: paths.exercises, component: Exercises, layout: DefaultLayout },
  { path: paths.exerciseDetail, component: ExerciseDetail, layout: DefaultLayout },
  { path: "*", component: NotFound, layout: null },
];

// Private Routes (Bắt buộc phải đăng nhập, tự động bảo vệ bởi AuthGuard)
const privateRoutes = [
  { path: paths.profile, component: Profile, layout: DefaultLayout, guard: AuthGuard },
  { path: paths.dashboard, component: Dashboard, layout: DefaultLayout, guard: AuthGuard },
  { path: paths.myPlan, component: MyPlan, layout: DefaultLayout, guard: AuthGuard },
  { path: paths.todayWorkout, component: TodayWorkout, layout: DefaultLayout, guard: AuthGuard },
  { path: paths.nutrition, component: Nutrition, layout: DefaultLayout, guard: AuthGuard },
  { path: paths.recovery, component: Recovery, layout: DefaultLayout, guard: AuthGuard },
  { path: paths.aiCoach, component: AICoach, layout: DefaultLayout, guard: AuthGuard },
];

export { publicRoutes, privateRoutes };

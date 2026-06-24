import React, { lazy } from "react";
import paths from "@/config/path";

// Guards
import AuthGuard from "@/components/Guards/AuthGuard";
import GuestGuard from "@/components/Guards/GuestGuard";

// Layouts
import { AdminLayout, AuthLayout } from "@/layouts";

// Pages
import Dashboard from "@/pages/dashboard";
import Login from "@/pages/auth/login";

const Users = lazy(() => import("@/pages/users"));
const Posts = lazy(() => import("@/pages/posts"));
const Reports = lazy(() => import("@/pages/reports"));
const Products = lazy(() => import("@/pages/products"));
const WorkoutPrograms = lazy(() => import("@/pages/workoutPrograms"));
const Exercises = lazy(() => import("@/pages/exercises"));
const Forbidden = lazy(() => import("@/pages/forbidden"));
const NotFound = lazy(() => import("@/pages/notFound"));

// Public Routes
const publicRoutes = [
  { path: paths.LOGIN, component: Login, layout: AuthLayout, guard: GuestGuard },
  { path: paths.FORBIDDEN, component: Forbidden, layout: null, guard: null },
  { path: paths.NOT_FOUND, component: NotFound, layout: null, guard: null },
];

// Private Routes (Protected by AuthGuard)
const privateRoutes = [
  { path: paths.DASHBOARD, component: Dashboard, layout: AdminLayout, guard: AuthGuard },
  { path: paths.USERS, component: Users, layout: AdminLayout, guard: AuthGuard },
  { path: paths.POSTS, component: Posts, layout: AdminLayout, guard: AuthGuard },
  { path: paths.REPORTS, component: Reports, layout: AdminLayout, guard: AuthGuard },
  { path: paths.PRODUCTS, component: Products, layout: AdminLayout, guard: AuthGuard },
  { path: paths.WORKOUT_PROGRAMS, component: WorkoutPrograms, layout: AdminLayout, guard: AuthGuard },
  { path: paths.EXERCISES, component: Exercises, layout: AdminLayout, guard: AuthGuard },
];

export { publicRoutes, privateRoutes };

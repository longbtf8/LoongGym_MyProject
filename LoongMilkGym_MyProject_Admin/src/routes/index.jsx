import React, { lazy } from "react";
import paths from "@/config/path";

// Pages
import Dashboard from "@/pages/dashboard";
import Login from "@/pages/auth/login";

const Users = lazy(() => import("@/pages/users"));
const Exercises = lazy(() => import("@/pages/exercises"));
const Store = lazy(() => import("@/pages/store"));
const Orders = lazy(() => import("@/pages/orders"));
const Community = lazy(() => import("@/pages/community"));
const Settings = lazy(() => import("@/pages/settings"));
const NotFound = lazy(() => import("@/pages/notFound"));

// Layouts
import { DefaultLayout, AuthLayout } from "@/layouts";

// Guards
import AuthGuard from "@/components/Guards/AuthGuard";
import GuestGuard from "@/components/Guards/GuestGuard";

// Public Routes
const publicRoutes = [
  { path: paths.login, component: Login, layout: AuthLayout, guard: GuestGuard },
  { path: "*", component: NotFound, layout: null },
];

// Private Routes (Protected by AuthGuard)
const privateRoutes = [
  { path: paths.dashboard, component: Dashboard, layout: DefaultLayout, guard: AuthGuard },
  { path: paths.users, component: Users, layout: DefaultLayout, guard: AuthGuard },
  { path: paths.exercises, component: Exercises, layout: DefaultLayout, guard: AuthGuard },
  { path: paths.store, component: Store, layout: DefaultLayout, guard: AuthGuard },
  { path: paths.orders, component: Orders, layout: DefaultLayout, guard: AuthGuard },
  { path: paths.community, component: Community, layout: DefaultLayout, guard: AuthGuard },
  { path: paths.settings, component: Settings, layout: DefaultLayout, guard: AuthGuard },
];

export { publicRoutes, privateRoutes };

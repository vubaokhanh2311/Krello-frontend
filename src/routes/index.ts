import { lazy } from "react";
import { HeaderOnly } from "../components/Layout";

const Home = lazy(() => import("../pages/Home/index"));
const Board = lazy(() => import("../pages/Board/index"));
const Profile = lazy(() => import("../pages/Profile/index"));
const Login = lazy(() => import("../pages/Auth/Login/index"));
const Register = lazy(() => import("../pages/Auth/Register/index"));
const BoardDetail = lazy(() => import("../pages/BoardDetail/index"));
const InvitationPage = lazy(() => import("../components/Board/InvitationPage"));
const ForgotPassword = lazy(() => import("../pages/Auth/ForgotPassword"));
const ResetPassword = lazy(() => import("../pages/Auth/ResetPassword"));

export interface AppRoute {
  path: string;
  component: React.ComponentType;
  layout?: React.ComponentType<{ children: React.ReactNode }> | null;
}

export const publicRoute: AppRoute[] = [
  {
    path: "/login",
    component: Login,
    layout: null,
  },
  {
    path: "/register",
    component: Register,
    layout: null,
  },
  {
    path: "/boards/invite/accept",
    component: InvitationPage,
    layout: null,
  },
  {
    path: "/forgot-password",
    component: ForgotPassword,
    layout: null,
  },
  {
    path: "/reset-password",
    component: ResetPassword,
    layout: null,
  },
];

export const privateRoute: AppRoute[] = [
  {
    path: "/",
    component: Home,
  },
  {
    path: "/board",
    component: Board,
  },
  {
    path: "/board/:id",
    component: BoardDetail,
    layout: HeaderOnly,
  },
  {
    path: "/profile",
    component: Profile,
    layout: HeaderOnly,
  },
];

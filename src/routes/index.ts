import Home from "../pages/Home/index";
import Board from "../pages/Board/index";
import Profile from "../pages/Profile/index";
import Login from "../pages/Auth/Login/index";
import Register from "../pages/Auth/Register/index";
import BoardDetail from "../pages/BoardDetail/index";
import { HeaderOnly } from "../components/Layout";
import InvitationPage from "../components/Board/InvitationPage";
import ForgotPassword from "../pages/Auth/ForgotPassword";
import ResetPassword from "../pages/Auth/ResetPassword";

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
    path: "boards/invite/accept",
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

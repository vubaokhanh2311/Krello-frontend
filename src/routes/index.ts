import Home from "../pages/Home/index";
import Board from "../pages/Board/index";
import Profile from "../pages/Profile/index";
import Login from "../pages/Auth/Login/index";

import { HeaderOnly } from "../components/Layout";

export interface AppRoute {
  path: string;
  component: React.ComponentType;
  layout?: React.ComponentType<{ children: React.ReactNode }> | null;
}

export const publicRoute: AppRoute[] = [
  {
    path: "/",
    component: Home,
  },
  {
    path: "/board",
    component: Board,
    layout: null,
  },
  {
    path: "/profile",
    component: Profile,
    layout: HeaderOnly,
  },
  {
    path: "/login",
    component: Login,
    layout: null,
  },
];

export const privateRoute: AppRoute[] = [];

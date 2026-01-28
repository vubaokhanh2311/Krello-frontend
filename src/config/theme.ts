import NProgress from "nprogress";
import "nprogress/nprogress.css";

export function configureNProgress() {
  NProgress.configure({
    showSpinner: false,
    trickleSpeed: 200,
    minimum: 0.1,
  });

  return NProgress;
}

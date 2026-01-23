import type { NavigateFunction } from "react-router-dom";


export const redirectAfterLogin = (navigate: NavigateFunction): void => {
  const redirectPath = localStorage.getItem("redirectAfterLogin");
  const inviteToken = localStorage.getItem("inviteToken");

  localStorage.removeItem("redirectAfterLogin");
  localStorage.removeItem("inviteToken");

  if (redirectPath) {
   
    navigate(redirectPath, { replace: true });
  } else if (inviteToken) {
   
    navigate(`/invite?token=${inviteToken}`, { replace: true });
  } else {
    navigate("/", { replace: true });
  }
};


export const saveRedirectPath = (path: string): void => {
  localStorage.setItem("redirectAfterLogin", path);
};


export const saveInviteToken = (token: string): void => {
  localStorage.setItem("inviteToken", token);
};


export const clearRedirectData = (): void => {
  localStorage.removeItem("redirectAfterLogin");
  localStorage.removeItem("inviteToken");
};

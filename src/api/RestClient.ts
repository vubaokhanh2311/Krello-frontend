import axios from "axios";
import type {
  AxiosInstance,
  AxiosRequestConfig,
  AxiosResponse,
  AxiosError,
  InternalAxiosRequestConfig,
} from "axios";
import { toast } from "react-toastify";

const API_BASE_URL = `${import.meta.env.VITE_URL_API}/api`;

interface ApiError {
  message: string;
  statusCode?: number;
  errors?: Record<string, string[]>;
}

interface RefreshTokenResponse {
  accessToken: string;
  refreshToken: string;
}

class RestClient {
  private client: AxiosInstance;
  private isRefreshing = false;
  private failedQueue: Array<{
    resolve: (value?: any) => void;
    reject: (reason?: any) => void;
  }> = [];

  constructor() {
    this.client = axios.create({
      baseURL: API_BASE_URL,
      timeout: 30000,
      headers: {
        "Content-Type": "application/json",
      },
    });

    this.setupInterceptors();
  }

  private isRemember(): boolean {
    return !!localStorage.getItem("refreshToken");
  }

  getToken() {
    return (
      sessionStorage.getItem("accessToken") ||
      localStorage.getItem("accessToken")
    );
  }

  getRefreshToken() {
    return (
      sessionStorage.getItem("refreshToken") ||
      localStorage.getItem("refreshToken")
    );
  }

  setToken(token: string) {
    localStorage.removeItem("accessToken");
    sessionStorage.removeItem("accessToken");

    if (this.isRemember()) {
      localStorage.setItem("accessToken", token);
    } else {
      sessionStorage.setItem("accessToken", token);
    }
  }

  setRefreshToken(token: string) {
    localStorage.removeItem("refreshToken");
    sessionStorage.removeItem("refreshToken");

    if (this.isRemember()) {
      localStorage.setItem("refreshToken", token);
    } else {
      sessionStorage.setItem("refreshToken", token);
    }
  }

  clearTokens() {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    sessionStorage.removeItem("accessToken");
    sessionStorage.removeItem("refreshToken");
  }

  private setupInterceptors() {
    this.client.interceptors.request.use(
      (config: InternalAxiosRequestConfig) => {
        const token = this.getToken();
        if (token && config.headers) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error),
    );

    this.client.interceptors.response.use(
      (response: AxiosResponse) => response,
      async (error: AxiosError<ApiError>) => {
        const originalRequest = error.config as InternalAxiosRequestConfig & {
          _retry?: boolean;
        };

        const isAuthEndpoint =
          originalRequest.url?.includes("/auth/login") ||
          originalRequest.url?.includes("/auth/register") ||
          originalRequest.url?.includes("/auth/refresh-token");

        if (
          error.response?.status === 401 &&
          !originalRequest._retry &&
          !isAuthEndpoint
        ) {
          if (this.isRefreshing) {
            return new Promise((resolve, reject) => {
              this.failedQueue.push({ resolve, reject });
            }).then((token) => {
              if (originalRequest.headers) {
                originalRequest.headers.Authorization = `Bearer ${token}`;
              }
              return this.client(originalRequest);
            });
          }

          originalRequest._retry = true;
          this.isRefreshing = true;

          try {
            const newToken = await this.refreshAccessToken();
            this.processQueue(null, newToken);

            if (originalRequest.headers) {
              originalRequest.headers.Authorization = `Bearer ${newToken}`;
            }

            return this.client(originalRequest);
          } catch (refreshError) {
            this.processQueue(refreshError, null);
            this.handleLogout();
            return Promise.reject(refreshError);
          } finally {
            this.isRefreshing = false;
          }
        }

        return Promise.reject(this.handleError(error));
      },
    );
  }

  private processQueue(error: any, token: string | null) {
    this.failedQueue.forEach((p) => {
      if (error) p.reject(error);
      else p.resolve(token);
    });
    this.failedQueue = [];
  }

  private async refreshAccessToken(): Promise<string> {
    const refreshToken = this.getRefreshToken();
    if (!refreshToken) {
      throw new Error("No refresh token");
    }

    const response = await axios.post<RefreshTokenResponse>(
      `${API_BASE_URL}/auth/refresh-token`,
      { refreshToken },
    );

    const { accessToken, refreshToken: newRefreshToken } = response.data;

    this.setToken(accessToken);
    this.setRefreshToken(newRefreshToken);

    this.client.defaults.headers.common.Authorization = `Bearer ${accessToken}`;

    return accessToken;
  }

  private handleLogout() {
    this.clearTokens();
    toast.error("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại!");

    setTimeout(() => {
      window.location.href = "/login";
    }, 1500);
  }

  private handleError(error: AxiosError<ApiError>): ApiError {
    if (error.response) {
      return {
        message: error.response.data?.message || "Có lỗi xảy ra",
        statusCode: error.response.status,
        errors: error.response.data?.errors,
      };
    }

    if (error.code === "ECONNABORTED") {
      return { message: "Request timeout", statusCode: 0 };
    }

    return {
      message: "Không thể kết nối server",
      statusCode: 0,
    };
  }

  async get<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    return (await this.client.get<T>(url, config)).data;
  }

  async post<T>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig,
  ): Promise<T> {
    return (await this.client.post<T>(url, data, config)).data;
  }

  async put<T>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig,
  ): Promise<T> {
    return (await this.client.put<T>(url, data, config)).data;
  }

  async patch<T>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig,
  ): Promise<T> {
    return (await this.client.patch<T>(url, data, config)).data;
  }

  async delete<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    return (await this.client.delete<T>(url, config)).data;
  }
}

export default new RestClient();

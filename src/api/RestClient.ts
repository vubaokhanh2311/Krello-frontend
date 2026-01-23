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

  private getStorage(): Storage {
    return localStorage.getItem("rememberMe") === "true"
      ? localStorage
      : sessionStorage;
  }

  private getOppositeStorage(): Storage {
    return this.getStorage() === localStorage ? sessionStorage : localStorage;
  }

  setRememberMe(remember: boolean): void {
    if (remember) {
      localStorage.setItem("rememberMe", "true");
    } else {
      localStorage.removeItem("rememberMe");
    }
  }

  isRememberMe(): boolean {
    return localStorage.getItem("rememberMe") === "true";
  }

  getToken(): string | null {
    const storage = this.getStorage();
    return storage.getItem("accessToken");
  }

  getRefreshToken(): string | null {
    const storage = this.getStorage();
    return storage.getItem("refreshToken");
  }

  setToken(token: string): void {
    const storage = this.getStorage();
    const oppositeStorage = this.getOppositeStorage();

    oppositeStorage.removeItem("accessToken");

    storage.setItem("accessToken", token);
  }

  setRefreshToken(token: string): void {
    const storage = this.getStorage();
    const oppositeStorage = this.getOppositeStorage();

    oppositeStorage.removeItem("refreshToken");

    storage.setItem("refreshToken", token);
  }

  setTokens(accessToken: string, refreshToken: string): void {
    this.setToken(accessToken);
    this.setRefreshToken(refreshToken);
  }

  clearTokens(): void {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("rememberMe");
    sessionStorage.removeItem("accessToken");
    sessionStorage.removeItem("refreshToken");
  }

  private setupInterceptors(): void {
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
            })
              .then((token) => {
                if (originalRequest.headers) {
                  originalRequest.headers.Authorization = `Bearer ${token}`;
                }
                return this.client(originalRequest);
              })
              .catch((err) => Promise.reject(err));
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

  private processQueue(error: any, token: string | null): void {
    this.failedQueue.forEach((promise) => {
      if (error) {
        promise.reject(error);
      } else {
        promise.resolve(token);
      }
    });
    this.failedQueue = [];
  }

  private async refreshAccessToken(): Promise<string> {
    const refreshToken = this.getRefreshToken();

    if (!refreshToken) {
      throw new Error("No refresh token available");
    }

    try {
      const response = await axios.post<RefreshTokenResponse>(
        `${API_BASE_URL}/auth/refresh-token`,
        { refreshToken },
        { timeout: 10000 },
      );

      const { accessToken, refreshToken: newRefreshToken } = response.data;

      this.setTokens(accessToken, newRefreshToken);

      this.client.defaults.headers.common.Authorization = `Bearer ${accessToken}`;

      return accessToken;
    } catch (error) {
      console.error("Refresh token failed:", error);
      throw error;
    }
  }

  private handleLogout(): void {
    this.clearTokens();

    toast.error("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại!", {
      autoClose: 2000,
    });

    window.dispatchEvent(new CustomEvent("auth:logout"));

    setTimeout(() => {
      window.location.href = "/login";
    }, 1500);
  }

  private handleError(error: AxiosError<ApiError>): ApiError {
    if (error.response) {
      const message =
        error.response.data?.message ||
        `Lỗi ${error.response.status}: ${error.response.statusText}`;

      return {
        message,
        statusCode: error.response.status,
        errors: error.response.data?.errors,
      };
    }

    if (error.code === "ECONNABORTED") {
      return {
        message: "Yêu cầu bị timeout. Vui lòng thử lại!",
        statusCode: 0,
      };
    }

    if (error.message === "Network Error") {
      return {
        message: "Lỗi kết nối mạng. Vui lòng kiểm tra internet!",
        statusCode: 0,
      };
    }

    return {
      message: error.message || "Có lỗi không xác định xảy ra",
      statusCode: 0,
    };
  }

  async get<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.get<T>(url, config);
    return response.data;
  }

  async post<T>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig,
  ): Promise<T> {
    const response = await this.client.post<T>(url, data, config);
    return response.data;
  }

  async put<T>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig,
  ): Promise<T> {
    const response = await this.client.put<T>(url, data, config);
    return response.data;
  }

  async patch<T>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig,
  ): Promise<T> {
    const response = await this.client.patch<T>(url, data, config);
    return response.data;
  }

  async delete<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.delete<T>(url, config);
    return response.data;
  }
}

export default new RestClient();

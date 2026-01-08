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

  private setupInterceptors() {
    this.client.interceptors.request.use(
      (config: InternalAxiosRequestConfig) => {
        const token = this.getToken();
        if (token && config.headers) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error: AxiosError) => {
        return Promise.reject(error);
      }
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
          originalRequest.url?.includes("/auth/refresh");

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
              .catch((err) => {
                return Promise.reject(err);
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
      }
    );
  }

  private processQueue(error: any, token: string | null = null) {
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
        `${API_BASE_URL}/auth/refresh`,
        { refreshToken }
      );

      const { accessToken } = response.data;
      this.setToken(accessToken);
      return accessToken;
    } catch (error) {
      this.clearTokens();
      throw error;
    }
  }

  private handleLogout() {
    this.clearTokens();
    toast.error("Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại!");

    setTimeout(() => {
      window.location.href = "/login";
    }, 1500);
  }

  private handleError(error: AxiosError<ApiError>): ApiError {
    if (error.response) {
      const { status, data } = error.response;

      switch (status) {
        case 400:
          return {
            message: data.message || "Dữ liệu không hợp lệ",
            statusCode: status,
            errors: data.errors,
          };

        case 401:
          return {
            message: data.message || "Email hoặc mật khẩu không chính xác",
            statusCode: status,
          };

        case 403:
          return {
            message:
              data.message || "Bạn không có quyền thực hiện hành động này",
            statusCode: status,
          };

        case 404:
          return {
            message: data.message || "Không tìm thấy dữ liệu",
            statusCode: status,
          };

        case 409:
          return {
            message: data.message || "Dữ liệu đã tồn tại",
            statusCode: status,
          };

        case 422:
          return {
            message: data.message || "Không thể xử lý dữ liệu",
            statusCode: status,
            errors: data.errors,
          };

        case 429:
          return {
            message: "Bạn đã gửi quá nhiều yêu cầu. Vui lòng thử lại sau!",
            statusCode: status,
          };

        case 500:
          return {
            message: "Lỗi server. Vui lòng thử lại sau!",
            statusCode: status,
          };

        case 503:
          return {
            message: "Dịch vụ tạm thời không khả dụng. Vui lòng thử lại sau!",
            statusCode: status,
          };

        default:
          return {
            message: data.message || "Có lỗi xảy ra. Vui lòng thử lại!",
            statusCode: status,
          };
      }
    } else if (error.request) {
      if (error.code === "ECONNABORTED") {
        return {
          message: "Yêu cầu quá thời gian chờ. Vui lòng thử lại!",
          statusCode: 0,
        };
      }
      return {
        message:
          "Không thể kết nối đến server. Vui lòng kiểm tra kết nối mạng!",
        statusCode: 0,
      };
    } else {
      return {
        message: error.message || "Có lỗi xảy ra khi gửi yêu cầu",
        statusCode: 0,
      };
    }
  }

  getToken(): string | null {
    return localStorage.getItem("accessToken");
  }

  getRefreshToken(): string | null {
    return localStorage.getItem("refreshToken");
  }

  setToken(token: string): void {
    localStorage.setItem("accessToken", token);
  }

  setRefreshToken(token: string): void {
    localStorage.setItem("refreshToken", token);
  }

  clearTokens(): void {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
  }

  async get<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response: AxiosResponse<T> = await this.client.get(url, config);
    return response.data;
  }

  async post<T>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig
  ): Promise<T> {
    const response: AxiosResponse<T> = await this.client.post(
      url,
      data,
      config
    );
    return response.data;
  }

  async put<T>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig
  ): Promise<T> {
    const response: AxiosResponse<T> = await this.client.put(url, data, config);
    return response.data;
  }

  async patch<T>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig
  ): Promise<T> {
    const response: AxiosResponse<T> = await this.client.patch(
      url,
      data,
      config
    );
    return response.data;
  }

  async delete<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response: AxiosResponse<T> = await this.client.delete(url, config);
    return response.data;
  }

  async del<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    return this.delete<T>(url, config);
  }

  async upload<T>(url: string, formData: FormData): Promise<T> {
    const response: AxiosResponse<T> = await this.client.post(url, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  }

  async download(url: string, filename: string): Promise<void> {
    const response = await this.client.get(url, {
      responseType: "blob",
    });

    const blob = new Blob([response.data]);
    const link = document.createElement("a");
    link.href = window.URL.createObjectURL(blob);
    link.download = filename;
    link.click();
    window.URL.revokeObjectURL(link.href);
  }
}

export default new RestClient();

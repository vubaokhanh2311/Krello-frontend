export function getPayloadNotificationError(error: any) {
  // Axios error
  if (error?.response) {
    const data = error.response.data;
    return {
      message: data?.message || "Request Error",
      description: data?.error || data?.description || "",
    };
  }

  // JS Error
  if (error instanceof Error) {
    return {
      message: error.message,
      description: "",
    };
  }

  // Fallback
  return {
    message: "Unexpected error",
    description: "",
  };
}

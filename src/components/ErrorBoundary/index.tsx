import { Component, type ErrorInfo, type ReactNode } from "react";
import { Container, Paper, Title, Text, Button, Group, ThemeIcon } from "@mantine/core";
import { IconAlertTriangle, IconRefresh, IconHome } from "@tabler/icons-react";

interface Props {
  children?: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught runtime error:", error, errorInfo);
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  private handleGoHome = () => {
    this.setState({ hasError: false, error: null });
    window.location.href = "/";
  };

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <Container size="sm" py={80}>
          <Paper radius="md" p="xl" withBorder className="shadow-lg text-center bg-white dark:bg-gray-800">
            <Group justify="center" mb="md">
              <ThemeIcon color="red" size={60} radius="xl" variant="light">
                <IconAlertTriangle size={36} />
              </ThemeIcon>
            </Group>

            <Title order={2} mb="sm">
              Đã xảy ra lỗi hệ thống bất ngờ
            </Title>

            <Text color="dimmed" size="sm" mb="lg">
              {this.state.error?.message || "Ứng dụng gặp sự cố ngoài dự kiến trong quá trình xử lý giao diện."}
            </Text>

            <Group justify="center" gap="md">
              <Button
                variant="light"
                color="blue"
                leftSection={<IconRefresh size={18} />}
                onClick={this.handleReset}
              >
                Tải lại trang
              </Button>
              <Button
                variant="filled"
                color="blue"
                leftSection={<IconHome size={18} />}
                onClick={this.handleGoHome}
              >
                Về Trang chủ
              </Button>
            </Group>
          </Paper>
        </Container>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;

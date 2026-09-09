import { useEffect, useState } from "react";
import { Container, Text, Button, Stack, ThemeIcon, Card } from "@mantine/core";
import { IconCheck, IconMailFast, IconX } from "@tabler/icons-react";
import { useNavigate, useSearchParams, useLocation } from "react-router-dom";
import { notifications } from "@mantine/notifications";
import { confirmInvite } from "../../api/MemberService";
import socketService from "../../service/socket.service";

const InvitationPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(false);

  const tokenFromUrl = searchParams.get("token");
  const tokenFromStorage = localStorage.getItem("inviteToken");
  const token = tokenFromUrl || tokenFromStorage;

  const accessToken =
    localStorage.getItem("accessToken") ||
    sessionStorage.getItem("accessToken");

  useEffect(() => {
    if (!accessToken && token) {
      localStorage.setItem("inviteToken", token);
      localStorage.setItem(
        "redirectAfterLogin",
        location.pathname + location.search,
      );
      navigate("/login");
    }
  }, [accessToken, token, navigate, location]);

  if (!token) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Stack align="center">
          <ThemeIcon color="red" size={60} radius="xl">
            <IconX size={32} />
          </ThemeIcon>
          <Text size="lg" fw={500}>
            Liên kết không hợp lệ
          </Text>
          <Text c="dimmed" size="sm">
            Không tìm thấy mã xác nhận trong đường dẫn.
          </Text>
        </Stack>
      </div>
    );
  }

  const handleAccept = async () => {
    try {
      setLoading(true);

      const res = await confirmInvite(token);
      if (!res?.boardId) {
        throw new Error("Không thể xác nhận lời mời");
      }

      socketService.connect();

      socketService.forceJoinBoard(res.boardId);

      notifications.show({
        title: "Thành công",
        message: "Bạn đã tham gia bảng thành công!",
        color: "green",
        autoClose: 2000,
        onClose: () => {
          localStorage.removeItem("inviteToken");
          localStorage.removeItem("redirectAfterLogin");

          navigate(`/board/${res.boardId}`);
        },
      });
    } catch (error) {
      console.error(error);
      const err = error as { response?: { data?: { message?: string } }; message?: string };
      notifications.show({
        title: "Thất bại",
        message:
          err?.response?.data?.message ||
          err?.message ||
          "Lời mời đã hết hạn hoặc không tồn tại",
        color: "red",
        autoClose: 3000,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDecline = () => {
    localStorage.removeItem("inviteToken");
    localStorage.removeItem("redirectAfterLogin");
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <Container size="xs" w="100%" maw={400}>
        <Card
          shadow="md"
          radius="lg"
          padding="xl"
          withBorder
          className="bg-white"
        >
          <Stack gap="lg" align="center">
            <ThemeIcon variant="light" color="blue" size={80} radius="100%">
              <IconMailFast size={40} />
            </ThemeIcon>

            <div className="text-center">
              <Text size="xl" fw={700} className="text-gray-800">
                Xác nhận lời mời
              </Text>
              <Text c="dimmed" mt="xs" size="sm">
                Bạn đã nhận được một liên kết tham gia vào bảng làm việc. Vui
                lòng nhấn xác nhận bên dưới để tiếp tục.
              </Text>
            </div>

            <Stack w="100%" gap="md">
              <Button
                fullWidth
                size="md"
                color="blue"
                loading={loading}
                leftSection={!loading && <IconCheck size={20} />}
                onClick={handleAccept}
              >
                Chấp nhận tham gia
              </Button>

              <Button
                fullWidth
                variant="subtle"
                color="gray"
                disabled={loading}
                onClick={handleDecline}
              >
                Bỏ qua
              </Button>
            </Stack>
          </Stack>
        </Card>
      </Container>
    </div>
  );
};

export default InvitationPage;

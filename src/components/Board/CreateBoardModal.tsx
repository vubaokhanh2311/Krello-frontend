import React from "react";
import { Modal, TextInput, Button, Text } from "@mantine/core";
import { useForm } from "@mantine/form";
import { IconCheck, IconX } from "@tabler/icons-react";
import clsx from "clsx";
import { useUnsplash } from "../../api/useUnsplash";

const BACKGROUND_COLORS = [
  "linear-gradient(135deg, #FF6B6B, #FFD93D)",
  "linear-gradient(135deg, #4ECDC4, #556270)",
  "linear-gradient(135deg, #6A89CC, #FF9F1C)",
  "linear-gradient(135deg, #FF9F1C, #FF6B6B)",
  "linear-gradient(135deg, #FFD93D, #4ECDC4)",
  "linear-gradient(135deg, #6A89CC, #FF6B6B)",
];

interface CreateBoardModalProps {
  opened: boolean;
  close: () => void;
  onSubmit: (values: { name: string; background: string }) => void;
  isLoading?: boolean;
}

export const CreateBoardModal: React.FC<CreateBoardModalProps> = ({
  opened,
  close,
  onSubmit,
  isLoading,
}) => {
  const form = useForm({
    initialValues: {
      name: "",
      background: BACKGROUND_COLORS[0],
    },
  });
  const { photos, loading } = useUnsplash();

  const isImageBackground = (bg: string) => bg.startsWith("http");

  const handleSubmit = (values: typeof form.values) => {
    onSubmit(values);
    form.reset();
  };

  return (
    <Modal
      opened={opened}
      onClose={close}
      centered
      size="lg"
      padding={0}
      withCloseButton={false}
      classNames={{
        content: "overflow-hidden rounded-xl",
      }}
    >
      <form onSubmit={form.onSubmit(handleSubmit)}>
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
          <div className="w-8" />
          <Text fw={600} size="md" className="text-gray-700">
            Tạo bảng
          </Text>
          <button
            type="button"
            onClick={close}
            className="text-gray-500 hover:text-gray-800 hover:bg-gray-100 p-1 rounded transition-colors"
          >
            <IconX size={20} />
          </button>
        </div>

        <div className="p-4">
          <div className="flex justify-center mb-5">
            <div
              className="relative w-[300px] h-[150px] rounded-md shadow-sm flex items-start justify-center pt-3 overflow-hidden transition-all duration-300"
              style={{
                background: isImageBackground(form.values.background)
                  ? `url(${form.values.background}) center/cover no-repeat`
                  : form.values.background,
              }}
            >
              <div className="absolute inset-0 bg-black/10" />

              <img
                src="https://trello.com/assets/14cda5dc635d1f13bc48.svg"
                alt="Board preview"
                className="w-[200px] z-10 opacity-80"
              />
            </div>
          </div>

          <div className="mb-5">
            <div className="mb-1">
              <Text size="sm" fw={600} className="text-gray-700 mb-2">
                Phông nền
              </Text>
            </div>

            <div className="grid grid-cols-4 gap-2 mb-2">
              {loading ? (
                <Text size="sm" className="text-gray-500 col-span-4">
                  Đang tải ảnh...
                </Text>
              ) : (
                photos.map((photo) => (
                  <button
                    key={photo.id}
                    type="button"
                    onClick={() => form.setFieldValue("background", photo.full)}
                    style={{ backgroundImage: `url(${photo.small})` }}
                    className={clsx(
                      "relative h-20 rounded-md bg-cover bg-center hover:opacity-90 transition-all focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-1",
                      form.values.background === photo.full &&
                        "ring-2 ring-blue-600 ring-offset-1"
                    )}
                  >
                    {form.values.background === photo.full && (
                      <div className="absolute inset-0 bg-black/30 rounded-md flex items-center justify-center">
                        <IconCheck size={16} className="text-white font-bold" />
                      </div>
                    )}
                  </button>
                ))
              )}
            </div>
            <div className="mb-5">
              <div className="mb-1">
                <Text size="sm" fw={600} className="text-gray-700 mb-2">
                  Màu sắc
                </Text>
              </div>
              <div className="grid grid-cols-6 gap-2">
                {BACKGROUND_COLORS.map((gradient, index) => (
                  <button
                    key={index}
                    type="button"
                    onClick={() => form.setFieldValue("background", gradient)}
                    className={clsx(
                      "relative h-8 rounded bg-cover hover:brightness-110 transition-all focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-1",
                      form.values.background === gradient &&
                        "ring-2 ring-blue-600 ring-offset-1"
                    )}
                    style={{ background: gradient }}
                  >
                    {form.values.background === gradient && (
                      <div className="w-full h-full flex items-center justify-center">
                        <IconCheck size={14} className="text-white" />
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="mb-6">
            <TextInput
              label="Tiêu đề bảng"
              withAsterisk
              data-autofocus
              placeholder="Ví dụ: Dự án Marketing..."
              classNames={{
                label: "text-sm font-semibold text-gray-700 mb-1",
                input:
                  "border-gray-300 focus:border-blue-500 transition-colors",
              }}
              {...form.getInputProps("name")}
            />
          </div>

          <Button
            fullWidth
            type="submit"
            loading={isLoading}
            disabled={!form.values.name}
            className={clsx(
              "transition-all duration-200",
              !form.values.name
                ? "bg-gray-200 text-gray-400"
                : "bg-blue-600 hover:bg-blue-700 text-white"
            )}
          >
            Tạo mới
          </Button>
        </div>
      </form>
    </Modal>
  );
};

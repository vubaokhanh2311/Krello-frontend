export interface Attachment {
  id: string;
  fileName: string;
  fileUrl: string;
  uploadedBy: string;
  cardId: string;
  createdAt: string;
  updatedAt: string;
  user: {
    id: string;
    name: string;
    email: string;
  };
  card: {
    id: string;
    title: string;
    description: string;
  };
}

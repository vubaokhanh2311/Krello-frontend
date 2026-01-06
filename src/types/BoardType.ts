export interface BoardRequest {
  name: string;
  background: string;
}

export interface BoardQuery {
  page?: number;
  pageSize?: number;
  name?: string;
  background?: string;
  order?: string;
}

export interface Board {
  id: string;
  name: string;
  background?: string;
  createdAt?: string;
  updatedAt?: string;
}

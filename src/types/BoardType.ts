export interface BoardRequest {
  name: string;
  background?: string;
}

export interface BoardQuery {
  page?: number;
  pageSize?: number;
  name?: string;
  background?: string;
  order?: string;
}

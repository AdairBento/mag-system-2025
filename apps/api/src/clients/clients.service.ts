import { Injectable } from '@nestjs/common';

type ListParams = {
  page: number;
  limit: number;
  search?: string;
  type?: string;
  status?: string;
};

type ListResponse<T> = {
  ok: boolean;
  data: T[];
  meta: { total: number; page: number; limit: number; pages: number };
};

@Injectable()
export class ClientsService {
  async findAll(params: ListParams): Promise<ListResponse<unknown>> {
    return {
      ok: true,
      data: [],
      meta: {
        total: 0,
        page: params.page,
        limit: params.limit,
        pages: 0,
      },
    };
  }
}

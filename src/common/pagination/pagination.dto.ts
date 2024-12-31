import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

export class PaginationMetadata {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasPrevPage: boolean;
  hasNextPage: boolean;

  constructor({
    paginationOptions,
    total,
  }: {
    paginationOptions: PaginationOptionsDto;
    total: number;
  }) {
    this.page = paginationOptions.page;
    this.limit = paginationOptions.limit;
    this.total = total;
    this.totalPages = Math.ceil(total / paginationOptions.limit);
    this.hasPrevPage = this.page > 1;
    this.hasNextPage = this.page < this.totalPages;
  }
}

export const PaginationOptionsSchema = z.object({
  page: z.number().int().min(1).optional().default(1),
  limit: z.number().int().min(1).max(50).optional().default(10),
});

export class PaginationOptionsDto extends createZodDto(
  PaginationOptionsSchema,
) {}

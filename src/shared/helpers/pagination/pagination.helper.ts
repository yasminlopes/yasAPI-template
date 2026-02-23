import { DEFAULT_PAGE_SIZE, MAX_PAGE_SIZE } from '@shared/constants';
import type { PaginationQuery, PaginatedResult } from './types';

export function normalizePagination(query: PaginationQuery): { page: number; limit: number } {
  const page = Math.max(1, Number(query.page) || 1);
  const limit = Math.min(MAX_PAGE_SIZE, Math.max(1, Number(query.limit) || DEFAULT_PAGE_SIZE));
  return { page, limit };
}

export function toPaginatedResult<T>(
  data: T[],
  total: number,
  page: number,
  limit: number
): PaginatedResult<T> {
  return {
    data,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit) || 1,
  };
}

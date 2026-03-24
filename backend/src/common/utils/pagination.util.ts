import { PaginationDto } from '../dto/pagination.dto';

export function resolvePagination(dto: PaginationDto) {
  const page = dto.page ?? 1;
  const limit = dto.limit ?? 10;
  const skip = (page - 1) * limit;
  return { page, limit, skip };
}

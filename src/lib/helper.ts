export const createPagination = ({
  page,
  total_data,
  per_page,
}: {
  page: number;
  total_data: number;
  per_page: number;
}) => {
  return {
    current: page,
    total_data: total_data,
    total_page: Math.ceil(total_data / per_page),
  };
};

export const parsePagination = (
  query: any,
  options: { defaultPage?: number; defaultPerPage?: number; maxPerPage?: number } = {}
) => {
  const defaultPage = options.defaultPage ?? 1;
  const defaultPerPage = options.defaultPerPage ?? 10;
  const maxPerPage = options.maxPerPage ?? 100;

  const rawPage = Number(query?.page);
  const rawPerPage = Number(query?.per_page);

  const page = Number.isFinite(rawPage) && rawPage > 0 ? Math.floor(rawPage) : defaultPage;
  let per_page = Number.isFinite(rawPerPage) && rawPerPage > 0 ? Math.floor(rawPerPage) : defaultPerPage;
  per_page = Math.min(maxPerPage, per_page);

  const skip = (page - 1) * per_page;
  const take = per_page;

  return { page, per_page, skip, take };
};

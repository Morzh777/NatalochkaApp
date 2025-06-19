// utils/paginate.ts
export function paginate<T>(items: T[], page: number, pageSize: number): {
    items: T[];
    totalCount: number;
} {
    const totalCount = items.length;
    const pagedItems = items.slice(page * pageSize, (page + 1) * pageSize);

    return {
        items: pagedItems,
        totalCount,
    };
}
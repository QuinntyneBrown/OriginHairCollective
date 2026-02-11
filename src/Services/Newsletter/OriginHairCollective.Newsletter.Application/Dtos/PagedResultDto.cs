namespace OriginHairCollective.Newsletter.Application.Dtos;

public sealed record PagedResultDto<T>(
    IReadOnlyList<T> Items,
    int TotalCount,
    int Page,
    int PageSize);

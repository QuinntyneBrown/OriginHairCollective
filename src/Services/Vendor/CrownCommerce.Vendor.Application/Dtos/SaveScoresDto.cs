namespace CrownCommerce.Vendor.Application.Dtos;

public sealed record SaveScoresDto(IReadOnlyList<ScoreItemDto> Scores);

public sealed record ScoreItemDto(
    string Section,
    string CriterionNumber,
    string CriterionLabel,
    int Score,
    int MaxScore,
    string? Notes);

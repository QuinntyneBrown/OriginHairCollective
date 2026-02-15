using System.CommandLine;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;

namespace CrownCommerce.Cli.Logs.Commands;

public interface ILogService
{
    Task TailLogsAsync(string[]? services, string? level, string? search, string? since, string? output);
}

public class LogService : ILogService
{
    private readonly ILogger<LogService> _logger;

    public static readonly string[] AllServices =
    {
        "catalog", "content", "identity", "inquiry", "newsletter",
        "notification", "order", "payment", "chat", "crm", "scheduling"
    };

    public LogService(ILogger<LogService> logger)
    {
        _logger = logger;
    }

    public Task TailLogsAsync(string[]? services, string? level, string? search, string? since, string? output)
    {
        var targetServices = services is { Length: > 0 } ? services : AllServices;

        Console.WriteLine($"Tailing logs from {targetServices.Length} services (level: {level ?? "all"})...");

        if (search is not null)
        {
            Console.WriteLine($"  Search filter: {search}");
        }

        if (since is not null)
        {
            Console.WriteLine($"  Since: {since}");
        }

        if (output is not null)
        {
            Console.WriteLine($"  Output file: {output}");
        }

        Console.WriteLine($"  Services: {string.Join(", ", targetServices)}");
        Console.WriteLine("  Waiting for log entries... (placeholder - connect to Aspire structured logs)");

        return Task.CompletedTask;
    }
}

public static class LogsCommand
{
    public static RootCommand Create(IServiceProvider services)
    {
        var serviceOption = new Option<string[]>("--service", "Service names to tail (can be specified multiple times)")
        {
            AllowMultipleArgumentsPerToken = true,
        };
        var levelOption = new Option<string?>("--level", "Log level filter (e.g., error, warning, info)");
        var searchOption = new Option<string?>("--search", "Search text filter");
        var sinceOption = new Option<string?>("--since", "Time window (e.g., 1h, 30m)");
        var outputOption = new Option<string?>("--output", "Output file path");

        var rootCommand = new RootCommand("Crown Commerce Centralized Log Viewer")
        {
            serviceOption,
            levelOption,
            searchOption,
            sinceOption,
            outputOption,
        };

        rootCommand.SetHandler(async (string[] serviceValues, string? level, string? search, string? since, string? output) =>
        {
            var logService = services.GetRequiredService<ILogService>();
            var svcs = serviceValues.Length > 0 ? serviceValues : null;
            await logService.TailLogsAsync(svcs, level, search, since, output);
        }, serviceOption, levelOption, searchOption, sinceOption, outputOption);

        return rootCommand;
    }
}

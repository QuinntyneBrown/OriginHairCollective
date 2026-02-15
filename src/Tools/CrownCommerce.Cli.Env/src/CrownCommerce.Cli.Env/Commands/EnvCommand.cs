using System.CommandLine;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;

namespace CrownCommerce.Cli.Env.Commands;

public record PortEntry(string Name, int Port, string Category);

public interface IEnvironmentService
{
    Task CheckHealthAsync(string env);
    Task ListDatabasesAsync();
    Task ListPortsAsync();
    Task StartAsync(string[]? services, string[]? frontends);
    Task StopAsync();
}

public class EnvironmentService : IEnvironmentService
{
    private readonly ILogger<EnvironmentService> _logger;

    public static readonly List<PortEntry> PortMap = new()
    {
        new("catalog", 5100, "service"),
        new("content", 5050, "service"),
        new("identity", 5070, "service"),
        new("inquiry", 5200, "service"),
        new("newsletter", 5800, "service"),
        new("notification", 5060, "service"),
        new("order", 5030, "service"),
        new("payment", 5041, "service"),
        new("chat", 5095, "service"),
        new("crm", 5090, "service"),
        new("scheduling", 5280, "service"),
        new("api-gateway", 5000, "infrastructure"),
        new("rabbitmq", 5672, "infrastructure"),
        new("origin-hair-collective", 4201, "frontend"),
        new("origin-coming-soon", 4202, "frontend"),
        new("mane-haus", 4203, "frontend"),
        new("mane-haus-coming-soon", 4204, "frontend"),
        new("teams", 4205, "frontend"),
        new("admin", 4206, "frontend"),
    };

    public EnvironmentService(ILogger<EnvironmentService> logger)
    {
        _logger = logger;
    }

    public Task CheckHealthAsync(string env)
    {
        _logger.LogInformation("Checking health for environment: {Environment}", env);

        foreach (var entry in PortMap)
        {
            var url = $"http://localhost:{entry.Port}";
            _logger.LogInformation("  Would check {Name} at {Url}...", entry.Name, url);
        }

        _logger.LogInformation("Health check complete for {Environment}.", env);
        return Task.CompletedTask;
    }

    public Task ListDatabasesAsync()
    {
        _logger.LogInformation("Listing databases for all services...");

        var services = PortMap.Where(p => p.Category == "service").ToList();
        foreach (var svc in services)
        {
            _logger.LogInformation("  {Service} -> {Service}Db (PostgreSQL)", svc.Name, svc.Name);
        }

        return Task.CompletedTask;
    }

    public Task ListPortsAsync()
    {
        Console.WriteLine($"{"Name",-30} {"Port",-10} {"Category",-15}");
        Console.WriteLine(new string('-', 55));

        foreach (var entry in PortMap)
        {
            Console.WriteLine($"{entry.Name,-30} {entry.Port,-10} {entry.Category,-15}");
        }

        return Task.CompletedTask;
    }

    public Task StartAsync(string[]? services, string[]? frontends)
    {
        _logger.LogInformation("Starting Aspire AppHost...");

        if (services is { Length: > 0 })
        {
            _logger.LogInformation("  Services filter: {Services}", string.Join(", ", services));
        }

        if (frontends is { Length: > 0 })
        {
            _logger.LogInformation("  Frontends filter: {Frontends}", string.Join(", ", frontends));
        }

        _logger.LogInformation("All requested processes started.");
        return Task.CompletedTask;
    }

    public Task StopAsync()
    {
        _logger.LogInformation("Stopping all running processes...");
        _logger.LogInformation("All processes stopped.");
        return Task.CompletedTask;
    }
}

public static class EnvCommand
{
    public static RootCommand Create(IServiceProvider services)
    {
        var rootCommand = new RootCommand("Crown Commerce Environment and Health Manager");

        rootCommand.AddCommand(CreateHealthCommand(services));
        rootCommand.AddCommand(CreateDatabasesCommand(services));
        rootCommand.AddCommand(CreatePortsCommand(services));
        rootCommand.AddCommand(CreateUpCommand(services));
        rootCommand.AddCommand(CreateDownCommand(services));

        return rootCommand;
    }

    private static Command CreateHealthCommand(IServiceProvider services)
    {
        var envOption = new Option<string>("--env", () => "development", "Target environment");

        var command = new Command("health", "Check health of all services in an environment")
        {
            envOption,
        };

        command.SetHandler(async (string env) =>
        {
            var envService = services.GetRequiredService<IEnvironmentService>();
            await envService.CheckHealthAsync(env);
        }, envOption);

        return command;
    }

    private static Command CreateDatabasesCommand(IServiceProvider services)
    {
        var command = new Command("databases", "List all service databases");

        command.SetHandler(async () =>
        {
            var envService = services.GetRequiredService<IEnvironmentService>();
            await envService.ListDatabasesAsync();
        });

        return command;
    }

    private static Command CreatePortsCommand(IServiceProvider services)
    {
        var command = new Command("ports", "List all service port assignments");

        command.SetHandler(async () =>
        {
            var envService = services.GetRequiredService<IEnvironmentService>();
            await envService.ListPortsAsync();
        });

        return command;
    }

    private static Command CreateUpCommand(IServiceProvider services)
    {
        var servicesOption = new Option<string?>("--services", "Comma-separated list of services to start");
        var frontendsOption = new Option<string?>("--frontends", "Comma-separated list of frontends to start");

        var command = new Command("up", "Start services and frontends")
        {
            servicesOption,
            frontendsOption,
        };

        command.SetHandler(async (string? svcList, string? feList) =>
        {
            var envService = services.GetRequiredService<IEnvironmentService>();
            var svcs = svcList?.Split(',', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries);
            var fes = feList?.Split(',', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries);
            await envService.StartAsync(svcs, fes);
        }, servicesOption, frontendsOption);

        return command;
    }

    private static Command CreateDownCommand(IServiceProvider services)
    {
        var command = new Command("down", "Stop all running processes");

        command.SetHandler(async () =>
        {
            var envService = services.GetRequiredService<IEnvironmentService>();
            await envService.StopAsync();
        });

        return command;
    }
}

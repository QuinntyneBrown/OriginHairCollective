using System.CommandLine;
using System.Diagnostics;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;

namespace CrownCommerce.Cli.Migrate.Commands;

public record MigrationStatus(string ServiceName, int AppliedCount, int PendingCount);

public record ServiceRegistryEntry(string InfrastructureProjectPath, string DbContextName);

public interface IMigrationService
{
    Task AddMigrationAsync(string service, string name);
    Task ApplyMigrationsAsync(string service, string env);
    Task<IReadOnlyList<MigrationStatus>> GetStatusAsync(string env);
}

public class MigrationService : IMigrationService
{
    private readonly ILogger<MigrationService> _logger;

    public static readonly Dictionary<string, ServiceRegistryEntry> ServiceRegistry = new()
    {
        ["catalog"] = new("src/Services/Catalog/CrownCommerce.Catalog.Infrastructure", "CatalogDbContext"),
        ["chat"] = new("src/Services/Chat/CrownCommerce.Chat.Infrastructure", "ChatDbContext"),
        ["content"] = new("src/Services/Content/CrownCommerce.Content.Infrastructure", "ContentDbContext"),
        ["crm"] = new("src/Services/Crm/CrownCommerce.Crm.Infrastructure", "CrmDbContext"),
        ["identity"] = new("src/Services/Identity/CrownCommerce.Identity.Infrastructure", "IdentityDbContext"),
        ["inquiry"] = new("src/Services/Inquiry/CrownCommerce.Inquiry.Infrastructure", "InquiryDbContext"),
        ["newsletter"] = new("src/Services/Newsletter/CrownCommerce.Newsletter.Infrastructure", "NewsletterDbContext"),
        ["notification"] = new("src/Services/Notification/CrownCommerce.Notification.Infrastructure", "NotificationDbContext"),
        ["order"] = new("src/Services/Order/CrownCommerce.Order.Infrastructure", "OrderDbContext"),
        ["payment"] = new("src/Services/Payment/CrownCommerce.Payment.Infrastructure", "PaymentDbContext"),
        ["scheduling"] = new("src/Services/Scheduling/CrownCommerce.Scheduling.Infrastructure", "SchedulingDbContext"),
    };

    public MigrationService(ILogger<MigrationService> logger)
    {
        _logger = logger;
    }

    public async Task AddMigrationAsync(string service, string name)
    {
        if (!ServiceRegistry.TryGetValue(service, out var entry))
        {
            _logger.LogError("Unknown service: {Service}. Valid services: {Services}",
                service, string.Join(", ", ServiceRegistry.Keys));
            return;
        }

        _logger.LogInformation("Adding migration '{Name}' to {Service}...", name, service);

        var process = new Process
        {
            StartInfo = new ProcessStartInfo
            {
                FileName = "dotnet",
                Arguments = $"ef migrations add {name} --project {entry.InfrastructureProjectPath} --context {entry.DbContextName}",
                RedirectStandardOutput = true,
                RedirectStandardError = true,
                UseShellExecute = false,
            }
        };

        process.Start();
        var output = await process.StandardOutput.ReadToEndAsync();
        var error = await process.StandardError.ReadToEndAsync();
        await process.WaitForExitAsync();

        if (process.ExitCode != 0)
        {
            _logger.LogError("Migration add failed: {Error}", error);
        }
        else
        {
            _logger.LogInformation("Migration added successfully. {Output}", output);
        }
    }

    public async Task ApplyMigrationsAsync(string service, string env)
    {
        if (!ServiceRegistry.TryGetValue(service, out var entry))
        {
            _logger.LogError("Unknown service: {Service}. Valid services: {Services}",
                service, string.Join(", ", ServiceRegistry.Keys));
            return;
        }

        _logger.LogInformation("Applying migrations for {Service} in {Environment}...", service, env);

        var process = new Process
        {
            StartInfo = new ProcessStartInfo
            {
                FileName = "dotnet",
                Arguments = $"ef database update --project {entry.InfrastructureProjectPath} --context {entry.DbContextName}",
                RedirectStandardOutput = true,
                RedirectStandardError = true,
                UseShellExecute = false,
            }
        };

        process.Start();
        var output = await process.StandardOutput.ReadToEndAsync();
        var error = await process.StandardError.ReadToEndAsync();
        await process.WaitForExitAsync();

        if (process.ExitCode != 0)
        {
            _logger.LogError("Migration apply failed: {Error}", error);
        }
        else
        {
            _logger.LogInformation("Migrations applied successfully. {Output}", output);
        }
    }

    public Task<IReadOnlyList<MigrationStatus>> GetStatusAsync(string env)
    {
        _logger.LogInformation("Checking migration status for environment: {Environment}", env);

        var statuses = ServiceRegistry.Keys
            .Select(service => new MigrationStatus(service, AppliedCount: 0, PendingCount: 0))
            .ToList();

        return Task.FromResult<IReadOnlyList<MigrationStatus>>(statuses);
    }
}

public static class MigrateCommand
{
    public static RootCommand Create(IServiceProvider services)
    {
        var rootCommand = new RootCommand("Crown Commerce Database Migration Manager");

        rootCommand.AddCommand(CreateAddCommand(services));
        rootCommand.AddCommand(CreateApplyCommand(services));
        rootCommand.AddCommand(CreateStatusCommand(services));

        return rootCommand;
    }

    private static Command CreateAddCommand(IServiceProvider services)
    {
        var serviceArg = new Argument<string>("service", "The target microservice name");
        var nameArg = new Argument<string>("name", "The migration name");

        var command = new Command("add", "Add a new migration to a service")
        {
            serviceArg,
            nameArg,
        };

        command.SetHandler(async (string service, string name) =>
        {
            var migrationService = services.GetRequiredService<IMigrationService>();
            await migrationService.AddMigrationAsync(service, name);
        }, serviceArg, nameArg);

        return command;
    }

    private static Command CreateApplyCommand(IServiceProvider services)
    {
        var serviceArg = new Argument<string>("service", "The target microservice name");
        var envOption = new Option<string>("--env", () => "development", "Target environment");

        var command = new Command("apply", "Apply pending migrations to a service")
        {
            serviceArg,
            envOption,
        };

        command.SetHandler(async (string service, string env) =>
        {
            var migrationService = services.GetRequiredService<IMigrationService>();
            await migrationService.ApplyMigrationsAsync(service, env);
        }, serviceArg, envOption);

        return command;
    }

    private static Command CreateStatusCommand(IServiceProvider services)
    {
        var envOption = new Option<string>("--env", () => "development", "Target environment");

        var command = new Command("status", "Show migration status for all services")
        {
            envOption,
        };

        command.SetHandler(async (string env) =>
        {
            var migrationService = services.GetRequiredService<IMigrationService>();
            var statuses = await migrationService.GetStatusAsync(env);

            Console.WriteLine($"{"Service",-20} {"Applied",-10} {"Pending",-10}");
            Console.WriteLine(new string('-', 40));

            foreach (var status in statuses)
            {
                Console.WriteLine($"{status.ServiceName,-20} {status.AppliedCount,-10} {status.PendingCount,-10}");
            }
        }, envOption);

        return command;
    }
}

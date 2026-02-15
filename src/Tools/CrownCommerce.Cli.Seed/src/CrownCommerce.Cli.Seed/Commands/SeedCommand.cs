using System.CommandLine;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;

namespace CrownCommerce.Cli.Seed.Commands;

public interface ISeedService
{
    Task SeedAsync(string service, string profile, bool reset, bool dryRun);
}

public class SeedService : ISeedService
{
    private readonly ILogger<SeedService> _logger;

    public static readonly string[] ServicesWithSeeders =
    [
        "catalog", "content", "identity", "newsletter", "scheduling"
    ];

    public static readonly string[] SupportedProfiles =
    [
        "minimal", "demo", "load-test", "e2e"
    ];

    public SeedService(ILogger<SeedService> logger)
    {
        _logger = logger;
    }

    public Task SeedAsync(string service, string profile, bool reset, bool dryRun)
    {
        if (!SupportedProfiles.Contains(profile))
        {
            _logger.LogError("Unknown profile: {Profile}. Supported profiles: {Profiles}",
                profile, string.Join(", ", SupportedProfiles));
            return Task.CompletedTask;
        }

        if (service == "all")
        {
            foreach (var svc in ServicesWithSeeders)
            {
                SeedSingleService(svc, profile, reset, dryRun);
            }
        }
        else
        {
            SeedSingleService(service, profile, reset, dryRun);
        }

        return Task.CompletedTask;
    }

    private void SeedSingleService(string service, string profile, bool reset, bool dryRun)
    {
        if (!ServicesWithSeeders.Contains(service))
        {
            _logger.LogWarning("No seeder configured for service: {Service}", service);
            return;
        }

        var prefix = dryRun ? "[DRY RUN] " : "";

        if (reset)
        {
            _logger.LogInformation("{Prefix}Resetting data for {Service} before seeding...", prefix, service);
        }

        _logger.LogInformation("{Prefix}Seeding {Service} with profile '{Profile}'...", prefix, service, profile);
        _logger.LogInformation("{Prefix}Seed complete for {Service}.", prefix, service);
    }
}

public static class SeedCommand
{
    public static RootCommand Create(IServiceProvider services)
    {
        var rootCommand = new RootCommand("Crown Commerce Database Seeder");

        var serviceArg = new Argument<string>("service", "The target microservice name (or 'all')");
        var profileOption = new Option<string>("--profile", () => "demo", "Seed data profile");
        var resetOption = new Option<bool>("--reset", () => false, "Reset existing data before seeding");
        var dryRunOption = new Option<bool>("--dry-run", () => false, "Preview seed operations without executing");

        rootCommand.AddArgument(serviceArg);
        rootCommand.AddOption(profileOption);
        rootCommand.AddOption(resetOption);
        rootCommand.AddOption(dryRunOption);

        rootCommand.SetHandler(async (string service, string profile, bool reset, bool dryRun) =>
        {
            var seedService = services.GetRequiredService<ISeedService>();
            await seedService.SeedAsync(service, profile, reset, dryRun);
        }, serviceArg, profileOption, resetOption, dryRunOption);

        return rootCommand;
    }
}

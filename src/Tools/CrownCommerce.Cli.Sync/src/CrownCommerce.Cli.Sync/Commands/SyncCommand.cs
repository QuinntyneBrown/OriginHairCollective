using System.CommandLine;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;

namespace CrownCommerce.Cli.Sync.Commands;

public record TeamMember(string Name, string IanaTimezone, string WindowsTimezone);

public interface ISyncService
{
    Task ShowTeamStatusAsync();
    Task CreateHandoffAsync(string to, string message);
    Task GetInboxAsync();
    Task FindOverlapAsync(string[] members);
    Task StartFocusAsync(string duration, string message);
}

public class SyncService : ISyncService
{
    private readonly ILogger<SyncService> _logger;

    public static readonly List<TeamMember> TeamMembers = new()
    {
        new("Quinn", "America/Toronto", "Eastern Standard Time"),
        new("Amara", "Africa/Lagos", "W. Africa Standard Time"),
        new("Wanjiku", "Africa/Lagos", "W. Africa Standard Time"),
        new("Sophia", "America/Toronto", "Eastern Standard Time"),
        new("James", "Europe/London", "GMT Standard Time"),
    };

    public SyncService(ILogger<SyncService> logger)
    {
        _logger = logger;
    }

    public Task ShowTeamStatusAsync()
    {
        Console.WriteLine($"{"Name",-15} {"Local Time",-25} {"Timezone",-25}");
        Console.WriteLine(new string('-', 65));

        foreach (var member in TeamMembers)
        {
            var tz = TimeZoneInfo.FindSystemTimeZoneById(member.WindowsTimezone);
            var localTime = TimeZoneInfo.ConvertTime(DateTimeOffset.UtcNow, tz);
            Console.WriteLine($"{member.Name,-15} {localTime:yyyy-MM-dd HH:mm:ss,-25} {member.IanaTimezone,-25}");
        }

        return Task.CompletedTask;
    }

    public Task CreateHandoffAsync(string to, string message)
    {
        _logger.LogInformation("Handoff note created for {Recipient}: {Message}", to, message);
        return Task.CompletedTask;
    }

    public Task GetInboxAsync()
    {
        Console.WriteLine("No pending handoff notes.");
        return Task.CompletedTask;
    }

    public Task FindOverlapAsync(string[] members)
    {
        var matchedMembers = TeamMembers
            .Where(m => members.Contains(m.Name, StringComparer.OrdinalIgnoreCase))
            .ToList();

        if (matchedMembers.Count == 0)
        {
            Console.WriteLine("No matching team members found.");
            return Task.CompletedTask;
        }

        // Calculate overlap of 9am-5pm working hours for each member
        // Convert each member's 9-17 local time to UTC, then find intersection
        var today = DateOnly.FromDateTime(DateTime.UtcNow);

        var utcRanges = matchedMembers.Select(m =>
        {
            var tz = TimeZoneInfo.FindSystemTimeZoneById(m.WindowsTimezone);
            var localStart = new DateTime(today.Year, today.Month, today.Day, 9, 0, 0);
            var localEnd = new DateTime(today.Year, today.Month, today.Day, 17, 0, 0);
            var utcStart = TimeZoneInfo.ConvertTimeToUtc(localStart, tz);
            var utcEnd = TimeZoneInfo.ConvertTimeToUtc(localEnd, tz);
            return (m.Name, UtcStart: utcStart, UtcEnd: utcEnd);
        }).ToList();

        var overlapStart = utcRanges.Max(r => r.UtcStart);
        var overlapEnd = utcRanges.Min(r => r.UtcEnd);

        Console.WriteLine($"Overlap for: {string.Join(", ", matchedMembers.Select(m => m.Name))}");

        if (overlapStart >= overlapEnd)
        {
            Console.WriteLine("  No overlapping working hours found.");
        }
        else
        {
            Console.WriteLine($"  UTC overlap: {overlapStart:HH:mm} - {overlapEnd:HH:mm}");

            foreach (var member in matchedMembers)
            {
                var tz = TimeZoneInfo.FindSystemTimeZoneById(member.WindowsTimezone);
                var localStart = TimeZoneInfo.ConvertTimeFromUtc(overlapStart, tz);
                var localEnd = TimeZoneInfo.ConvertTimeFromUtc(overlapEnd, tz);
                Console.WriteLine($"  {member.Name} ({member.IanaTimezone}): {localStart:HH:mm} - {localEnd:HH:mm}");
            }
        }

        return Task.CompletedTask;
    }

    public Task StartFocusAsync(string duration, string message)
    {
        _logger.LogInformation("Focus mode started for {Duration}: {Message}", duration, message);
        return Task.CompletedTask;
    }
}

public static class SyncCommand
{
    public static RootCommand Create(IServiceProvider services)
    {
        var rootCommand = new RootCommand("Crown Commerce Timezone-Aware Collaboration Tool");

        rootCommand.AddCommand(CreateNowCommand(services));
        rootCommand.AddCommand(CreateHandoffCommand(services));
        rootCommand.AddCommand(CreateInboxCommand(services));
        rootCommand.AddCommand(CreateOverlapCommand(services));
        rootCommand.AddCommand(CreateFocusCommand(services));

        return rootCommand;
    }

    private static Command CreateNowCommand(IServiceProvider services)
    {
        var command = new Command("now", "Show current team status with local times");

        command.SetHandler(async () =>
        {
            var syncService = services.GetRequiredService<ISyncService>();
            await syncService.ShowTeamStatusAsync();
        });

        return command;
    }

    private static Command CreateHandoffCommand(IServiceProvider services)
    {
        var toOption = new Option<string>("--to", "Employee name to hand off to") { IsRequired = true };
        var messageOption = new Option<string>("--message", "Handoff message") { IsRequired = true };

        var command = new Command("handoff", "Create a handoff note for a team member")
        {
            toOption,
            messageOption,
        };

        command.SetHandler(async (string to, string message) =>
        {
            var syncService = services.GetRequiredService<ISyncService>();
            await syncService.CreateHandoffAsync(to, message);
        }, toOption, messageOption);

        return command;
    }

    private static Command CreateInboxCommand(IServiceProvider services)
    {
        var command = new Command("inbox", "View pending handoff notes");

        command.SetHandler(async () =>
        {
            var syncService = services.GetRequiredService<ISyncService>();
            await syncService.GetInboxAsync();
        });

        return command;
    }

    private static Command CreateOverlapCommand(IServiceProvider services)
    {
        var membersArg = new Argument<string[]>("members", "Team member names to check overlap for")
        {
            Arity = ArgumentArity.OneOrMore,
        };

        var command = new Command("overlap", "Find overlapping working hours for team members")
        {
            membersArg,
        };

        command.SetHandler(async (string[] members) =>
        {
            var syncService = services.GetRequiredService<ISyncService>();
            await syncService.FindOverlapAsync(members);
        }, membersArg);

        return command;
    }

    private static Command CreateFocusCommand(IServiceProvider services)
    {
        var durationOption = new Option<string>("--duration", "Focus duration (e.g., 2h, 30m)") { IsRequired = true };
        var messageOption = new Option<string>("--message", "Focus status message") { IsRequired = true };

        var command = new Command("focus", "Start a focus session with a status message")
        {
            durationOption,
            messageOption,
        };

        command.SetHandler(async (string duration, string message) =>
        {
            var syncService = services.GetRequiredService<ISyncService>();
            await syncService.StartFocusAsync(duration, message);
        }, durationOption, messageOption);

        return command;
    }
}

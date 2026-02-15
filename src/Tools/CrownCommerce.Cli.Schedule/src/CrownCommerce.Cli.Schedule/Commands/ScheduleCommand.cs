using System.CommandLine;
using System.CommandLine.Invocation;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;

namespace CrownCommerce.Cli.Schedule.Commands;

public record Meeting(string Title, DateTime Start, string Duration, IReadOnlyList<string> Attendees, string? Location);

public record CreateMeetingRequest(
    string Title,
    string Start,
    string Duration,
    IReadOnlyList<string> Attendees,
    string? Location);

public record Channel(string Name, string Type, int MemberCount);

public record Availability(string Email, string Name, string TimeZone, IReadOnlyList<string> FreeSlots);

public interface IScheduleService
{
    Task<IReadOnlyList<Meeting>> ListMeetingsAsync(bool week, string? forEmail);
    Task CreateMeetingAsync(CreateMeetingRequest request);
    Task<IReadOnlyList<Channel>> ListChannelsAsync(string? type);
    Task<IReadOnlyList<Availability>> GetAvailabilityAsync(string date);
}

public class ScheduleService : IScheduleService
{
    private static readonly List<Channel> Channels =
    [
        new("general", "public", 5),
        new("product-launches", "public", 4),
        new("engineering", "public", 3),
        new("hair-styling-tips", "public", 3),
        new("random", "public", 5),
        new("marketing", "public", 2),
        new("client-support", "public", 4),
    ];

    private readonly ILogger<ScheduleService> _logger;

    public ScheduleService(ILogger<ScheduleService> logger) => _logger = logger;

    public Task<IReadOnlyList<Meeting>> ListMeetingsAsync(bool week, string? forEmail)
    {
        var meetings = new List<Meeting>
        {
            new("Sprint Planning", DateTime.UtcNow.Date.AddHours(10), "1h",
                ["quinn@crowncommerce.io", "amara@crowncommerce.io"], "Zoom"),
            new("Product Review", DateTime.UtcNow.Date.AddHours(14), "30m",
                ["sophia@crowncommerce.io", "james@crowncommerce.io"], "Google Meet"),
            new("Styling Workshop", DateTime.UtcNow.Date.AddDays(1).AddHours(11), "2h",
                ["wanjiku@crowncommerce.io", "sophia@crowncommerce.io"], "Studio A"),
        };

        if (forEmail is not null)
        {
            meetings = meetings
                .Where(m => m.Attendees.Contains(forEmail, StringComparer.OrdinalIgnoreCase))
                .ToList();
        }

        if (!week)
        {
            meetings = meetings.Where(m => m.Start.Date == DateTime.UtcNow.Date).ToList();
        }

        return Task.FromResult<IReadOnlyList<Meeting>>(meetings);
    }

    public Task CreateMeetingAsync(CreateMeetingRequest request)
    {
        _logger.LogInformation(
            "Creating meeting '{Title}' starting at {Start} for {Duration} with {AttendeeCount} attendees. Location: {Location}",
            request.Title, request.Start, request.Duration, request.Attendees.Count,
            request.Location ?? "No location");
        return Task.CompletedTask;
    }

    public Task<IReadOnlyList<Channel>> ListChannelsAsync(string? type)
    {
        var filtered = type is not null
            ? Channels.Where(c => c.Type.Equals(type, StringComparison.OrdinalIgnoreCase)).ToList()
            : Channels;

        return Task.FromResult<IReadOnlyList<Channel>>(filtered);
    }

    public Task<IReadOnlyList<Availability>> GetAvailabilityAsync(string date)
    {
        var availability = new List<Availability>
        {
            new("quinn@crowncommerce.io", "Quinn Brown", "America/Toronto", ["09:00-10:00", "13:00-15:00"]),
            new("amara@crowncommerce.io", "Amara Okafor", "Africa/Lagos", ["10:00-12:00", "14:00-16:00"]),
            new("wanjiku@crowncommerce.io", "Wanjiku Mwangi", "Africa/Lagos", ["09:00-11:00", "15:00-17:00"]),
            new("sophia@crowncommerce.io", "Sophia Chen", "America/Toronto", ["10:00-12:00", "14:00-17:00"]),
            new("james@crowncommerce.io", "James Wright", "Europe/London", ["08:00-10:00", "13:00-16:00"]),
        };

        return Task.FromResult<IReadOnlyList<Availability>>(availability);
    }
}

public static class ScheduleCommand
{
    public static RootCommand Create(IServiceProvider services)
    {
        var rootCommand = new RootCommand("cc-schedule - Meeting and schedule manager with timezone support");

        rootCommand.AddCommand(CreateMeetingsCommand(services));
        rootCommand.AddCommand(CreateCreateMeetingCommand(services));
        rootCommand.AddCommand(CreateChannelsCommand(services));
        rootCommand.AddCommand(CreateAvailabilityCommand(services));

        return rootCommand;
    }

    private static Command CreateMeetingsCommand(IServiceProvider services)
    {
        var weekOption = new Option<bool>("--week", "Show meetings for the entire week");
        var forOption = new Option<string?>("--for", "Filter meetings for a specific attendee email");

        var command = new Command("meetings", "List scheduled meetings") { weekOption, forOption };

        command.SetHandler(async (InvocationContext context) =>
        {
            var week = context.ParseResult.GetValueForOption(weekOption);
            var forEmail = context.ParseResult.GetValueForOption(forOption);

            var service = services.GetRequiredService<IScheduleService>();
            var meetings = await service.ListMeetingsAsync(week, forEmail);

            Console.WriteLine($"{"Title",-25} {"Start",-22} {"Duration",-10} {"Location",-15} {"Attendees"}");
            Console.WriteLine(new string('-', 100));

            foreach (var m in meetings)
            {
                Console.WriteLine($"{m.Title,-25} {m.Start:u,-22} {m.Duration,-10} {m.Location ?? "",-15} {string.Join(", ", m.Attendees)}");
            }

            context.ExitCode = 0;
        });

        return command;
    }

    private static Command CreateCreateMeetingCommand(IServiceProvider services)
    {
        var titleOption = new Option<string>("--title", "Meeting title") { IsRequired = true };
        var startOption = new Option<string>("--start", "Start date/time (ISO 8601)") { IsRequired = true };
        var durationOption = new Option<string>("--duration", () => "1h", "Duration (e.g., 30m, 1h, 2h)");
        var attendeesOption = new Option<string>("--attendees", "Comma-separated attendee emails") { IsRequired = true };
        var locationOption = new Option<string?>("--location", "Meeting location or link");

        var command = new Command("create-meeting", "Create a new meeting")
        {
            titleOption, startOption, durationOption, attendeesOption, locationOption
        };

        command.SetHandler(async (InvocationContext context) =>
        {
            var attendeesRaw = context.ParseResult.GetValueForOption(attendeesOption)!;
            var attendees = attendeesRaw.Split(',', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries);

            var request = new CreateMeetingRequest(
                Title: context.ParseResult.GetValueForOption(titleOption)!,
                Start: context.ParseResult.GetValueForOption(startOption)!,
                Duration: context.ParseResult.GetValueForOption(durationOption)!,
                Attendees: attendees,
                Location: context.ParseResult.GetValueForOption(locationOption)
            );

            var service = services.GetRequiredService<IScheduleService>();
            await service.CreateMeetingAsync(request);

            Console.WriteLine($"Meeting '{request.Title}' created for {request.Start}.");
            context.ExitCode = 0;
        });

        return command;
    }

    private static Command CreateChannelsCommand(IServiceProvider services)
    {
        var typeOption = new Option<string?>("--type", "Filter by channel type (public or dm)");
        var command = new Command("channels", "List communication channels") { typeOption };

        command.SetHandler(async (InvocationContext context) =>
        {
            var type = context.ParseResult.GetValueForOption(typeOption);
            var service = services.GetRequiredService<IScheduleService>();
            var channels = await service.ListChannelsAsync(type);

            Console.WriteLine($"{"Channel",-25} {"Type",-10} {"Members"}");
            Console.WriteLine(new string('-', 50));

            foreach (var c in channels)
            {
                Console.WriteLine($"{c.Name,-25} {c.Type,-10} {c.MemberCount}");
            }

            context.ExitCode = 0;
        });

        return command;
    }

    private static Command CreateAvailabilityCommand(IServiceProvider services)
    {
        var dateOption = new Option<string>("--date", "Date to check availability (yyyy-MM-dd)") { IsRequired = true };
        var command = new Command("availability", "Show team availability for a date") { dateOption };

        command.SetHandler(async (InvocationContext context) =>
        {
            var date = context.ParseResult.GetValueForOption(dateOption)!;
            var service = services.GetRequiredService<IScheduleService>();
            var availability = await service.GetAvailabilityAsync(date);

            Console.WriteLine($"Availability for {date}:");
            Console.WriteLine();

            foreach (var a in availability)
            {
                Console.WriteLine($"  {a.Name} ({a.TimeZone}):");
                foreach (var slot in a.FreeSlots)
                {
                    Console.WriteLine($"    - {slot}");
                }
            }

            context.ExitCode = 0;
        });

        return command;
    }
}

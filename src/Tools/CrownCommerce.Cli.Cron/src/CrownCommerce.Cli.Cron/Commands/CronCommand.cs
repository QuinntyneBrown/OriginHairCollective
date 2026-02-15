using System.CommandLine;
using System.CommandLine.Invocation;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;

namespace CrownCommerce.Cli.Cron.Commands;

public record CronJobDefinition(string Name, string Schedule, string TargetService, string Description);

public record CronJobHistory(string JobName, DateTime ExecutedAt, string Status, string? Error = null);

public interface ICronService
{
    Task<IReadOnlyList<CronJobDefinition>> ListJobsAsync();
    Task<bool> RunJobAsync(string jobName);
    Task StartDaemonAsync(string? jobFilter);
    Task<IReadOnlyList<CronJobHistory>> GetHistoryAsync(string? jobName);
}

public class CronService : ICronService
{
    private static readonly List<CronJobDefinition> Jobs =
    [
        new("clear-expired-carts", "*/30 * * * *", "order", "Remove cart items older than 24 hours"),
        new("send-follow-up-reminders", "0 9 * * *", "crm", "Email contacts with overdue follow-ups"),
        new("send-meeting-reminders", "*/15 * * * *", "scheduling", "Notify attendees 15 min before meetings"),
        new("daily-subscriber-digest", "0 8 * * *", "newsletter", "Send daily digest to subscribers"),
        new("sync-employee-presence", "*/5 * * * *", "scheduling", "Update presence based on last activity"),
        new("cleanup-notification-logs", "0 2 * * *", "notification", "Archive logs older than 90 days"),
    ];

    private readonly ILogger<CronService> _logger;

    public CronService(ILogger<CronService> logger) => _logger = logger;

    public Task<IReadOnlyList<CronJobDefinition>> ListJobsAsync()
    {
        return Task.FromResult<IReadOnlyList<CronJobDefinition>>(Jobs);
    }

    public Task<bool> RunJobAsync(string jobName)
    {
        var job = Jobs.Find(j => j.Name == jobName);
        if (job is null)
        {
            _logger.LogError("Job '{JobName}' not found", jobName);
            return Task.FromResult(false);
        }

        _logger.LogInformation("Executing {JobName}...", jobName);
        return Task.FromResult(true);
    }

    public Task StartDaemonAsync(string? jobFilter)
    {
        var filtered = jobFilter is not null
            ? Jobs.Where(j => j.Name == jobFilter).ToList()
            : Jobs;

        _logger.LogInformation("Daemon started with {Count} jobs", filtered.Count);
        return Task.CompletedTask;
    }

    public Task<IReadOnlyList<CronJobHistory>> GetHistoryAsync(string? jobName)
    {
        var history = new List<CronJobHistory>();

        if (jobName is not null)
        {
            history.Add(new CronJobHistory(jobName, DateTime.UtcNow.AddHours(-1), "Success"));
        }
        else
        {
            foreach (var job in Jobs)
            {
                history.Add(new CronJobHistory(job.Name, DateTime.UtcNow.AddHours(-1), "Success"));
            }
        }

        return Task.FromResult<IReadOnlyList<CronJobHistory>>(history);
    }
}

public static class CronCommand
{
    public static RootCommand Create(IServiceProvider services)
    {
        var rootCommand = new RootCommand("cc-cron - Local job scheduler for recurring background tasks");

        rootCommand.AddCommand(CreateListCommand(services));
        rootCommand.AddCommand(CreateRunCommand(services));
        rootCommand.AddCommand(CreateStartCommand(services));
        rootCommand.AddCommand(CreateHistoryCommand(services));

        return rootCommand;
    }

    private static Command CreateListCommand(IServiceProvider services)
    {
        var command = new Command("list", "List all registered cron jobs");

        command.SetHandler(async (InvocationContext context) =>
        {
            var service = services.GetRequiredService<ICronService>();
            var jobs = await service.ListJobsAsync();

            Console.WriteLine($"{"Name",-30} {"Schedule",-20} {"Service",-15} {"Description"}");
            Console.WriteLine(new string('-', 100));

            foreach (var job in jobs)
            {
                Console.WriteLine($"{job.Name,-30} {job.Schedule,-20} {job.TargetService,-15} {job.Description}");
            }

            context.ExitCode = 0;
        });

        return command;
    }

    private static Command CreateRunCommand(IServiceProvider services)
    {
        var jobNameArg = new Argument<string>("job-name", "The name of the job to run");
        var command = new Command("run", "Run a specific cron job immediately") { jobNameArg };

        command.SetHandler(async (InvocationContext context) =>
        {
            var jobName = context.ParseResult.GetValueForArgument(jobNameArg);
            var service = services.GetRequiredService<ICronService>();
            var success = await service.RunJobAsync(jobName);

            context.ExitCode = success ? 0 : 1;
        });

        return command;
    }

    private static Command CreateStartCommand(IServiceProvider services)
    {
        var jobOption = new Option<string?>("--job", "Optional job filter (run only this job)");
        var command = new Command("start", "Start the cron daemon") { jobOption };

        command.SetHandler(async (InvocationContext context) =>
        {
            var jobFilter = context.ParseResult.GetValueForOption(jobOption);
            var service = services.GetRequiredService<ICronService>();
            await service.StartDaemonAsync(jobFilter);

            context.ExitCode = 0;
        });

        return command;
    }

    private static Command CreateHistoryCommand(IServiceProvider services)
    {
        var jobNameArg = new Argument<string?>("job-name", () => null, "Optional job name to filter history");
        var command = new Command("history", "Show job execution history") { jobNameArg };

        command.SetHandler(async (InvocationContext context) =>
        {
            var jobName = context.ParseResult.GetValueForArgument(jobNameArg);
            var service = services.GetRequiredService<ICronService>();
            var history = await service.GetHistoryAsync(jobName);

            Console.WriteLine($"{"Job",-30} {"Executed At",-25} {"Status",-10} {"Error"}");
            Console.WriteLine(new string('-', 80));

            foreach (var entry in history)
            {
                Console.WriteLine($"{entry.JobName,-30} {entry.ExecutedAt:u,-25} {entry.Status,-10} {entry.Error ?? ""}");
            }

            context.ExitCode = 0;
        });

        return command;
    }
}

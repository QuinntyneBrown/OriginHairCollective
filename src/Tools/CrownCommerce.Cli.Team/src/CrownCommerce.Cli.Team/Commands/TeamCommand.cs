using System.CommandLine;
using System.CommandLine.Invocation;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;

namespace CrownCommerce.Cli.Team.Commands;

public record TeamMember(
    string Email,
    string FirstName,
    string LastName,
    string Role,
    string Department,
    string TimeZone,
    string Status);

public record TeamMemberRequest(
    string Email,
    string FirstName,
    string LastName,
    string Role,
    string? JobTitle,
    string? Department,
    string TimeZone);

public interface ITeamService
{
    Task<IReadOnlyList<TeamMember>> ListAsync(string? department, string status);
    Task AddAsync(TeamMemberRequest request);
    Task<TeamMember?> GetAsync(string email);
    Task DeactivateAsync(string email);
}

public class TeamService : ITeamService
{
    private static readonly List<TeamMember> Members =
    [
        new("quinn@crowncommerce.io", "Quinn", "Brown", "Admin", "Engineering", "America/Toronto", "active"),
        new("amara@crowncommerce.io", "Amara", "Okafor", "Admin", "Engineering", "Africa/Lagos", "active"),
        new("wanjiku@crowncommerce.io", "Wanjiku", "Mwangi", "Customer", "Hair Styling", "Africa/Lagos", "active"),
        new("sophia@crowncommerce.io", "Sophia", "Chen", "Customer", "Marketing", "America/Toronto", "active"),
        new("james@crowncommerce.io", "James", "Wright", "Customer", "Operations", "Europe/London", "active"),
    ];

    private readonly ILogger<TeamService> _logger;

    public TeamService(ILogger<TeamService> logger) => _logger = logger;

    public Task<IReadOnlyList<TeamMember>> ListAsync(string? department, string status)
    {
        var filtered = Members
            .Where(m => m.Status == status)
            .Where(m => department is null || m.Department.Equals(department, StringComparison.OrdinalIgnoreCase))
            .ToList();

        return Task.FromResult<IReadOnlyList<TeamMember>>(filtered);
    }

    public Task AddAsync(TeamMemberRequest request)
    {
        _logger.LogInformation(
            "Adding team member {FirstName} {LastName} ({Email}) as {Role} in {Department}",
            request.FirstName, request.LastName, request.Email, request.Role, request.Department ?? "Unassigned");
        return Task.CompletedTask;
    }

    public Task<TeamMember?> GetAsync(string email)
    {
        var member = Members.Find(m => m.Email.Equals(email, StringComparison.OrdinalIgnoreCase));
        return Task.FromResult(member);
    }

    public Task DeactivateAsync(string email)
    {
        _logger.LogInformation("Deactivating team member {Email}", email);
        return Task.CompletedTask;
    }
}

public static class TeamCommand
{
    public static RootCommand Create(IServiceProvider services)
    {
        var rootCommand = new RootCommand("cc-team - Team member management across Identity and Scheduling");

        rootCommand.AddCommand(CreateListCommand(services));
        rootCommand.AddCommand(CreateAddCommand(services));
        rootCommand.AddCommand(CreateShowCommand(services));
        rootCommand.AddCommand(CreateDeactivateCommand(services));

        return rootCommand;
    }

    private static Command CreateListCommand(IServiceProvider services)
    {
        var departmentOption = new Option<string?>("--department", "Filter by department");
        var statusOption = new Option<string>("--status", () => "active", "Filter by status");

        var command = new Command("list", "List team members") { departmentOption, statusOption };

        command.SetHandler(async (InvocationContext context) =>
        {
            var department = context.ParseResult.GetValueForOption(departmentOption);
            var status = context.ParseResult.GetValueForOption(statusOption)!;

            var service = services.GetRequiredService<ITeamService>();
            var members = await service.ListAsync(department, status);

            Console.WriteLine($"{"Email",-35} {"Name",-20} {"Role",-12} {"Department",-15} {"TimeZone",-20} {"Status"}");
            Console.WriteLine(new string('-', 115));

            foreach (var m in members)
            {
                Console.WriteLine($"{m.Email,-35} {m.FirstName + " " + m.LastName,-20} {m.Role,-12} {m.Department,-15} {m.TimeZone,-20} {m.Status}");
            }

            context.ExitCode = 0;
        });

        return command;
    }

    private static Command CreateAddCommand(IServiceProvider services)
    {
        var emailOption = new Option<string>("--email", "Email address") { IsRequired = true };
        var firstNameOption = new Option<string>("--first-name", "First name") { IsRequired = true };
        var lastNameOption = new Option<string>("--last-name", "Last name") { IsRequired = true };
        var roleOption = new Option<string>("--role", () => "Customer", "Role (Admin, Customer, etc.)");
        var jobTitleOption = new Option<string?>("--job-title", "Job title");
        var departmentOption = new Option<string?>("--department", "Department");
        var timezoneOption = new Option<string>("--timezone", () => "America/Toronto", "IANA timezone");

        var command = new Command("add", "Add a new team member")
        {
            emailOption, firstNameOption, lastNameOption, roleOption,
            jobTitleOption, departmentOption, timezoneOption
        };

        command.SetHandler(async (InvocationContext context) =>
        {
            var request = new TeamMemberRequest(
                Email: context.ParseResult.GetValueForOption(emailOption)!,
                FirstName: context.ParseResult.GetValueForOption(firstNameOption)!,
                LastName: context.ParseResult.GetValueForOption(lastNameOption)!,
                Role: context.ParseResult.GetValueForOption(roleOption)!,
                JobTitle: context.ParseResult.GetValueForOption(jobTitleOption),
                Department: context.ParseResult.GetValueForOption(departmentOption),
                TimeZone: context.ParseResult.GetValueForOption(timezoneOption)!
            );

            var service = services.GetRequiredService<ITeamService>();
            await service.AddAsync(request);

            Console.WriteLine($"Team member {request.FirstName} {request.LastName} added.");
            context.ExitCode = 0;
        });

        return command;
    }

    private static Command CreateShowCommand(IServiceProvider services)
    {
        var emailArg = new Argument<string>("email", "Email of the team member to show");
        var command = new Command("show", "Show details for a team member") { emailArg };

        command.SetHandler(async (InvocationContext context) =>
        {
            var email = context.ParseResult.GetValueForArgument(emailArg);
            var service = services.GetRequiredService<ITeamService>();
            var member = await service.GetAsync(email);

            if (member is null)
            {
                Console.Error.WriteLine($"Team member '{email}' not found.");
                context.ExitCode = 1;
                return;
            }

            Console.WriteLine($"Email:      {member.Email}");
            Console.WriteLine($"Name:       {member.FirstName} {member.LastName}");
            Console.WriteLine($"Role:       {member.Role}");
            Console.WriteLine($"Department: {member.Department}");
            Console.WriteLine($"TimeZone:   {member.TimeZone}");
            Console.WriteLine($"Status:     {member.Status}");
            context.ExitCode = 0;
        });

        return command;
    }

    private static Command CreateDeactivateCommand(IServiceProvider services)
    {
        var emailArg = new Argument<string>("email", "Email of the team member to deactivate");
        var command = new Command("deactivate", "Deactivate a team member") { emailArg };

        command.SetHandler(async (InvocationContext context) =>
        {
            var email = context.ParseResult.GetValueForArgument(emailArg);
            var service = services.GetRequiredService<ITeamService>();
            await service.DeactivateAsync(email);

            Console.WriteLine($"Team member '{email}' has been deactivated.");
            context.ExitCode = 0;
        });

        return command;
    }
}

using System.CommandLine;
using System.CommandLine.Invocation;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;

namespace CrownCommerce.Cli.Email.Commands;

public record EmailTemplate(string Name, string Service, string Variables);

public interface IEmailService
{
    Task SendAsync(string to, string template, string? data);
    Task<string> PreviewAsync(string template);
    Task<IReadOnlyList<EmailTemplate>> ListTemplatesAsync();
    Task SendCampaignAsync(string subject, string template, string tag, string? testTo);
    Task StartLocalServerAsync(int port);
}

public class EmailService : IEmailService
{
    private static readonly List<EmailTemplate> Templates =
    [
        new("order-confirmation", "order", "orderNumber, customerName, items, total"),
        new("payment-receipt", "order", "orderNumber, amount, paymentMethod, date"),
        new("order-status-update", "order", "orderNumber, status, trackingNumber"),
        new("refund-notification", "order", "orderNumber, refundAmount, reason"),
        new("inquiry-confirmation", "crm", "inquiryId, customerName, subject"),
        new("newsletter-welcome", "newsletter", "subscriberName, preferencesUrl"),
        new("campaign-completed", "newsletter", "campaignName, sentCount, openRate"),
    ];

    private readonly ILogger<EmailService> _logger;

    public EmailService(ILogger<EmailService> logger) => _logger = logger;

    public Task SendAsync(string to, string template, string? data)
    {
        _logger.LogInformation("Sending email to {To} using template '{Template}' with data: {Data}",
            to, template, data ?? "(none)");
        return Task.CompletedTask;
    }

    public Task<string> PreviewAsync(string template)
    {
        _logger.LogInformation("Opening browser preview for template '{Template}'", template);
        return Task.FromResult($"http://localhost:3000/preview/{template}");
    }

    public Task<IReadOnlyList<EmailTemplate>> ListTemplatesAsync()
    {
        return Task.FromResult<IReadOnlyList<EmailTemplate>>(Templates);
    }

    public Task SendCampaignAsync(string subject, string template, string tag, string? testTo)
    {
        if (testTo is not null)
        {
            _logger.LogInformation(
                "Sending test campaign '{Subject}' using template '{Template}' tagged '{Tag}' to {TestTo}",
                subject, template, tag, testTo);
        }
        else
        {
            _logger.LogInformation(
                "Sending campaign '{Subject}' using template '{Template}' tagged '{Tag}' to all subscribers",
                subject, template, tag);
        }

        return Task.CompletedTask;
    }

    public Task StartLocalServerAsync(int port)
    {
        _logger.LogInformation("Starting local SMTP trap on port {Port}", port);
        return Task.CompletedTask;
    }
}

public static class EmailCommand
{
    public static RootCommand Create(IServiceProvider services)
    {
        var rootCommand = new RootCommand("cc-email - Email campaign and transactional mailer");

        rootCommand.AddCommand(CreateSendCommand(services));
        rootCommand.AddCommand(CreatePreviewCommand(services));
        rootCommand.AddCommand(CreateTemplatesCommand(services));
        rootCommand.AddCommand(CreateCampaignCommand(services));
        rootCommand.AddCommand(CreateServerCommand(services));

        return rootCommand;
    }

    private static Command CreateSendCommand(IServiceProvider services)
    {
        var toOption = new Option<string>("--to", "Recipient email address") { IsRequired = true };
        var templateOption = new Option<string>("--template", "Email template name") { IsRequired = true };
        var dataOption = new Option<string?>("--data", "Template data as JSON string");

        var command = new Command("send", "Send a transactional email") { toOption, templateOption, dataOption };

        command.SetHandler(async (InvocationContext context) =>
        {
            var to = context.ParseResult.GetValueForOption(toOption)!;
            var template = context.ParseResult.GetValueForOption(templateOption)!;
            var data = context.ParseResult.GetValueForOption(dataOption);

            var service = services.GetRequiredService<IEmailService>();
            await service.SendAsync(to, template, data);

            Console.WriteLine($"Email sent to {to} using template '{template}'.");
            context.ExitCode = 0;
        });

        return command;
    }

    private static Command CreatePreviewCommand(IServiceProvider services)
    {
        var templateArg = new Argument<string>("template", "The template to preview");
        var command = new Command("preview", "Preview an email template in the browser") { templateArg };

        command.SetHandler(async (InvocationContext context) =>
        {
            var template = context.ParseResult.GetValueForArgument(templateArg);
            var service = services.GetRequiredService<IEmailService>();
            var url = await service.PreviewAsync(template);

            Console.WriteLine($"Preview URL: {url}");
            context.ExitCode = 0;
        });

        return command;
    }

    private static Command CreateTemplatesCommand(IServiceProvider services)
    {
        var command = new Command("templates", "List all available email templates");

        command.SetHandler(async (InvocationContext context) =>
        {
            var service = services.GetRequiredService<IEmailService>();
            var templates = await service.ListTemplatesAsync();

            Console.WriteLine($"{"Template",-25} {"Service",-15} {"Variables"}");
            Console.WriteLine(new string('-', 80));

            foreach (var t in templates)
            {
                Console.WriteLine($"{t.Name,-25} {t.Service,-15} {t.Variables}");
            }

            context.ExitCode = 0;
        });

        return command;
    }

    private static Command CreateCampaignCommand(IServiceProvider services)
    {
        var subjectOption = new Option<string>("--subject", "Campaign subject line") { IsRequired = true };
        var templateOption = new Option<string>("--template", "Email template name") { IsRequired = true };
        var tagOption = new Option<string>("--tag", "Campaign tag for tracking") { IsRequired = true };
        var testToOption = new Option<string?>("--test-to", "Send a test to this email instead of all subscribers");

        var command = new Command("campaign", "Send a campaign email")
        {
            subjectOption, templateOption, tagOption, testToOption
        };

        command.SetHandler(async (InvocationContext context) =>
        {
            var subject = context.ParseResult.GetValueForOption(subjectOption)!;
            var template = context.ParseResult.GetValueForOption(templateOption)!;
            var tag = context.ParseResult.GetValueForOption(tagOption)!;
            var testTo = context.ParseResult.GetValueForOption(testToOption);

            var service = services.GetRequiredService<IEmailService>();
            await service.SendCampaignAsync(subject, template, tag, testTo);

            Console.WriteLine("Campaign dispatched.");
            context.ExitCode = 0;
        });

        return command;
    }

    private static Command CreateServerCommand(IServiceProvider services)
    {
        var portOption = new Option<int>("--port", () => 1025, "SMTP server port");
        var command = new Command("server", "Start a local SMTP trap for testing") { portOption };

        command.SetHandler(async (InvocationContext context) =>
        {
            var port = context.ParseResult.GetValueForOption(portOption);
            var service = services.GetRequiredService<IEmailService>();
            await service.StartLocalServerAsync(port);

            Console.WriteLine($"Local SMTP trap running on port {port}.");
            context.ExitCode = 0;
        });

        return command;
    }
}

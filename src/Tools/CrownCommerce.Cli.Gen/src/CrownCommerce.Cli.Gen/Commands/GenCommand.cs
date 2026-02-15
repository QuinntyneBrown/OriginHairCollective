using System.CommandLine;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;

namespace CrownCommerce.Cli.Gen.Commands;

public interface IGeneratorService
{
    Task GenerateEntityAsync(string service, string entityName);
    Task GenerateConsumerAsync(string service, string eventName);
    Task GenerateServiceAsync(string serviceName);
    Task GeneratePageAsync(string app, string pageName);
}

public class GeneratorService : IGeneratorService
{
    private readonly ILogger<GeneratorService> _logger;

    public GeneratorService(ILogger<GeneratorService> logger)
    {
        _logger = logger;
    }

    public Task GenerateEntityAsync(string service, string entityName)
    {
        var pascalService = char.ToUpper(service[0]) + service[1..];

        _logger.LogInformation("Generating entity '{Entity}' for service '{Service}'...", entityName, service);
        _logger.LogInformation("  Would create: src/Services/{Service}/CrownCommerce.{Service}.Core/Entities/{Entity}.cs",
            pascalService, pascalService, entityName);
        _logger.LogInformation("  Would update: src/Services/{Service}/CrownCommerce.{Service}.Infrastructure/Data/{Service}DbContext.cs",
            pascalService, pascalService, pascalService);
        _logger.LogInformation("  Would create: src/Services/{Service}/CrownCommerce.{Service}.Api/Controllers/{Entity}Controller.cs",
            pascalService, pascalService, entityName);
        _logger.LogInformation("Entity scaffolding complete.");

        return Task.CompletedTask;
    }

    public Task GenerateConsumerAsync(string service, string eventName)
    {
        var pascalService = char.ToUpper(service[0]) + service[1..];

        _logger.LogInformation("Generating consumer for event '{Event}' in service '{Service}'...", eventName, service);
        _logger.LogInformation("  Would create: src/Services/{Service}/CrownCommerce.{Service}.Application/Consumers/{Event}Consumer.cs",
            pascalService, pascalService, eventName);
        _logger.LogInformation("Consumer scaffolding complete.");

        return Task.CompletedTask;
    }

    public Task GenerateServiceAsync(string serviceName)
    {
        var pascalService = char.ToUpper(serviceName[0]) + serviceName[1..];

        _logger.LogInformation("Generating full service scaffold for '{Service}'...", serviceName);
        _logger.LogInformation("  Would create: src/Services/{Service}/CrownCommerce.{Service}.Core/", pascalService, pascalService);
        _logger.LogInformation("  Would create: src/Services/{Service}/CrownCommerce.{Service}.Infrastructure/", pascalService, pascalService);
        _logger.LogInformation("  Would create: src/Services/{Service}/CrownCommerce.{Service}.Application/", pascalService, pascalService);
        _logger.LogInformation("  Would create: src/Services/{Service}/CrownCommerce.{Service}.Api/", pascalService, pascalService);
        _logger.LogInformation("Service scaffolding complete.");

        return Task.CompletedTask;
    }

    public Task GeneratePageAsync(string app, string pageName)
    {
        var kebabPage = string.Concat(pageName.Select((c, i) =>
            i > 0 && char.IsUpper(c) ? $"-{char.ToLower(c)}" : $"{char.ToLower(c)}"));

        _logger.LogInformation("Generating Angular page '{Page}' for app '{App}'...", pageName, app);
        _logger.LogInformation("  Would create: src/CrownCommerce.Web/projects/{App}/src/app/pages/{Page}/{Page}.component.ts",
            app, kebabPage, kebabPage);
        _logger.LogInformation("  Would create: src/CrownCommerce.Web/projects/{App}/src/app/pages/{Page}/{Page}.component.html",
            app, kebabPage, kebabPage);
        _logger.LogInformation("  Would create: src/CrownCommerce.Web/projects/{App}/src/app/pages/{Page}/{Page}.component.scss",
            app, kebabPage, kebabPage);
        _logger.LogInformation("Page scaffolding complete.");

        return Task.CompletedTask;
    }
}

public static class GenCommand
{
    public static RootCommand Create(IServiceProvider services)
    {
        var rootCommand = new RootCommand("Crown Commerce Code Scaffolder");

        rootCommand.AddCommand(CreateEntityCommand(services));
        rootCommand.AddCommand(CreateConsumerCommand(services));
        rootCommand.AddCommand(CreateServiceCommand(services));
        rootCommand.AddCommand(CreatePageCommand(services));

        return rootCommand;
    }

    private static Command CreateEntityCommand(IServiceProvider services)
    {
        var serviceArg = new Argument<string>("service", "The target microservice name");
        var entityNameArg = new Argument<string>("entity-name", "The entity class name");

        var command = new Command("entity", "Generate an entity with controller and DbContext update")
        {
            serviceArg,
            entityNameArg,
        };

        command.SetHandler(async (string service, string entityName) =>
        {
            var generatorService = services.GetRequiredService<IGeneratorService>();
            await generatorService.GenerateEntityAsync(service, entityName);
        }, serviceArg, entityNameArg);

        return command;
    }

    private static Command CreateConsumerCommand(IServiceProvider services)
    {
        var serviceArg = new Argument<string>("service", "The target microservice name");
        var eventNameArg = new Argument<string>("event-name", "The event name for the consumer");

        var command = new Command("consumer", "Generate a MassTransit consumer for an event")
        {
            serviceArg,
            eventNameArg,
        };

        command.SetHandler(async (string service, string eventName) =>
        {
            var generatorService = services.GetRequiredService<IGeneratorService>();
            await generatorService.GenerateConsumerAsync(service, eventName);
        }, serviceArg, eventNameArg);

        return command;
    }

    private static Command CreateServiceCommand(IServiceProvider services)
    {
        var serviceNameArg = new Argument<string>("service-name", "The new service name to scaffold");

        var command = new Command("service", "Generate a full microservice scaffold")
        {
            serviceNameArg,
        };

        command.SetHandler(async (string serviceName) =>
        {
            var generatorService = services.GetRequiredService<IGeneratorService>();
            await generatorService.GenerateServiceAsync(serviceName);
        }, serviceNameArg);

        return command;
    }

    private static Command CreatePageCommand(IServiceProvider services)
    {
        var appArg = new Argument<string>("app", "The Angular application name");
        var pageNameArg = new Argument<string>("page-name", "The page component name");

        var command = new Command("page", "Generate an Angular page component")
        {
            appArg,
            pageNameArg,
        };

        command.SetHandler(async (string app, string pageName) =>
        {
            var generatorService = services.GetRequiredService<IGeneratorService>();
            await generatorService.GeneratePageAsync(app, pageName);
        }, appArg, pageNameArg);

        return command;
    }
}

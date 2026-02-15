using System.CommandLine;
using CrownCommerce.Cli.Cron.Commands;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using NSubstitute;
using Xunit;

namespace CrownCommerce.Cli.Cron.Tests;

public class CronCommandTests
{
    [Fact]
    public async Task List_CallsListJobsAsync_ReturnsZero()
    {
        // Arrange
        var cronService = Substitute.For<ICronService>();
        cronService.ListJobsAsync().Returns(new List<CronJobDefinition>
        {
            new("test-job", "*/5 * * * *", "test", "A test job"),
        });

        var builder = Host.CreateApplicationBuilder();
        builder.Services.AddSingleton(cronService);
        using var host = builder.Build();

        var rootCommand = CronCommand.Create(host.Services);

        // Act
        var exitCode = await rootCommand.InvokeAsync(["list"]);

        // Assert
        Assert.Equal(0, exitCode);
        await cronService.Received(1).ListJobsAsync();
    }
}

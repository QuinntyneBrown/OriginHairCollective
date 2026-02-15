using System.CommandLine;
using CrownCommerce.Cli.Logs.Commands;
using Microsoft.Extensions.DependencyInjection;
using NSubstitute;
using Xunit;

namespace CrownCommerce.Cli.Logs.Tests;

public class LogsCommandTests
{
    [Fact]
    public async Task Logs_With_Service_And_Level_Invokes_TailLogsAsync_With_Correct_Parameters()
    {
        // Arrange
        var fakeLogService = Substitute.For<ILogService>();
        fakeLogService.TailLogsAsync(
            Arg.Any<string[]?>(),
            Arg.Any<string?>(),
            Arg.Any<string?>(),
            Arg.Any<string?>(),
            Arg.Any<string?>())
            .Returns(Task.CompletedTask);

        var services = new ServiceCollection();
        services.AddSingleton(fakeLogService);
        var serviceProvider = services.BuildServiceProvider();

        var rootCommand = LogsCommand.Create(serviceProvider);

        // Act
        var exitCode = await rootCommand.InvokeAsync(["--service", "catalog", "--level", "error"]);

        // Assert
        Assert.Equal(0, exitCode);
        await fakeLogService.Received(1).TailLogsAsync(
            Arg.Is<string[]?>(s => s != null && s.Length == 1 && s[0] == "catalog"),
            "error",
            null,
            null,
            null);
    }
}

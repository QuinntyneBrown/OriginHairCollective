using System.CommandLine;
using CrownCommerce.Cli.Sync.Commands;
using Microsoft.Extensions.DependencyInjection;
using NSubstitute;
using Xunit;

namespace CrownCommerce.Cli.Sync.Tests;

public class SyncCommandTests
{
    [Fact]
    public async Task Now_Command_Invokes_ShowTeamStatusAsync_And_Returns_Zero()
    {
        // Arrange
        var fakeSyncService = Substitute.For<ISyncService>();
        fakeSyncService.ShowTeamStatusAsync().Returns(Task.CompletedTask);

        var services = new ServiceCollection();
        services.AddSingleton(fakeSyncService);
        var serviceProvider = services.BuildServiceProvider();

        var rootCommand = SyncCommand.Create(serviceProvider);

        // Act
        var exitCode = await rootCommand.InvokeAsync(["now"]);

        // Assert
        Assert.Equal(0, exitCode);
        await fakeSyncService.Received(1).ShowTeamStatusAsync();
    }
}

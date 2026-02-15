using System.CommandLine;
using CrownCommerce.Cli.Migrate.Commands;
using Microsoft.Extensions.DependencyInjection;
using NSubstitute;
using Xunit;

namespace CrownCommerce.Cli.Migrate.Tests;

public class MigrateCommandTests
{
    [Fact]
    public async Task Status_Command_Invokes_GetStatusAsync_And_Returns_Zero()
    {
        // Arrange
        var fakeMigrationService = Substitute.For<IMigrationService>();
        fakeMigrationService.GetStatusAsync(Arg.Any<string>())
            .Returns(new List<MigrationStatus>
            {
                new("catalog", 5, 0),
                new("identity", 3, 1),
            });

        var services = new ServiceCollection();
        services.AddSingleton(fakeMigrationService);
        var serviceProvider = services.BuildServiceProvider();

        var rootCommand = MigrateCommand.Create(serviceProvider);

        // Act
        var exitCode = await rootCommand.InvokeAsync(["status"]);

        // Assert
        Assert.Equal(0, exitCode);
        await fakeMigrationService.Received(1).GetStatusAsync("development");
    }
}

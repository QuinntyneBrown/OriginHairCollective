using System.CommandLine;
using CrownCommerce.Cli.Seed.Commands;
using Microsoft.Extensions.DependencyInjection;
using NSubstitute;
using Xunit;

namespace CrownCommerce.Cli.Seed.Tests;

public class SeedCommandTests
{
    [Fact]
    public async Task Seed_Command_Calls_SeedAsync_With_Correct_Args_And_Returns_Zero()
    {
        // Arrange
        var fakeSeedService = Substitute.For<ISeedService>();
        fakeSeedService.SeedAsync("catalog", "demo", false, false)
            .Returns(Task.CompletedTask);

        var services = new ServiceCollection();
        services.AddSingleton(fakeSeedService);
        var serviceProvider = services.BuildServiceProvider();

        var rootCommand = SeedCommand.Create(serviceProvider);

        // Act
        var exitCode = await rootCommand.InvokeAsync(["catalog", "--profile", "demo"]);

        // Assert
        Assert.Equal(0, exitCode);
        await fakeSeedService.Received(1).SeedAsync("catalog", "demo", false, false);
    }
}

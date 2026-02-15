using System.CommandLine;
using CrownCommerce.Cli.Deploy.Commands;
using Microsoft.Extensions.DependencyInjection;
using NSubstitute;
using Xunit;

namespace CrownCommerce.Cli.Deploy.Tests;

public class DeployCommandTests
{
    [Fact]
    public async Task Status_Command_Calls_GetStatusAsync_With_Env_And_Returns_Zero()
    {
        // Arrange
        var fakeDeploymentService = Substitute.For<IDeploymentService>();
        fakeDeploymentService.GetStatusAsync("staging")
            .Returns(true);

        var services = new ServiceCollection();
        services.AddSingleton(fakeDeploymentService);
        var serviceProvider = services.BuildServiceProvider();

        var rootCommand = DeployCommand.Create(serviceProvider);

        // Act
        var exitCode = await rootCommand.InvokeAsync(["status", "--env", "staging"]);

        // Assert
        Assert.Equal(0, exitCode);
        await fakeDeploymentService.Received(1).GetStatusAsync("staging");
    }
}

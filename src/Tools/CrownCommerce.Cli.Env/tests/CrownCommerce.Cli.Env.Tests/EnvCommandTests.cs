using System.CommandLine;
using CrownCommerce.Cli.Env.Commands;
using Microsoft.Extensions.DependencyInjection;
using NSubstitute;
using Xunit;

namespace CrownCommerce.Cli.Env.Tests;

public class EnvCommandTests
{
    [Fact]
    public async Task Ports_Command_Invokes_ListPortsAsync_And_Returns_Zero()
    {
        // Arrange
        var fakeEnvService = Substitute.For<IEnvironmentService>();
        fakeEnvService.ListPortsAsync().Returns(Task.CompletedTask);

        var services = new ServiceCollection();
        services.AddSingleton(fakeEnvService);
        var serviceProvider = services.BuildServiceProvider();

        var rootCommand = EnvCommand.Create(serviceProvider);

        // Act
        var exitCode = await rootCommand.InvokeAsync(["ports"]);

        // Assert
        Assert.Equal(0, exitCode);
        await fakeEnvService.Received(1).ListPortsAsync();
    }
}

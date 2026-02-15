using System.CommandLine;
using CrownCommerce.Cli.Gen.Commands;
using Microsoft.Extensions.DependencyInjection;
using NSubstitute;
using Xunit;

namespace CrownCommerce.Cli.Gen.Tests;

public class GenCommandTests
{
    [Fact]
    public async Task Entity_Command_Invokes_GenerateEntityAsync_And_Returns_Zero()
    {
        // Arrange
        var fakeGeneratorService = Substitute.For<IGeneratorService>();
        fakeGeneratorService.GenerateEntityAsync(Arg.Any<string>(), Arg.Any<string>())
            .Returns(Task.CompletedTask);

        var services = new ServiceCollection();
        services.AddSingleton(fakeGeneratorService);
        var serviceProvider = services.BuildServiceProvider();

        var rootCommand = GenCommand.Create(serviceProvider);

        // Act
        var exitCode = await rootCommand.InvokeAsync(["entity", "catalog", "HairBundle"]);

        // Assert
        Assert.Equal(0, exitCode);
        await fakeGeneratorService.Received(1).GenerateEntityAsync("catalog", "HairBundle");
    }
}

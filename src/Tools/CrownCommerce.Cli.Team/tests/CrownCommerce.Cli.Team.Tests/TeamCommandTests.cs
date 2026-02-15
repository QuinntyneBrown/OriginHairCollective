using System.CommandLine;
using CrownCommerce.Cli.Team.Commands;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using NSubstitute;
using Xunit;

namespace CrownCommerce.Cli.Team.Tests;

public class TeamCommandTests
{
    [Fact]
    public async Task List_CallsListAsync_ReturnsZero()
    {
        // Arrange
        var teamService = Substitute.For<ITeamService>();
        teamService.ListAsync(null, "active").Returns(new List<TeamMember>
        {
            new("quinn@crowncommerce.io", "Quinn", "Brown", "Admin", "Engineering", "America/Toronto", "active"),
        });

        var builder = Host.CreateApplicationBuilder();
        builder.Services.AddSingleton(teamService);
        using var host = builder.Build();

        var rootCommand = TeamCommand.Create(host.Services);

        // Act
        var exitCode = await rootCommand.InvokeAsync(["list"]);

        // Assert
        Assert.Equal(0, exitCode);
        await teamService.Received(1).ListAsync(null, "active");
    }
}

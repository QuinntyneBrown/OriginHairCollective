using System.CommandLine;
using CrownCommerce.Cli.Schedule.Commands;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using NSubstitute;
using Xunit;

namespace CrownCommerce.Cli.Schedule.Tests;

public class ScheduleCommandTests
{
    [Fact]
    public async Task Meetings_CallsListMeetingsAsync_ReturnsZero()
    {
        // Arrange
        var scheduleService = Substitute.For<IScheduleService>();
        scheduleService.ListMeetingsAsync(false, null).Returns(new List<Meeting>
        {
            new("Sprint Planning", DateTime.UtcNow.Date.AddHours(10), "1h",
                ["quinn@crowncommerce.io"], "Zoom"),
        });

        var builder = Host.CreateApplicationBuilder();
        builder.Services.AddSingleton(scheduleService);
        using var host = builder.Build();

        var rootCommand = ScheduleCommand.Create(host.Services);

        // Act
        var exitCode = await rootCommand.InvokeAsync(["meetings"]);

        // Assert
        Assert.Equal(0, exitCode);
        await scheduleService.Received(1).ListMeetingsAsync(false, null);
    }
}

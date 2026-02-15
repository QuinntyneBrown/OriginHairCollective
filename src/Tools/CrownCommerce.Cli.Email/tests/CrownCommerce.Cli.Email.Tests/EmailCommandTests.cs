using System.CommandLine;
using CrownCommerce.Cli.Email.Commands;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using NSubstitute;
using Xunit;

namespace CrownCommerce.Cli.Email.Tests;

public class EmailCommandTests
{
    [Fact]
    public async Task Templates_CallsListTemplatesAsync_ReturnsZero()
    {
        // Arrange
        var emailService = Substitute.For<IEmailService>();
        emailService.ListTemplatesAsync().Returns(new List<EmailTemplate>
        {
            new("order-confirmation", "order", "orderNumber, customerName"),
        });

        var builder = Host.CreateApplicationBuilder();
        builder.Services.AddSingleton(emailService);
        using var host = builder.Build();

        var rootCommand = EmailCommand.Create(host.Services);

        // Act
        var exitCode = await rootCommand.InvokeAsync(["templates"]);

        // Assert
        Assert.Equal(0, exitCode);
        await emailService.Received(1).ListTemplatesAsync();
    }
}

using OriginHairCollective.Shared.Contracts;
using MassTransit;
using Microsoft.Extensions.Logging;

namespace OriginHairCollective.Inquiry.Application.Consumers;

public sealed class ProductInterestConsumer(ILogger<ProductInterestConsumer> logger) : IConsumer<ProductInterestEvent>
{
    public Task Consume(ConsumeContext<ProductInterestEvent> context)
    {
        var evt = context.Message;

        logger.LogInformation(
            "Product interest received — Customer: {CustomerName} ({CustomerEmail}), Product: {ProductName} ({ProductId}), Message: {Message}",
            evt.CustomerName, evt.CustomerEmail, evt.ProductName, evt.ProductId, evt.Message);

        return Task.CompletedTask;
    }
}

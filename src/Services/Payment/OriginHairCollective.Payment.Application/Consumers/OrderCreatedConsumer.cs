using OriginHairCollective.Shared.Contracts;
using MassTransit;
using Microsoft.Extensions.Logging;

namespace OriginHairCollective.Payment.Application.Consumers;

public sealed class OrderCreatedConsumer(ILogger<OrderCreatedConsumer> logger) : IConsumer<OrderCreatedEvent>
{
    public Task Consume(ConsumeContext<OrderCreatedEvent> context)
    {
        var evt = context.Message;
        logger.LogInformation(
            "Order created — OrderId: {OrderId}, Customer: {CustomerEmail}, Amount: {Amount}",
            evt.OrderId, evt.CustomerEmail, evt.TotalAmount);
        return Task.CompletedTask;
    }
}

using OriginHairCollective.Notification.Application.Consumers;
using OriginHairCollective.Notification.Application.Services;
using OriginHairCollective.Notification.Core.Interfaces;
using OriginHairCollective.Notification.Infrastructure.Data;
using OriginHairCollective.Notification.Infrastructure.Repositories;
using OriginHairCollective.ServiceDefaults;
using MassTransit;
using Microsoft.EntityFrameworkCore;

var builder = WebApplication.CreateBuilder(args);

builder.AddServiceDefaults();

builder.Services.AddControllers();
builder.Services.AddOpenApi();

builder.Services.AddDbContext<NotificationDbContext>(options =>
    options.UseSqlite(builder.Configuration.GetConnectionString("NotificationDb")
        ?? "Data Source=notification.db"));

builder.Services.AddScoped<INotificationLogRepository, NotificationLogRepository>();
builder.Services.AddScoped<INotificationService, NotificationService>();

builder.Services.AddMassTransit(x =>
{
    x.AddConsumer<OrderCreatedNotificationConsumer>();
    x.AddConsumer<PaymentCompletedNotificationConsumer>();
    x.AddConsumer<OrderStatusChangedNotificationConsumer>();
    x.AddConsumer<RefundIssuedNotificationConsumer>();
    x.AddConsumer<InquiryReceivedNotificationConsumer>();
    x.AddConsumer<ChatConversationStartedNotificationConsumer>();
    x.AddConsumer<SubscriptionConfirmationConsumer>();
    x.AddConsumer<CampaignCompletedNotificationConsumer>();

    x.UsingRabbitMq((context, cfg) =>
    {
        var connectionString = builder.Configuration.GetConnectionString("messaging");
        if (!string.IsNullOrEmpty(connectionString))
        {
            cfg.Host(connectionString);
        }

        cfg.ConfigureEndpoints(context);
    });
});

var app = builder.Build();

using (var scope = app.Services.CreateScope())
{
    var context = scope.ServiceProvider.GetRequiredService<NotificationDbContext>();
    await context.Database.EnsureCreatedAsync();
}

app.MapDefaultEndpoints();

if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
}

app.MapControllers();

app.Run();

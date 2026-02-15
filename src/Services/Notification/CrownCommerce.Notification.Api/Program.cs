using CrownCommerce.Notification.Application.Consumers;
using CrownCommerce.Notification.Application.Services;
using CrownCommerce.Notification.Core.Interfaces;
using CrownCommerce.Notification.Infrastructure.Data;
using CrownCommerce.Notification.Infrastructure.Email;
using CrownCommerce.Notification.Infrastructure.Repositories;
using CrownCommerce.ServiceDefaults;
using MassTransit;
using Microsoft.EntityFrameworkCore;

var builder = WebApplication.CreateBuilder(args);

builder.AddServiceDefaults();

builder.Services.AddControllers();
builder.Services.AddOpenApi();

builder.Services.AddDbContext<NotificationDbContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("NotificationDb")
        ?? "Server=(localdb)\\MSSQLLocalDB;Database=CrownCommerce_Notification;Trusted_Connection=True;TrustServerCertificate=True;"));

builder.Services.AddScoped<INotificationLogRepository, NotificationLogRepository>();
builder.Services.AddScoped<INotificationService, NotificationService>();
builder.Services.AddScoped<IEmailSender, SendGridEmailSender>();

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

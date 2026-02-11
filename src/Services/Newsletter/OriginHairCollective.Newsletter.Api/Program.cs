using OriginHairCollective.Newsletter.Api.BackgroundServices;
using OriginHairCollective.Newsletter.Application.Consumers;
using OriginHairCollective.Newsletter.Application.Email;
using OriginHairCollective.Newsletter.Application.Services;
using OriginHairCollective.Newsletter.Core.Interfaces;
using OriginHairCollective.Newsletter.Infrastructure.Data;
using OriginHairCollective.Newsletter.Infrastructure.Repositories;
using OriginHairCollective.ServiceDefaults;
using MassTransit;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;

var builder = WebApplication.CreateBuilder(args);

builder.AddServiceDefaults();

builder.Services.AddControllers();
builder.Services.AddOpenApi();

// Database
builder.Services.AddDbContext<NewsletterDbContext>(options =>
    options.UseSqlite(builder.Configuration.GetConnectionString("NewsletterDb")
        ?? "Data Source=newsletter.db"));

// Repositories
builder.Services.AddScoped<ISubscriberRepository, SubscriberRepository>();
builder.Services.AddScoped<ICampaignRepository, CampaignRepository>();
builder.Services.AddScoped<ICampaignRecipientRepository, CampaignRecipientRepository>();

// Services
builder.Services.AddScoped<INewsletterSubscriptionService, NewsletterSubscriptionService>();
builder.Services.AddScoped<INewsletterAdminService, NewsletterAdminService>();
builder.Services.AddScoped<ITrackingService, TrackingService>();

// Email
builder.Services.AddScoped<IEmailSender, SmtpEmailSender>();
builder.Services.AddScoped<IEmailContentProcessor, EmailContentProcessor>();

// Background Services
builder.Services.AddHostedService<CampaignSchedulerService>();

// MassTransit
builder.Services.AddMassTransit(x =>
{
    x.AddConsumer<UserRegisteredNewsletterConsumer>();
    x.AddConsumer<CampaignSendConsumer>();

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

// Auth
builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer();
builder.Services.AddAuthorization();

var app = builder.Build();

// Ensure DB created
using (var scope = app.Services.CreateScope())
{
    var context = scope.ServiceProvider.GetRequiredService<NewsletterDbContext>();
    await NewsletterDbSeeder.SeedAsync(context);
}

app.MapDefaultEndpoints();

if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
}

app.UseAuthentication();
app.UseAuthorization();
app.MapControllers();

app.Run();

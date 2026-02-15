using CrownCommerce.Newsletter.Api.BackgroundServices;
using CrownCommerce.Newsletter.Application.Consumers;
using CrownCommerce.Newsletter.Application.Email;
using CrownCommerce.Newsletter.Application.Services;
using CrownCommerce.Newsletter.Core.Interfaces;
using CrownCommerce.Newsletter.Infrastructure.Data;
using CrownCommerce.Newsletter.Infrastructure.Repositories;
using CrownCommerce.ServiceDefaults;
using MassTransit;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;

var builder = WebApplication.CreateBuilder(args);

builder.AddServiceDefaults();

builder.Services.AddControllers();
builder.Services.AddOpenApi();

// Database
builder.Services.AddDbContext<NewsletterDbContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("NewsletterDb")
        ?? "Server=(localdb)\\MSSQLLocalDB;Database=CrownCommerce_Newsletter;Trusted_Connection=True;TrustServerCertificate=True;"));

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

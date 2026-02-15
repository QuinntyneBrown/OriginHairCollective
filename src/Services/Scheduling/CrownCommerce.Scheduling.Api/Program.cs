using System.Text;
using CrownCommerce.Scheduling.Api.Hubs;
using CrownCommerce.Scheduling.Application.Consumers;
using CrownCommerce.Scheduling.Application.Services;
using CrownCommerce.Scheduling.Core.Interfaces;
using CrownCommerce.Scheduling.Infrastructure.Data;
using CrownCommerce.Scheduling.Infrastructure.Repositories;
using CrownCommerce.Scheduling.Infrastructure.Calling;
using CrownCommerce.Scheduling.Infrastructure.Storage;
using CrownCommerce.ServiceDefaults;
using MassTransit;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;

var builder = WebApplication.CreateBuilder(args);

builder.AddServiceDefaults();

builder.Services.AddControllers();
builder.Services.AddOpenApi();

// Database
builder.Services.AddDbContext<SchedulingDbContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("SchedulingDb")
        ?? "Server=(localdb)\\MSSQLLocalDB;Database=CrownCommerce_Scheduling;Trusted_Connection=True;TrustServerCertificate=True;"));

// Repositories
builder.Services.AddScoped<IEmployeeRepository, EmployeeRepository>();
builder.Services.AddScoped<IMeetingRepository, MeetingRepository>();
builder.Services.AddScoped<IConversationRepository, ConversationRepository>();
builder.Services.AddScoped<IFileAttachmentRepository, FileAttachmentRepository>();

// File storage (local for dev)
var uploadPath = Path.Combine(builder.Environment.ContentRootPath, "uploads");
builder.Services.AddSingleton<IFileStorageService>(new LocalFileStorageService(uploadPath, "/api/scheduling"));

// Calling (Daily.co)
var dailyApiKey = builder.Configuration["DailyCo:ApiKey"] ?? "";
var dailyBaseUrl = builder.Configuration["DailyCo:BaseUrl"] ?? "https://api.daily.co/v1";
builder.Services.AddHttpClient<ICallingService, DailyCoCallingService>(client =>
{
    client.BaseAddress = new Uri(dailyBaseUrl.TrimEnd('/') + "/");
    client.DefaultRequestHeaders.Add("Authorization", $"Bearer {dailyApiKey}");
});

// Services
builder.Services.AddScoped<ISchedulingService, SchedulingService>();

// MassTransit
builder.Services.AddMassTransit(x =>
{
    x.AddConsumer<MeetingBookedNotificationConsumer>();
    x.AddConsumer<MeetingCancelledNotificationConsumer>();

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
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidIssuer = "CrownCommerce.Identity",
            ValidateAudience = true,
            ValidAudience = "CrownCommerce",
            ValidateLifetime = true,
            IssuerSigningKey = new SymmetricSecurityKey(
                Encoding.UTF8.GetBytes(builder.Configuration["Jwt:Key"] ?? "DefaultDevKeyThatShouldBeReplaced123!"))
        };
    });

builder.Services.AddAuthorization();

// SignalR
builder.Services.AddSignalR();

var app = builder.Build();

// Ensure DB created and seeded
using (var scope = app.Services.CreateScope())
{
    var context = scope.ServiceProvider.GetRequiredService<SchedulingDbContext>();
    await SchedulingDbSeeder.SeedAsync(context);
}

app.MapDefaultEndpoints();

if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
}

app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();
app.MapHub<TeamHub>("/hubs/team");

app.Run();

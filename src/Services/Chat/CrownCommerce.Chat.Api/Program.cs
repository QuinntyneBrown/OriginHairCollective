using System.Text;
using CrownCommerce.Chat.Application.Ai;
using CrownCommerce.Chat.Application.Consumers;
using CrownCommerce.Chat.Application.Services;
using CrownCommerce.Chat.Core.Interfaces;
using CrownCommerce.Chat.Infrastructure.Data;
using CrownCommerce.Chat.Infrastructure.Repositories;
using CrownCommerce.Chat.Api.Hubs;
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
builder.Services.AddDbContext<ChatDbContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("ChatDb")
        ?? "Server=(localdb)\\MSSQLLocalDB;Database=CrownCommerce_Chat;Trusted_Connection=True;TrustServerCertificate=True;"));

// Repositories
builder.Services.AddScoped<IConversationRepository, ConversationRepository>();
builder.Services.AddScoped<IChatMessageRepository, ChatMessageRepository>();

// Services
builder.Services.AddScoped<IChatService, ChatService>();
builder.Services.AddScoped<IChatAiService, ChatAiService>();
builder.Services.AddSingleton<SystemPromptBuilder>();

// LLM HTTP Client
builder.Services.AddHttpClient("LlmProvider", client =>
{
    client.BaseAddress = new Uri(builder.Configuration["Ai:BaseUrl"] ?? "https://api.anthropic.com");
    var apiKey = builder.Configuration["Ai:ApiKey"];
    if (!string.IsNullOrEmpty(apiKey))
    {
        client.DefaultRequestHeaders.Add("x-api-key", apiKey);
    }
    client.DefaultRequestHeaders.Add("anthropic-version", "2023-06-01");
    client.Timeout = TimeSpan.FromSeconds(60);
});

// MassTransit
builder.Services.AddMassTransit(x =>
{
    x.AddConsumer<ProductCatalogChangedConsumer>();

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

// SignalR
builder.Services.AddSignalR();

// Auth (for admin endpoints only)
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

var app = builder.Build();

// Ensure database is created
using (var scope = app.Services.CreateScope())
{
    var context = scope.ServiceProvider.GetRequiredService<ChatDbContext>();
    await context.Database.EnsureCreatedAsync();
}

app.MapDefaultEndpoints();

if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
}

app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();
app.MapHub<ChatHub>("/hubs/chat");

app.Run();

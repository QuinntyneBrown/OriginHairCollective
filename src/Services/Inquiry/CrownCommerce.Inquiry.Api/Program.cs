using CrownCommerce.Inquiry.Application.Consumers;
using CrownCommerce.Inquiry.Application.Services;
using CrownCommerce.Inquiry.Core.Interfaces;
using CrownCommerce.Inquiry.Infrastructure.Data;
using CrownCommerce.Inquiry.Infrastructure.Repositories;
using CrownCommerce.ServiceDefaults;
using MassTransit;
using Microsoft.EntityFrameworkCore;

var builder = WebApplication.CreateBuilder(args);

builder.AddServiceDefaults();

builder.Services.AddControllers();
builder.Services.AddOpenApi();

builder.Services.AddDbContext<InquiryDbContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("InquiryDb")
        ?? "Server=(localdb)\\MSSQLLocalDB;Database=CrownCommerce_Inquiry;Trusted_Connection=True;TrustServerCertificate=True;"));

builder.Services.AddScoped<IInquiryRepository, InquiryRepository>();
builder.Services.AddScoped<IInquiryService, InquiryService>();

builder.Services.AddMassTransit(x =>
{
    x.AddConsumer<ProductInterestConsumer>();

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
    var context = scope.ServiceProvider.GetRequiredService<InquiryDbContext>();
    await context.Database.EnsureCreatedAsync();
}

app.MapDefaultEndpoints();

if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
}

app.MapControllers();

app.Run();

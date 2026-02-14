using CrownCommerce.Vendor.Application.Services;
using CrownCommerce.Vendor.Core.Interfaces;
using CrownCommerce.Vendor.Infrastructure.Data;
using CrownCommerce.Vendor.Infrastructure.Repositories;
using CrownCommerce.ServiceDefaults;
using MassTransit;
using Microsoft.EntityFrameworkCore;

var builder = WebApplication.CreateBuilder(args);

builder.AddServiceDefaults();

builder.Services.AddControllers();
builder.Services.AddOpenApi();

builder.Services.AddDbContext<VendorDbContext>(options =>
    options.UseSqlite(builder.Configuration.GetConnectionString("VendorDb")
        ?? "Data Source=vendor.db"));

builder.Services.AddScoped<IVendorRepository, VendorRepository>();
builder.Services.AddScoped<IVendorService, VendorService>();

builder.Services.AddMassTransit(x =>
{
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
    var context = scope.ServiceProvider.GetRequiredService<VendorDbContext>();
    await context.Database.EnsureCreatedAsync();
}

app.MapDefaultEndpoints();

if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
}

app.MapControllers();

app.Run();

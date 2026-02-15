using System.CommandLine;
using CrownCommerce.Cli.Migrate.Commands;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;

var builder = Host.CreateApplicationBuilder(args);

builder.Services.AddSingleton<IMigrationService, MigrationService>();

using var host = builder.Build();

var rootCommand = MigrateCommand.Create(host.Services);

return await rootCommand.InvokeAsync(args);

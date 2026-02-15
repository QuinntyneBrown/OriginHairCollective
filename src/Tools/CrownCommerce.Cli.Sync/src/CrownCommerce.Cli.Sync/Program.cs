using System.CommandLine;
using CrownCommerce.Cli.Sync.Commands;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;

var builder = Host.CreateApplicationBuilder(args);

builder.Services.AddSingleton<ISyncService, SyncService>();

using var host = builder.Build();

var rootCommand = SyncCommand.Create(host.Services);

return await rootCommand.InvokeAsync(args);

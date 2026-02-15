using System.CommandLine;
using CrownCommerce.Cli.Logs.Commands;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;

var builder = Host.CreateApplicationBuilder(args);

builder.Services.AddSingleton<ILogService, LogService>();

using var host = builder.Build();

var rootCommand = LogsCommand.Create(host.Services);

return await rootCommand.InvokeAsync(args);

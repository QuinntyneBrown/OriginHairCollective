using System.CommandLine;
using CrownCommerce.Cli.Cron.Commands;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;

var builder = Host.CreateApplicationBuilder(args);
builder.Services.AddSingleton<ICronService, CronService>();
using var host = builder.Build();

var rootCommand = CronCommand.Create(host.Services);
return await rootCommand.InvokeAsync(args);

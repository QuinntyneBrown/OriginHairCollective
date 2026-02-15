using System.CommandLine;
using CrownCommerce.Cli.Schedule.Commands;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;

var builder = Host.CreateApplicationBuilder(args);
builder.Services.AddSingleton<IScheduleService, ScheduleService>();
using var host = builder.Build();

var rootCommand = ScheduleCommand.Create(host.Services);
return await rootCommand.InvokeAsync(args);

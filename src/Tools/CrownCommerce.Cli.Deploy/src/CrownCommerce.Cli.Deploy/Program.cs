using System.CommandLine;
using CrownCommerce.Cli.Deploy.Commands;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;

var builder = Host.CreateApplicationBuilder(args);

builder.Services.AddSingleton<IDeploymentService, DeploymentService>();

using var host = builder.Build();

var rootCommand = DeployCommand.Create(host.Services);

return await rootCommand.InvokeAsync(args);

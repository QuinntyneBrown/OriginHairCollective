using System.CommandLine;
using CrownCommerce.Cli.Gen.Commands;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;

var builder = Host.CreateApplicationBuilder(args);

builder.Services.AddSingleton<IGeneratorService, GeneratorService>();

using var host = builder.Build();

var rootCommand = GenCommand.Create(host.Services);

return await rootCommand.InvokeAsync(args);

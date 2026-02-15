using System.CommandLine;
using CrownCommerce.Cli.Team.Commands;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;

var builder = Host.CreateApplicationBuilder(args);
builder.Services.AddSingleton<ITeamService, TeamService>();
using var host = builder.Build();

var rootCommand = TeamCommand.Create(host.Services);
return await rootCommand.InvokeAsync(args);

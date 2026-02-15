using System.CommandLine;
using CrownCommerce.Cli.Email.Commands;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;

var builder = Host.CreateApplicationBuilder(args);
builder.Services.AddSingleton<IEmailService, EmailService>();
using var host = builder.Build();

var rootCommand = EmailCommand.Create(host.Services);
return await rootCommand.InvokeAsync(args);

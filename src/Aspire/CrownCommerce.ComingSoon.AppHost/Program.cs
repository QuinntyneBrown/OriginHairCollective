var builder = DistributedApplication.CreateBuilder(args);

var messaging = builder.AddRabbitMQ("messaging")
    .WithManagementPlugin();

var newsletterApi = builder.AddProject<Projects.CrownCommerce_Newsletter_Api>("newsletter-api")
    .WithReference(messaging)
    .WaitFor(messaging);

var apiGateway = builder.AddProject<Projects.CrownCommerce_ApiGateway>("api-gateway")
    .WithReference(newsletterApi);

if (builder.ExecutionContext.IsPublishMode)
{
    builder.AddDockerfile("coming-soon", "../../CrownCommerce.Web", "Dockerfile.coming-soon")
        .WithReference(apiGateway)
        .WithEnvironment("API_GATEWAY_URL", apiGateway.GetEndpoint("http"))
        .WithHttpEndpoint(targetPort: 80)
        .WithExternalHttpEndpoints();
}
else
{
    builder.AddNpmApp("coming-soon", "../../CrownCommerce.Web", "start:coming-soon")
        .WithReference(apiGateway)
        .WithHttpEndpoint(env: "PORT")
        .WithExternalHttpEndpoints();
}

builder.Build().Run();

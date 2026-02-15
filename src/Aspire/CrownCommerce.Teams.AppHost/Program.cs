var builder = DistributedApplication.CreateBuilder(args);

var messaging = builder.AddRabbitMQ("messaging")
    .WithManagementPlugin();

var identityApi = builder.AddProject<Projects.CrownCommerce_Identity_Api>("identity-api");

var schedulingApi = builder.AddProject<Projects.CrownCommerce_Scheduling_Api>("scheduling-api")
    .WithReference(messaging)
    .WaitFor(messaging);

var apiGateway = builder.AddProject<Projects.CrownCommerce_ApiGateway>("api-gateway")
    .WithReference(identityApi)
    .WithReference(schedulingApi);

builder.AddNpmApp("teams", "../../CrownCommerce.Web", "start:teams")
    .WithReference(apiGateway)
    .WithHttpEndpoint(env: "PORT")
    .WithExternalHttpEndpoints();

builder.Build().Run();

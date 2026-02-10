var builder = DistributedApplication.CreateBuilder(args);

var messaging = builder.AddRabbitMQ("messaging")
    .WithManagementPlugin();

var catalogApi = builder.AddProject<Projects.OriginHairCollective_Catalog_Api>("catalog-api")
    .WithReference(messaging);

var inquiryApi = builder.AddProject<Projects.OriginHairCollective_Inquiry_Api>("inquiry-api")
    .WithReference(messaging);

var apiGateway = builder.AddProject<Projects.OriginHairCollective_ApiGateway>("api-gateway")
    .WithReference(catalogApi)
    .WithReference(inquiryApi);

builder.AddNpmApp("angular", "../../Web/origin-hair-collective-web", "start")
    .WithReference(apiGateway)
    .WithHttpEndpoint(env: "PORT")
    .WithExternalHttpEndpoints();

builder.Build().Run();

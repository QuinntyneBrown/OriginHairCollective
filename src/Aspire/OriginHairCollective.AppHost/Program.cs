var builder = DistributedApplication.CreateBuilder(args);

var messaging = builder.AddRabbitMQ("messaging")
    .WithManagementPlugin();

var catalogApi = builder.AddProject<Projects.OriginHairCollective_Catalog_Api>("catalog-api")
    .WithReference(messaging);

var inquiryApi = builder.AddProject<Projects.OriginHairCollective_Inquiry_Api>("inquiry-api")
    .WithReference(messaging);

var orderApi = builder.AddProject<Projects.OriginHairCollective_Order_Api>("order-api")
    .WithReference(messaging);

var paymentApi = builder.AddProject<Projects.OriginHairCollective_Payment_Api>("payment-api")
    .WithReference(messaging);

var contentApi = builder.AddProject<Projects.OriginHairCollective_Content_Api>("content-api");

var notificationApi = builder.AddProject<Projects.OriginHairCollective_Notification_Api>("notification-api")
    .WithReference(messaging);

var identityApi = builder.AddProject<Projects.OriginHairCollective_Identity_Api>("identity-api");

var chatApi = builder.AddProject<Projects.OriginHairCollective_Chat_Api>("chat-api")
    .WithReference(messaging);

var newsletterApi = builder.AddProject<Projects.OriginHairCollective_Newsletter_Api>("newsletter-api")
    .WithReference(messaging);

var apiGateway = builder.AddProject<Projects.OriginHairCollective_ApiGateway>("api-gateway")
    .WithReference(catalogApi)
    .WithReference(inquiryApi)
    .WithReference(orderApi)
    .WithReference(paymentApi)
    .WithReference(contentApi)
    .WithReference(notificationApi)
    .WithReference(identityApi)
    .WithReference(chatApi)
    .WithReference(newsletterApi);

builder.AddNpmApp("angular", "../../Web/origin-hair-collective-web", "start")
    .WithReference(apiGateway)
    .WithHttpEndpoint(env: "PORT")
    .WithExternalHttpEndpoints();

builder.Build().Run();

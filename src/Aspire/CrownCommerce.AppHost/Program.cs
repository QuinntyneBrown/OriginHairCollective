var builder = DistributedApplication.CreateBuilder(args);

var messaging = builder.AddRabbitMQ("messaging")
    .WithManagementPlugin();

var catalogApi = builder.AddProject<Projects.CrownCommerce_Catalog_Api>("catalog-api")
    .WithReference(messaging)
    .WaitFor(messaging);

var inquiryApi = builder.AddProject<Projects.CrownCommerce_Inquiry_Api>("inquiry-api")
    .WithReference(messaging)
    .WaitFor(messaging);

var orderApi = builder.AddProject<Projects.CrownCommerce_Order_Api>("order-api")
    .WithReference(messaging)
    .WaitFor(messaging);

var paymentApi = builder.AddProject<Projects.CrownCommerce_Payment_Api>("payment-api")
    .WithReference(messaging)
    .WaitFor(messaging);

var contentApi = builder.AddProject<Projects.CrownCommerce_Content_Api>("content-api");

var notificationApi = builder.AddProject<Projects.CrownCommerce_Notification_Api>("notification-api")
    .WithReference(messaging)
    .WaitFor(messaging);

var identityApi = builder.AddProject<Projects.CrownCommerce_Identity_Api>("identity-api");

// TODO: Chat API crashes under Aspire orchestration â€” investigate SignalR/MassTransit startup interaction
// var chatApi = builder.AddProject<Projects.CrownCommerce_Chat_Api>("chat-api")
//     .WithReference(messaging)
//     .WaitFor(messaging);

var vendorApi = builder.AddProject<Projects.CrownCommerce_Vendor_Api>("vendor-api")
    .WithReference(messaging)
    .WaitFor(messaging);

var newsletterApi = builder.AddProject<Projects.CrownCommerce_Newsletter_Api>("newsletter-api")
    .WithReference(messaging)
    .WaitFor(messaging);

var apiGateway = builder.AddProject<Projects.CrownCommerce_ApiGateway>("api-gateway")
    .WithReference(catalogApi)
    .WithReference(inquiryApi)
    .WithReference(orderApi)
    .WithReference(paymentApi)
    .WithReference(contentApi)
    .WithReference(notificationApi)
    .WithReference(identityApi)
    .WithReference(newsletterApi)
    .WithReference(vendorApi);

builder.AddNpmApp("angular", "../../CrownCommerce.Web", "start")
    .WithReference(apiGateway)
    .WithHttpEndpoint(env: "PORT")
    .WithExternalHttpEndpoints();

builder.Build().Run();

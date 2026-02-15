namespace CrownCommerce.Notification.Application.Email;

public static class EmailTemplates
{
    private const string BrandColor = "#C8A96E";
    private const string BrandName = "Origin Hair Collective";

    private static string Wrap(string title, string body) =>
        $"""
        <!DOCTYPE html>
        <html>
        <head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
        <body style="margin:0;padding:0;font-family:'Helvetica Neue',Arial,sans-serif;background:#f8f7f4;color:#1a1a1a;">
          <div style="max-width:600px;margin:0 auto;padding:40px 24px;">
            <div style="text-align:center;margin-bottom:32px;">
              <h1 style="font-size:20px;font-weight:500;letter-spacing:2px;color:{BrandColor};margin:0;">{BrandName.ToUpperInvariant()}</h1>
            </div>
            <div style="background:#ffffff;border-radius:12px;padding:32px;border:1px solid #e8e5e0;">
              <h2 style="font-size:22px;font-weight:500;margin:0 0 16px;">{title}</h2>
              {body}
            </div>
            <div style="text-align:center;margin-top:32px;font-size:12px;color:#8c8c8c;">
              <p>&copy; 2026 {BrandName}. All rights reserved.</p>
              <p>Mississauga, Ontario, Canada</p>
            </div>
          </div>
        </body>
        </html>
        """;

    public static string OrderConfirmation(Guid orderId, string customerEmail, decimal total) =>
        Wrap("Order Confirmed", $"""
            <p style="color:#555;line-height:1.6;">Thank you for your order! We're preparing your items and will notify you when they ship.</p>
            <div style="background:#f8f7f4;border-radius:8px;padding:16px;margin:16px 0;">
              <p style="margin:4px 0;"><strong>Order:</strong> #{orderId.ToString()[..8].ToUpperInvariant()}</p>
              <p style="margin:4px 0;"><strong>Total:</strong> ${total:F2} CAD</p>
            </div>
            <p style="color:#555;line-height:1.6;">If you have questions, reply to this email or visit our contact page.</p>
        """);

    public static string PaymentReceipt(Guid paymentId, decimal amount, string customerEmail) =>
        Wrap("Payment Received", $"""
            <p style="color:#555;line-height:1.6;">Your payment has been successfully processed.</p>
            <div style="background:#f8f7f4;border-radius:8px;padding:16px;margin:16px 0;">
              <p style="margin:4px 0;"><strong>Payment ID:</strong> #{paymentId.ToString()[..8].ToUpperInvariant()}</p>
              <p style="margin:4px 0;"><strong>Amount:</strong> ${amount:F2} CAD</p>
            </div>
        """);

    public static string OrderStatusUpdate(Guid orderId, string status) =>
        Wrap("Order Update", $"""
            <p style="color:#555;line-height:1.6;">Your order status has been updated.</p>
            <div style="background:#f8f7f4;border-radius:8px;padding:16px;margin:16px 0;">
              <p style="margin:4px 0;"><strong>Order:</strong> #{orderId.ToString()[..8].ToUpperInvariant()}</p>
              <p style="margin:4px 0;"><strong>Status:</strong> {status}</p>
            </div>
        """);

    public static string RefundNotification(Guid orderId, decimal amount) =>
        Wrap("Refund Processed", $"""
            <p style="color:#555;line-height:1.6;">A refund has been issued for your order.</p>
            <div style="background:#f8f7f4;border-radius:8px;padding:16px;margin:16px 0;">
              <p style="margin:4px 0;"><strong>Order:</strong> #{orderId.ToString()[..8].ToUpperInvariant()}</p>
              <p style="margin:4px 0;"><strong>Refund Amount:</strong> ${amount:F2} CAD</p>
            </div>
            <p style="color:#555;line-height:1.6;">The refund will appear on your statement within 5-10 business days.</p>
        """);

    public static string InquiryConfirmation(string name) =>
        Wrap("We Received Your Message", $"""
            <p style="color:#555;line-height:1.6;">Hi {name},</p>
            <p style="color:#555;line-height:1.6;">Thank you for reaching out to {BrandName}. We've received your inquiry and will get back to you within 24-48 hours.</p>
        """);

    public static string ChatStartedAdmin(Guid conversationId, string visitorName) =>
        Wrap("New Chat Conversation", $"""
            <p style="color:#555;line-height:1.6;">A new chat conversation has been started.</p>
            <div style="background:#f8f7f4;border-radius:8px;padding:16px;margin:16px 0;">
              <p style="margin:4px 0;"><strong>Conversation:</strong> #{conversationId.ToString()[..8].ToUpperInvariant()}</p>
              <p style="margin:4px 0;"><strong>Visitor:</strong> {visitorName}</p>
            </div>
        """);

    public static string NewsletterWelcome(string email) =>
        Wrap("Welcome to the Collective", $"""
            <p style="color:#555;line-height:1.6;">You're officially part of the Origin Hair Collective community!</p>
            <p style="color:#555;line-height:1.6;">Expect early access to new collections, exclusive deals, and hair care tips delivered straight to your inbox.</p>
            <div style="text-align:center;margin:24px 0;">
              <a href="https://originhairco.ca/shop" style="display:inline-block;background:{BrandColor};color:#fff;padding:12px 32px;border-radius:8px;text-decoration:none;font-weight:500;">SHOP NOW</a>
            </div>
        """);

    public static string CampaignCompleted(Guid campaignId, string name, int recipientCount) =>
        Wrap("Campaign Sent", $"""
            <p style="color:#555;line-height:1.6;">Your campaign has been successfully sent.</p>
            <div style="background:#f8f7f4;border-radius:8px;padding:16px;margin:16px 0;">
              <p style="margin:4px 0;"><strong>Campaign:</strong> {name}</p>
              <p style="margin:4px 0;"><strong>Recipients:</strong> {recipientCount}</p>
            </div>
        """);

    // Plain text fallbacks
    public static string OrderConfirmationPlain(Guid orderId, decimal total) =>
        $"""
        {BrandName}

        Order Confirmed

        Thank you for your order! We're preparing your items and will notify you when they ship.

        Order: #{orderId.ToString()[..8].ToUpperInvariant()}
        Total: ${total:F2} CAD

        If you have questions, reply to this email or visit our contact page.
        """;

    public static string PaymentReceiptPlain(Guid paymentId, decimal amount) =>
        $"""
        {BrandName}

        Payment Received

        Your payment has been successfully processed.

        Payment ID: #{paymentId.ToString()[..8].ToUpperInvariant()}
        Amount: ${amount:F2} CAD
        """;

    public static string InquiryConfirmationPlain(string name) =>
        $"""
        {BrandName}

        Hi {name},

        Thank you for reaching out. We've received your inquiry and will get back to you within 24-48 hours.
        """;

    public static string NewsletterWelcomePlain() =>
        $"""
        {BrandName}

        Welcome to the Collective!

        You're officially part of the Origin Hair Collective community. Expect early access to new collections, exclusive deals, and hair care tips.

        Shop now: https://originhairco.ca/shop
        """;
}

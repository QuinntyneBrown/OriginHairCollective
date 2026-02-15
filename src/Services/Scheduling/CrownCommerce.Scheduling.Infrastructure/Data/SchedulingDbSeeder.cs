using CrownCommerce.Scheduling.Core.Entities;
using CrownCommerce.Scheduling.Core.Enums;
using Microsoft.EntityFrameworkCore;

namespace CrownCommerce.Scheduling.Infrastructure.Data;

public static class SchedulingDbSeeder
{
    public static async Task SeedAsync(SchedulingDbContext context)
    {
        await context.Database.EnsureCreatedAsync();

        if (await context.Employees.AnyAsync())
            return;

        var employees = new[]
        {
            new Employee
            {
                Id = Guid.NewGuid(),
                UserId = Guid.NewGuid(),
                Email = "quinn@crowncommerce.com",
                FirstName = "Quinn",
                LastName = "Morgan",
                Phone = "+1-555-0101",
                JobTitle = "Operations Manager",
                Department = "Operations",
                TimeZone = "America/New_York",
                Status = EmployeeStatus.Active,
                Presence = PresenceStatus.Online,
                LastSeenAt = DateTime.UtcNow,
                CreatedAt = DateTime.UtcNow,
            },
            new Employee
            {
                Id = Guid.NewGuid(),
                UserId = Guid.NewGuid(),
                Email = "amara@crowncommerce.com",
                FirstName = "Amara",
                LastName = "Okafor",
                Phone = "+254-700-123456",
                JobTitle = "Supply Chain Lead",
                Department = "Supply Chain",
                TimeZone = "Africa/Nairobi",
                Status = EmployeeStatus.Active,
                Presence = PresenceStatus.Online,
                LastSeenAt = DateTime.UtcNow,
                CreatedAt = DateTime.UtcNow,
            },
            new Employee
            {
                Id = Guid.NewGuid(),
                UserId = Guid.NewGuid(),
                Email = "wanjiku@crowncommerce.com",
                FirstName = "Wanjiku",
                LastName = "Kamau",
                Phone = "+254-700-654321",
                JobTitle = "Quality Assurance Specialist",
                Department = "Quality",
                TimeZone = "Africa/Nairobi",
                Status = EmployeeStatus.Active,
                Presence = PresenceStatus.Away,
                LastSeenAt = DateTime.UtcNow.AddMinutes(-30),
                CreatedAt = DateTime.UtcNow,
            },
            new Employee
            {
                Id = Guid.NewGuid(),
                UserId = Guid.NewGuid(),
                Email = "sophia@crowncommerce.com",
                FirstName = "Sophia",
                LastName = "Chen",
                Phone = "+1-555-0104",
                JobTitle = "Marketing Director",
                Department = "Marketing",
                TimeZone = "America/Los_Angeles",
                Status = EmployeeStatus.Active,
                Presence = PresenceStatus.Online,
                LastSeenAt = DateTime.UtcNow,
                CreatedAt = DateTime.UtcNow,
            },
            new Employee
            {
                Id = Guid.NewGuid(),
                UserId = Guid.NewGuid(),
                Email = "james@crowncommerce.com",
                FirstName = "James",
                LastName = "Mwangi",
                Phone = "+254-700-789012",
                JobTitle = "Warehouse Manager",
                Department = "Logistics",
                TimeZone = "Africa/Nairobi",
                Status = EmployeeStatus.Active,
                Presence = PresenceStatus.Offline,
                LastSeenAt = DateTime.UtcNow.AddHours(-2),
                CreatedAt = DateTime.UtcNow,
            },
        };

        context.Employees.AddRange(employees);
        await context.SaveChangesAsync();

        // Seed meetings
        var today = DateTime.UtcNow.Date;
        var meetings = new[]
        {
            new Meeting
            {
                Id = Guid.NewGuid(),
                Title = "Daily Standup",
                Description = "Daily team sync",
                StartTimeUtc = today.AddHours(14).AddMinutes(30),
                EndTimeUtc = today.AddHours(14).AddMinutes(45),
                Status = MeetingStatus.Scheduled,
                OrganizerId = employees[0].Id,
                CreatedAt = DateTime.UtcNow,
            },
            new Meeting
            {
                Id = Guid.NewGuid(),
                Title = "Design Review",
                Description = "Review new mockups for product catalog",
                StartTimeUtc = today.AddHours(16),
                EndTimeUtc = today.AddHours(17),
                Location = "Room 3B",
                Status = MeetingStatus.Scheduled,
                OrganizerId = employees[3].Id,
                CreatedAt = DateTime.UtcNow,
            },
            new Meeting
            {
                Id = Guid.NewGuid(),
                Title = "Sprint Planning",
                Description = "Q1 Sprint Planning session",
                StartTimeUtc = today.AddDays(1).AddHours(19),
                EndTimeUtc = today.AddDays(1).AddHours(20).AddMinutes(30),
                Status = MeetingStatus.Scheduled,
                OrganizerId = employees[0].Id,
                CreatedAt = DateTime.UtcNow,
            },
            new Meeting
            {
                Id = Guid.NewGuid(),
                Title = "1:1 with Amara",
                Description = "Weekly sync",
                StartTimeUtc = today.AddHours(21),
                EndTimeUtc = today.AddHours(21).AddMinutes(30),
                Status = MeetingStatus.Scheduled,
                OrganizerId = employees[0].Id,
                CreatedAt = DateTime.UtcNow,
            },
        };

        context.Meetings.AddRange(meetings);
        await context.SaveChangesAsync();

        // Seed meeting attendees
        var attendees = new[]
        {
            new MeetingAttendee { Id = Guid.NewGuid(), MeetingId = meetings[0].Id, EmployeeId = employees[1].Id, Response = AttendeeResponse.Accepted },
            new MeetingAttendee { Id = Guid.NewGuid(), MeetingId = meetings[0].Id, EmployeeId = employees[3].Id, Response = AttendeeResponse.Accepted },
            new MeetingAttendee { Id = Guid.NewGuid(), MeetingId = meetings[0].Id, EmployeeId = employees[2].Id, Response = AttendeeResponse.Pending },
            new MeetingAttendee { Id = Guid.NewGuid(), MeetingId = meetings[1].Id, EmployeeId = employees[0].Id, Response = AttendeeResponse.Accepted },
            new MeetingAttendee { Id = Guid.NewGuid(), MeetingId = meetings[1].Id, EmployeeId = employees[2].Id, Response = AttendeeResponse.Pending },
            new MeetingAttendee { Id = Guid.NewGuid(), MeetingId = meetings[2].Id, EmployeeId = employees[1].Id, Response = AttendeeResponse.Accepted },
            new MeetingAttendee { Id = Guid.NewGuid(), MeetingId = meetings[2].Id, EmployeeId = employees[3].Id, Response = AttendeeResponse.Accepted },
            new MeetingAttendee { Id = Guid.NewGuid(), MeetingId = meetings[2].Id, EmployeeId = employees[4].Id, Response = AttendeeResponse.Pending },
            new MeetingAttendee { Id = Guid.NewGuid(), MeetingId = meetings[3].Id, EmployeeId = employees[1].Id, Response = AttendeeResponse.Accepted },
        };

        context.MeetingAttendees.AddRange(attendees);
        await context.SaveChangesAsync();

        // Seed team channels
        var channels = new[]
        {
            new ScheduleConversation
            {
                Id = Guid.NewGuid(),
                Subject = "general",
                Icon = "tag",
                ChannelType = ChannelType.Public,
                Status = ConversationStatus.Active,
                CreatedByEmployeeId = employees[0].Id,
                CreatedAt = DateTime.UtcNow.AddDays(-30),
            },
            new ScheduleConversation
            {
                Id = Guid.NewGuid(),
                Subject = "design",
                Icon = "palette",
                ChannelType = ChannelType.Public,
                Status = ConversationStatus.Active,
                CreatedByEmployeeId = employees[3].Id,
                CreatedAt = DateTime.UtcNow.AddDays(-28),
            },
            new ScheduleConversation
            {
                Id = Guid.NewGuid(),
                Subject = "engineering",
                Icon = "code",
                ChannelType = ChannelType.Public,
                Status = ConversationStatus.Active,
                CreatedByEmployeeId = employees[0].Id,
                CreatedAt = DateTime.UtcNow.AddDays(-28),
            },
            new ScheduleConversation
            {
                Id = Guid.NewGuid(),
                Subject = "product",
                Icon = "inventory_2",
                ChannelType = ChannelType.Public,
                Status = ConversationStatus.Active,
                CreatedByEmployeeId = employees[0].Id,
                CreatedAt = DateTime.UtcNow.AddDays(-25),
            },
            new ScheduleConversation
            {
                Id = Guid.NewGuid(),
                Subject = "random",
                Icon = "casino",
                ChannelType = ChannelType.Public,
                Status = ConversationStatus.Active,
                CreatedByEmployeeId = employees[1].Id,
                CreatedAt = DateTime.UtcNow.AddDays(-20),
            },
            new ScheduleConversation
            {
                Id = Guid.NewGuid(),
                Subject = "Sophia Chen",
                Icon = "person",
                ChannelType = ChannelType.DirectMessage,
                Status = ConversationStatus.Active,
                CreatedByEmployeeId = employees[0].Id,
                CreatedAt = DateTime.UtcNow.AddDays(-10),
            },
            new ScheduleConversation
            {
                Id = Guid.NewGuid(),
                Subject = "Amara Okafor",
                Icon = "person",
                ChannelType = ChannelType.DirectMessage,
                Status = ConversationStatus.Active,
                CreatedByEmployeeId = employees[0].Id,
                CreatedAt = DateTime.UtcNow.AddDays(-5),
            },
        };

        context.Conversations.AddRange(channels);
        await context.SaveChangesAsync();

        // Add all employees as participants in public channels
        foreach (var channel in channels.Where(c => c.ChannelType == ChannelType.Public))
        {
            foreach (var emp in employees)
            {
                context.ConversationParticipants.Add(new ConversationParticipant
                {
                    Id = Guid.NewGuid(),
                    ConversationId = channel.Id,
                    EmployeeId = emp.Id,
                    JoinedAt = channel.CreatedAt,
                });
            }
        }

        // DM participants
        // Sophia Chen DM: Quinn + Sophia
        context.ConversationParticipants.Add(new ConversationParticipant
        {
            Id = Guid.NewGuid(), ConversationId = channels[5].Id, EmployeeId = employees[0].Id, JoinedAt = channels[5].CreatedAt,
        });
        context.ConversationParticipants.Add(new ConversationParticipant
        {
            Id = Guid.NewGuid(), ConversationId = channels[5].Id, EmployeeId = employees[3].Id, JoinedAt = channels[5].CreatedAt,
        });

        // Amara Okafor DM: Quinn + Amara
        context.ConversationParticipants.Add(new ConversationParticipant
        {
            Id = Guid.NewGuid(), ConversationId = channels[6].Id, EmployeeId = employees[0].Id, JoinedAt = channels[6].CreatedAt,
        });
        context.ConversationParticipants.Add(new ConversationParticipant
        {
            Id = Guid.NewGuid(), ConversationId = channels[6].Id, EmployeeId = employees[1].Id, JoinedAt = channels[6].CreatedAt,
        });

        await context.SaveChangesAsync();

        // Seed sample messages in channels
        var messages = new[]
        {
            // #general
            new ConversationMessage { Id = Guid.NewGuid(), ConversationId = channels[0].Id, SenderEmployeeId = employees[0].Id, Content = "Good morning everyone! Quick reminder about our standup in 5 minutes.", SentAt = DateTime.UtcNow.AddHours(-2) },
            new ConversationMessage { Id = Guid.NewGuid(), ConversationId = channels[0].Id, SenderEmployeeId = employees[3].Id, Content = "Thanks Quinn! I'll be there. Just finishing up the new dashboard mockups.", SentAt = DateTime.UtcNow.AddHours(-2).AddMinutes(1) },
            new ConversationMessage { Id = Guid.NewGuid(), ConversationId = channels[0].Id, SenderEmployeeId = employees[1].Id, Content = "On my way! Also, I pushed the supply chain updates to staging.", SentAt = DateTime.UtcNow.AddHours(-2).AddMinutes(2) },
            new ConversationMessage { Id = Guid.NewGuid(), ConversationId = channels[0].Id, SenderEmployeeId = employees[4].Id, Content = "Hey team, standup in 5!", SentAt = DateTime.UtcNow.AddMinutes(-5) },
            // #design
            new ConversationMessage { Id = Guid.NewGuid(), ConversationId = channels[1].Id, SenderEmployeeId = employees[3].Id, Content = "New mockups uploaded for the product catalog redesign.", SentAt = DateTime.UtcNow.AddMinutes(-15) },
            // #engineering
            new ConversationMessage { Id = Guid.NewGuid(), ConversationId = channels[2].Id, SenderEmployeeId = employees[2].Id, Content = "PR #142 is ready for review - quality metrics dashboard.", SentAt = DateTime.UtcNow.AddHours(-1) },
            new ConversationMessage { Id = Guid.NewGuid(), ConversationId = channels[2].Id, SenderEmployeeId = employees[0].Id, Content = "I'll take a look at the PR after lunch.", SentAt = DateTime.UtcNow.AddMinutes(-45) },
            // #product
            new ConversationMessage { Id = Guid.NewGuid(), ConversationId = channels[3].Id, SenderEmployeeId = employees[0].Id, Content = "Sprint planning tomorrow at 2 PM. Please update your tasks.", SentAt = DateTime.UtcNow.AddHours(-2) },
            // #random
            new ConversationMessage { Id = Guid.NewGuid(), ConversationId = channels[4].Id, SenderEmployeeId = employees[4].Id, Content = "Anyone for lunch?", SentAt = DateTime.UtcNow.AddHours(-3) },
            // DM with Sophia
            new ConversationMessage { Id = Guid.NewGuid(), ConversationId = channels[5].Id, SenderEmployeeId = employees[3].Id, Content = "Can you review my designs for the new landing page?", SentAt = DateTime.UtcNow.AddMinutes(-30) },
            new ConversationMessage { Id = Guid.NewGuid(), ConversationId = channels[5].Id, SenderEmployeeId = employees[0].Id, Content = "Sure, I'll take a look this afternoon!", SentAt = DateTime.UtcNow.AddMinutes(-25) },
            // DM with Amara
            new ConversationMessage { Id = Guid.NewGuid(), ConversationId = channels[6].Id, SenderEmployeeId = employees[1].Id, Content = "Meeting notes shared from the supply chain review.", SentAt = DateTime.UtcNow.AddHours(-1) },
        };

        context.ConversationMessages.AddRange(messages);

        // Update LastMessageAt on channels
        channels[0].LastMessageAt = DateTime.UtcNow.AddMinutes(-5);
        channels[1].LastMessageAt = DateTime.UtcNow.AddMinutes(-15);
        channels[2].LastMessageAt = DateTime.UtcNow.AddMinutes(-45);
        channels[3].LastMessageAt = DateTime.UtcNow.AddHours(-2);
        channels[4].LastMessageAt = DateTime.UtcNow.AddHours(-3);
        channels[5].LastMessageAt = DateTime.UtcNow.AddMinutes(-25);
        channels[6].LastMessageAt = DateTime.UtcNow.AddHours(-1);

        await context.SaveChangesAsync();
    }
}

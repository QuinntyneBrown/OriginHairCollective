import { test, expect } from '@playwright/test';
import { ChatPage } from '../page-objects/pages/chat.page';
import { setupApiMocks, injectAuth } from '../fixtures/api-mocks';
import { mockChannels, mockChannelMessages } from '../fixtures/mock-data';

test.describe('Chat Page', () => {
  let chatPage: ChatPage;

  test.beforeEach(async ({ page }) => {
    await setupApiMocks(page);
    await injectAuth(page);
    chatPage = new ChatPage(page);
    await chatPage.goto();
  });

  test.describe('Channel List', () => {
    test('should display the Messages header', async () => {
      await expect(chatPage.channelHeaderTitle).toBeVisible();
      await expect(chatPage.channelHeaderTitle).toHaveText('Messages');
    });

    test('should display the channel search input', async () => {
      await expect(chatPage.channelSearch).toBeVisible();
    });

    test('should display Channels section label', async ({ page }) => {
      const label = page.locator('.channel-section-label', { hasText: /^Channels$/ });
      await expect(label).toBeVisible();
    });

    test('should display Direct Messages section label', async ({ page }) => {
      const label = page.locator('.channel-section-label', { hasText: 'Direct Messages' });
      await expect(label).toBeVisible();
    });

    test('should display public channels', async () => {
      const publicChannelCount = mockChannels.filter((c) => c.channelType !== 'DirectMessage').length;
      await expect(chatPage.getPublicChannels()).toHaveCount(publicChannelCount);
    });

    test('should display direct message channels', async () => {
      const dmCount = mockChannels.filter((c) => c.channelType === 'DirectMessage').length;
      await expect(chatPage.getDirectMessages()).toHaveCount(dmCount);
    });

    test('should display channel name with # prefix for public channels', async () => {
      await expect(chatPage.getPublicChannels().first()).toContainText('# general');
    });

    test('should display unread badge for channels with unread messages', async () => {
      const badge = await chatPage.getUnreadBadge('general');
      expect(badge).toBe('3');
    });

    test('should display the new channel button', async () => {
      await expect(chatPage.newChannelButton).toBeVisible();
    });
  });

  test.describe('Channel Selection', () => {
    test('should auto-select the first channel', async () => {
      await expect(chatPage.threadName).toContainText('# general');
    });

    test('should switch channels when clicking a different channel', async () => {
      await chatPage.selectChannel('engineering');
      await expect(chatPage.threadName).toContainText('# engineering');
    });

    test('should display channel name in thread header for DMs', async () => {
      await chatPage.selectChannel('Sarah Lee');
      await expect(chatPage.threadName).toContainText('Sarah Lee');
    });

    test('should highlight active channel in the list', async ({ page }) => {
      await expect(page.locator('.channel-item--active')).toHaveCount(1);
    });
  });

  test.describe('Messages', () => {
    test('should display messages for the selected channel', async () => {
      await expect(chatPage.messages).toHaveCount(mockChannelMessages.length);
    });

    test('should display message content', async () => {
      const content = await chatPage.getMessageContent(0);
      expect(content).toBe(mockChannelMessages[0].content);
    });

    test('should display sender name for non-own messages', async () => {
      const sender = await chatPage.getMessageSender(0);
      expect(sender).toBe(mockChannelMessages[0].senderName);
    });

    test('should display sender initials avatar', async () => {
      const avatar = chatPage.messages.first().locator('.message-avatar');
      await expect(avatar).toBeVisible();
      await expect(avatar).toHaveText(mockChannelMessages[0].senderInitials);
    });

    test('should display message timestamp', async () => {
      const time = chatPage.messages.first().locator('.message-time');
      await expect(time).toBeVisible();
    });

    test('should display own messages with own styling', async () => {
      // msg-002 is from emp-001 (current user)
      const ownMessage = chatPage.messages.nth(1);
      await expect(ownMessage).toHaveClass(/message--own/);
    });
  });

  test.describe('Message Input', () => {
    test('should display the message input', async () => {
      await expect(chatPage.messageInput).toBeVisible();
      await expect(chatPage.messageInput).toHaveAttribute('placeholder', 'Type a message...');
    });

    test('should disable send button when input is empty', async () => {
      await expect(chatPage.sendButton).toBeDisabled();
    });

    test('should enable send button when input has text', async () => {
      await chatPage.messageInput.fill('Hello');
      await expect(chatPage.sendButton).toBeEnabled();
    });

    test('should send a message and add it to the thread', async () => {
      const initialCount = await chatPage.messages.count();
      await chatPage.sendMessage('Hello from test!');
      await expect(chatPage.messages).toHaveCount(initialCount + 1);
    });

    test('should clear input after sending a message', async () => {
      await chatPage.sendMessage('Hello from test!');
      await expect(chatPage.messageInput).toHaveValue('');
    });
  });

  test.describe('Channel Search', () => {
    test('should filter channels by search query', async () => {
      await chatPage.channelSearch.fill('general');
      // Should show only "general" in public channels
      await expect(chatPage.getPublicChannels()).toHaveCount(1);
      await expect(chatPage.getPublicChannels().first()).toContainText('general');
    });

    test('should show clear button when search has text', async ({ page }) => {
      await chatPage.channelSearch.fill('test');
      const clearBtn = page.locator('.search-clear');
      await expect(clearBtn).toBeVisible();
    });

    test('should clear search when clear button is clicked', async ({ page }) => {
      await chatPage.channelSearch.fill('test');
      await page.locator('.search-clear').click();
      // All channels should be visible again
      const totalPublic = mockChannels.filter((c) => c.channelType !== 'DirectMessage').length;
      await expect(chatPage.getPublicChannels()).toHaveCount(totalPublic);
    });
  });

  test.describe('Thread Actions', () => {
    test('should display video call button', async () => {
      await expect(chatPage.videoCallButton).toBeVisible();
    });

    test('should display audio call button', async () => {
      await expect(chatPage.audioCallButton).toBeVisible();
    });
  });

  test.describe('Reactions', () => {
    test('should display reactions on messages that have them', async () => {
      // msg-002 has a reaction
      const reactionBar = chatPage.messages.nth(1).locator('.reactions-bar');
      await expect(reactionBar).toBeVisible();
    });

    test('should display reaction emoji and count', async () => {
      const reactionChip = chatPage.messages.nth(1).locator('.reaction-chip').first();
      await expect(reactionChip).toBeVisible();
      await expect(reactionChip).toContainText('2');
    });
  });

  test.describe('Attachment Button', () => {
    test('should display the attach file button', async ({ page }) => {
      const attachBtn = page.locator('.attach-btn');
      await expect(attachBtn).toBeVisible();
    });
  });
});

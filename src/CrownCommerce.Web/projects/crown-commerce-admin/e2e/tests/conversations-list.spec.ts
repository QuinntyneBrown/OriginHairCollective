import { test, expect } from '@playwright/test';
import { ConversationsListPage } from '../page-objects/pages/conversations-list.page';
import { setupApiMocks } from '../fixtures/api-mocks';
import { mockConversations, mockConversationDetail } from '../fixtures/mock-data';

test.describe('Conversations List', () => {
  let conversationsPage: ConversationsListPage;

  test.beforeEach(async ({ page }) => {
    await setupApiMocks(page);
    conversationsPage = new ConversationsListPage(page);
    await conversationsPage.goto();
  });

  test.describe('Page Header', () => {
    test('should display page title "Team Conversations"', async () => {
      await expect(conversationsPage.pageTitle).toHaveText('Team Conversations');
    });

    test('should display page subtitle', async () => {
      await expect(conversationsPage.pageSubtitle).toHaveText('Track and manage scheduling discussions');
    });

    test('should display New Conversation button', async () => {
      await expect(conversationsPage.newConversationButton).toBeVisible();
      await expect(conversationsPage.newConversationButton).toContainText('New Conversation');
    });
  });

  test.describe('Conversation List', () => {
    test('should display conversation items', async () => {
      const count = await conversationsPage.conversationItems.count();
      expect(count).toBe(mockConversations.length);
    });

    test('should display first conversation subject', async () => {
      const subject = conversationsPage.getConversationSubject(0);
      await expect(subject).toHaveText(mockConversations[0].subject);
    });

    test('should display conversation metadata', async () => {
      const item = conversationsPage.getConversationItem(0);
      await expect(item.locator('.conv-meta')).toContainText('participants');
      await expect(item.locator('.conv-meta')).toContainText('messages');
    });
  });

  test.describe('Empty State', () => {
    test('should show empty state when no conversation is selected', async () => {
      await expect(conversationsPage.chatEmpty).toBeVisible();
      await expect(conversationsPage.chatEmpty).toContainText('Select a conversation');
    });
  });

  test.describe('Select Conversation', () => {
    test('should show chat area when conversation is selected', async () => {
      await conversationsPage.getConversationItem(0).click();
      await expect(conversationsPage.chatHeader).toBeVisible();
      await expect(conversationsPage.chatSubject).toHaveText(mockConversationDetail.subject);
    });

    test('should display messages in active conversation', async () => {
      await conversationsPage.getConversationItem(0).click();
      await conversationsPage.chatHeader.waitFor({ state: 'visible' });
      const msgCount = await conversationsPage.messages.count();
      expect(msgCount).toBe(mockConversationDetail.messages.length);
    });

    test('should display message content', async () => {
      await conversationsPage.getConversationItem(0).click();
      await conversationsPage.chatHeader.waitFor({ state: 'visible' });
      const firstMsg = conversationsPage.messages.first();
      await expect(firstMsg.locator('.message-text')).toContainText(mockConversationDetail.messages[0].content);
    });

    test('should display message input when conversation is selected', async () => {
      await conversationsPage.getConversationItem(0).click();
      await conversationsPage.chatHeader.waitFor({ state: 'visible' });
      await expect(conversationsPage.messageInput).toBeVisible();
      await expect(conversationsPage.sendButton).toBeVisible();
    });
  });

  test.describe('New Conversation', () => {
    test('should open new conversation form when clicking New Conversation', async () => {
      await conversationsPage.newConversationButton.click();
      await expect(conversationsPage.newConvForm).toBeVisible();
    });

    test('should display form fields in new conversation form', async () => {
      await conversationsPage.newConversationButton.click();
      await expect(conversationsPage.newConvSubjectField).toBeVisible();
      await expect(conversationsPage.newConvParticipantsSelect).toBeVisible();
      await expect(conversationsPage.newConvInitialMessageField).toBeVisible();
    });

    test('should display Create and Cancel buttons', async () => {
      await conversationsPage.newConversationButton.click();
      await expect(conversationsPage.newConvCreateButton).toBeVisible();
      await expect(conversationsPage.newConvCancelButton).toBeVisible();
    });

    test('should close form when clicking Cancel', async () => {
      await conversationsPage.newConversationButton.click();
      await conversationsPage.newConvCancelButton.click();
      await expect(conversationsPage.newConvForm).not.toBeVisible();
    });
  });
});

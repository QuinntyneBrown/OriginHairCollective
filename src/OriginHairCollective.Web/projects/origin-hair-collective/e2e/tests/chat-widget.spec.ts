import { test, expect } from '@playwright/test';
import { HomePage } from '../page-objects/pages/home.page';

test.describe('Chat Widget', () => {
  let homePage: HomePage;

  test.beforeEach(async ({ page }) => {
    homePage = new HomePage(page);
    await homePage.goto();
  });

  test.describe('FAB Button', () => {
    test('should display the FAB button on page load', async () => {
      await expect(homePage.chatWidget.fab).toBeVisible();
    });

    test('should have correct aria-label on FAB button', async () => {
      await expect(homePage.chatWidget.fab).toHaveAttribute('aria-label', 'Open chat');
    });

    test('should hide FAB when chat panel is opened', async () => {
      await homePage.chatWidget.open();
      await expect(homePage.chatWidget.fab).toBeHidden();
    });

    test('should show FAB again when chat panel is closed', async () => {
      await homePage.chatWidget.open();
      await expect(homePage.chatWidget.fab).toBeHidden();
      await homePage.chatWidget.close();
      await expect(homePage.chatWidget.fab).toBeVisible();
    });
  });

  test.describe('Chat Panel', () => {
    test.beforeEach(async () => {
      await homePage.chatWidget.open();
    });

    test('should open the chat panel when FAB is clicked', async () => {
      await expect(homePage.chatWidget.panel).toBeVisible();
    });

    test('should display the header avatar', async () => {
      await expect(homePage.chatWidget.headerAvatar).toBeVisible();
    });

    test('should display the assistant title', async () => {
      await expect(homePage.chatWidget.headerTitle).toHaveText('Origin Hair Assistant');
    });

    test('should display the header subtitle', async () => {
      await expect(homePage.chatWidget.headerSubtitle).toHaveText('Typically replies instantly');
    });

    test('should have a close button with correct aria-label', async () => {
      await expect(homePage.chatWidget.closeButton).toBeVisible();
      await expect(homePage.chatWidget.closeButton).toHaveAttribute('aria-label', 'Close chat');
    });

    test('should close the panel when close button is clicked', async () => {
      await homePage.chatWidget.close();
      await expect(homePage.chatWidget.panel).toBeHidden();
    });
  });

  test.describe('Welcome Message', () => {
    test.beforeEach(async () => {
      await homePage.chatWidget.open();
    });

    test('should show a welcome message from the AI on open', async () => {
      await expect(homePage.chatWidget.messages).toHaveCount(1);
    });

    test('should display the welcome message text', async () => {
      const texts = await homePage.chatWidget.getMessageTexts();
      expect(texts[0]).toContain('Welcome to Origin Hair Collective');
    });

    test('should show the welcome message as an AI bubble', async () => {
      await expect(homePage.chatWidget.aiBubbles).toHaveCount(1);
      await expect(homePage.chatWidget.visitorBubbles).toHaveCount(0);
    });

    test('should display a timestamp on the welcome message', async () => {
      const timestamps = await homePage.chatWidget.getMessageTimestamps();
      expect(timestamps).toHaveLength(1);
      expect(timestamps[0]).toBeTruthy();
    });
  });

  test.describe('Sending Messages', () => {
    test.beforeEach(async () => {
      await homePage.chatWidget.open();
    });

    test('should send a message when send button is clicked', async () => {
      await homePage.chatWidget.sendMessage('Hello there');
      await expect(homePage.chatWidget.messages).toHaveCount(2);
    });

    test('should send a message when Enter key is pressed', async () => {
      await homePage.chatWidget.sendMessageWithEnter('Hello there');
      await expect(homePage.chatWidget.messages).toHaveCount(2);
    });

    test('should display the sent message as a visitor bubble', async () => {
      await homePage.chatWidget.sendMessage('Hello there');
      await expect(homePage.chatWidget.visitorBubbles).toHaveCount(1);
    });

    test('should display the correct sent message text', async () => {
      await homePage.chatWidget.sendMessage('I want body wave bundles');
      const lastMessage = await homePage.chatWidget.getLastMessageText();
      expect(lastMessage).toBe('I want body wave bundles');
    });

    test('should clear the input field after sending', async () => {
      await homePage.chatWidget.sendMessage('Hello there');
      const value = await homePage.chatWidget.getInputValue();
      expect(value).toBe('');
    });

    test('should not send an empty message', async () => {
      await homePage.chatWidget.sendMessage('   ');
      await expect(homePage.chatWidget.messages).toHaveCount(1);
    });

    test('should not send when input is empty and Enter is pressed', async () => {
      await homePage.chatWidget.inputField.press('Enter');
      await expect(homePage.chatWidget.messages).toHaveCount(1);
    });

    test('should display multiple sent messages in order', async () => {
      await homePage.chatWidget.sendMessage('First message');
      await homePage.chatWidget.sendMessage('Second message');
      await expect(homePage.chatWidget.messages).toHaveCount(3);

      const texts = await homePage.chatWidget.getMessageTexts();
      expect(texts[1]).toBe('First message');
      expect(texts[2]).toBe('Second message');
    });

    test('should add a timestamp to each sent message', async () => {
      await homePage.chatWidget.sendMessage('Hello');
      const timestamps = await homePage.chatWidget.getMessageTimestamps();
      expect(timestamps).toHaveLength(2);
      timestamps.forEach(ts => expect(ts).toBeTruthy());
    });
  });

  test.describe('Input Field', () => {
    test.beforeEach(async () => {
      await homePage.chatWidget.open();
    });

    test('should display the input field', async () => {
      await expect(homePage.chatWidget.inputField).toBeVisible();
    });

    test('should have the correct placeholder text', async () => {
      await expect(homePage.chatWidget.inputField).toHaveAttribute(
        'placeholder',
        'Ask about our products...',
      );
    });

    test('should display the send button', async () => {
      await expect(homePage.chatWidget.sendButton).toBeVisible();
    });

    test('should have correct aria-label on send button', async () => {
      await expect(homePage.chatWidget.sendButton).toHaveAttribute('aria-label', 'Send message');
    });

    test('should accept text input', async () => {
      await homePage.chatWidget.inputField.fill('Testing input');
      const value = await homePage.chatWidget.getInputValue();
      expect(value).toBe('Testing input');
    });
  });
});

test.describe('Chat Widget - Mobile', () => {
  let homePage: HomePage;

  test.use({ viewport: { width: 375, height: 812 } });

  test.beforeEach(async ({ page }) => {
    homePage = new HomePage(page);
    await homePage.goto();
  });

  test('should display the FAB button on mobile', async () => {
    await expect(homePage.chatWidget.fab).toBeVisible();
  });

  test('should open chat panel full-screen on mobile', async () => {
    await homePage.chatWidget.open();
    await expect(homePage.chatWidget.panel).toBeVisible();
  });

  test('should show all chat elements on mobile', async () => {
    await homePage.chatWidget.open();
    await expect(homePage.chatWidget.headerTitle).toBeVisible();
    await expect(homePage.chatWidget.closeButton).toBeVisible();
    await expect(homePage.chatWidget.inputField).toBeVisible();
    await expect(homePage.chatWidget.sendButton).toBeVisible();
  });

  test('should send messages on mobile', async () => {
    await homePage.chatWidget.open();
    await homePage.chatWidget.sendMessage('Mobile message');
    await expect(homePage.chatWidget.visitorBubbles).toHaveCount(1);
    const lastMessage = await homePage.chatWidget.getLastMessageText();
    expect(lastMessage).toBe('Mobile message');
  });

  test('should close chat panel on mobile', async () => {
    await homePage.chatWidget.open();
    await expect(homePage.chatWidget.panel).toBeVisible();
    await homePage.chatWidget.close();
    await expect(homePage.chatWidget.panel).toBeHidden();
    await expect(homePage.chatWidget.fab).toBeVisible();
  });
});

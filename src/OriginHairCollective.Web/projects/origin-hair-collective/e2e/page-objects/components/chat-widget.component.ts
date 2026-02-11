import { type Locator, type Page } from '@playwright/test';

export class ChatWidgetComponent {
  readonly fab: Locator;
  readonly panel: Locator;
  readonly headerAvatar: Locator;
  readonly headerTitle: Locator;
  readonly headerSubtitle: Locator;
  readonly closeButton: Locator;
  readonly messageThread: Locator;
  readonly messages: Locator;
  readonly aiBubbles: Locator;
  readonly visitorBubbles: Locator;
  readonly typingIndicator: Locator;
  readonly inputField: Locator;
  readonly sendButton: Locator;

  constructor(private page: Page) {
    this.fab = page.locator('button.chat-fab');
    this.panel = page.locator('div.chat-panel');
    this.headerAvatar = this.panel.locator('.chat-header__avatar');
    this.headerTitle = this.panel.locator('.chat-header__title');
    this.headerSubtitle = this.panel.locator('.chat-header__subtitle');
    this.closeButton = this.panel.locator('button.chat-header__close');
    this.messageThread = this.panel.locator('.chat-messages');
    this.messages = this.messageThread.locator('lib-chat-message');
    this.aiBubbles = this.messageThread.locator('lib-chat-message .message__bubble--ai');
    this.visitorBubbles = this.messageThread.locator('lib-chat-message .message__bubble--visitor');
    this.typingIndicator = this.messageThread.locator('lib-chat-typing-indicator');
    this.inputField = this.panel.locator('input.chat-input__field');
    this.sendButton = this.panel.locator('button.chat-input__send');
  }

  async open(): Promise<void> {
    await this.fab.click();
  }

  async close(): Promise<void> {
    await this.closeButton.click();
  }

  async sendMessage(text: string): Promise<void> {
    await this.inputField.fill(text);
    await this.sendButton.click();
  }

  async sendMessageWithEnter(text: string): Promise<void> {
    await this.inputField.fill(text);
    await this.inputField.press('Enter');
  }

  async getMessageTexts(): Promise<string[]> {
    return this.messageThread
      .locator('lib-chat-message .message__text')
      .allTextContents();
  }

  async getLastMessageText(): Promise<string> {
    const texts = await this.getMessageTexts();
    return texts[texts.length - 1];
  }

  async getMessageTimestamps(): Promise<string[]> {
    return this.messageThread
      .locator('lib-chat-message .message__time')
      .allTextContents();
  }

  async getInputValue(): Promise<string> {
    return this.inputField.inputValue();
  }
}

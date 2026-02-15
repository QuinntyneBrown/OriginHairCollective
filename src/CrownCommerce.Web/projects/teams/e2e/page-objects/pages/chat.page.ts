import { type Locator, type Page } from '@playwright/test';

export class ChatPage {
  readonly channelList: Locator;
  readonly channelHeaderTitle: Locator;
  readonly channelSearch: Locator;
  readonly channelItems: Locator;
  readonly messageThread: Locator;
  readonly threadName: Locator;
  readonly messages: Locator;
  readonly messageInput: Locator;
  readonly sendButton: Locator;
  readonly typingIndicator: Locator;
  readonly newChannelButton: Locator;
  readonly videoCallButton: Locator;
  readonly audioCallButton: Locator;
  readonly searchResultsHeader: Locator;
  readonly loadMoreButton: Locator;

  constructor(private page: Page) {
    this.channelList = page.locator('.channel-list');
    this.channelHeaderTitle = page.locator('.channel-header-title');
    this.channelSearch = page.locator('.channel-search .search-input');
    this.channelItems = page.locator('.channel-item');
    this.messageThread = page.locator('.message-thread');
    this.threadName = page.locator('.thread-name');
    this.messages = page.locator('.messages-area .message');
    this.messageInput = page.locator('.message-input');
    this.sendButton = page.locator('.send-btn');
    this.typingIndicator = page.locator('.typing-indicator');
    this.newChannelButton = page.locator('.channel-header button');
    this.videoCallButton = page.locator('.thread-actions button', { hasText: 'videocam' });
    this.audioCallButton = page.locator('.thread-actions button', { hasText: 'call' });
    this.searchResultsHeader = page.locator('.search-results-header');
    this.loadMoreButton = page.locator('.load-more-btn');
  }

  /** Navigate and wait for channels to be loaded */
  async goto(): Promise<void> {
    await this.page.goto('/chat');
    await this.page.waitForLoadState('domcontentloaded');
    await this.channelList.waitFor({ state: 'visible' });
    // Wait for at least one channel item to appear (async data load)
    await this.channelItems.first().waitFor({ state: 'visible', timeout: 10000 });
  }

  /** Public channels are in the section with the "Channels" label */
  getPublicChannels(): Locator {
    return this.page.locator('.channel-section').filter({ has: this.page.locator('.channel-section-label', { hasText: /^Channels$/ }) }).locator('.channel-item');
  }

  /** Direct messages are in the section with the "Direct Messages" label */
  getDirectMessages(): Locator {
    return this.page.locator('.channel-section').filter({ has: this.page.locator('.channel-section-label', { hasText: 'Direct Messages' }) }).locator('.channel-item');
  }

  async selectChannel(name: string): Promise<void> {
    await this.channelItems.filter({ hasText: name }).click();
  }

  async getMessageContent(index: number): Promise<string> {
    return (await this.messages.nth(index).locator('.message-text').textContent()) ?? '';
  }

  async getMessageSender(index: number): Promise<string> {
    return (await this.messages.nth(index).locator('.message-sender').textContent()) ?? '';
  }

  async getUnreadBadge(channelName: string): Promise<string> {
    const channel = this.channelItems.filter({ hasText: channelName });
    const badge = channel.locator('.unread-badge');
    if (await badge.isVisible()) {
      return (await badge.textContent()) ?? '0';
    }
    return '0';
  }

  async sendMessage(text: string): Promise<void> {
    await this.messageInput.fill(text);
    await this.sendButton.click();
  }

  async openMessageMenu(index: number): Promise<void> {
    await this.messages.nth(index).hover();
    await this.messages.nth(index).locator('.msg-menu-btn').last().click();
  }
}

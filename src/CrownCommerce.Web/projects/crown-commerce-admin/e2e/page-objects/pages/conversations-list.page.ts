import { Locator, Page } from '@playwright/test';
import { SidebarComponent } from '../components/sidebar.component';
import { ToolbarComponent } from '../components/toolbar.component';

export class ConversationsListPage {
  readonly sidebar: SidebarComponent;
  readonly toolbar: ToolbarComponent;

  readonly pageTitle: Locator;
  readonly pageSubtitle: Locator;
  readonly newConversationButton: Locator;

  readonly conversationList: Locator;
  readonly conversationItems: Locator;
  readonly listEmpty: Locator;

  readonly chatArea: Locator;
  readonly chatEmpty: Locator;
  readonly chatHeader: Locator;
  readonly chatSubject: Locator;
  readonly messagesArea: Locator;
  readonly messages: Locator;
  readonly messagesEmpty: Locator;
  readonly messageInput: Locator;
  readonly sendButton: Locator;

  readonly newConvForm: Locator;
  readonly newConvSubjectField: Locator;
  readonly newConvParticipantsSelect: Locator;
  readonly newConvInitialMessageField: Locator;
  readonly newConvCreateButton: Locator;
  readonly newConvCancelButton: Locator;

  constructor(private page: Page) {
    this.sidebar = new SidebarComponent(page);
    this.toolbar = new ToolbarComponent(page);

    this.pageTitle = page.locator('.page-header .page-title');
    this.pageSubtitle = page.locator('.page-header .page-subtitle');
    this.newConversationButton = page.locator('.page-header .primary-btn');

    this.conversationList = page.locator('.conv-list');
    this.conversationItems = page.locator('.conv-item');
    this.listEmpty = page.locator('.list-empty');

    this.chatArea = page.locator('.chat-area');
    this.chatEmpty = page.locator('.chat-empty');
    this.chatHeader = page.locator('.chat-header');
    this.chatSubject = page.locator('.chat-subject');
    this.messagesArea = page.locator('.messages-area');
    this.messages = page.locator('.message');
    this.messagesEmpty = page.locator('.messages-empty');
    this.messageInput = page.locator('.message-field input');
    this.sendButton = page.locator('.send-btn');

    this.newConvForm = page.locator('.new-conv-form');
    this.newConvSubjectField = this.newConvForm.locator('mat-form-field').filter({ hasText: 'Subject' }).locator('input');
    this.newConvParticipantsSelect = this.newConvForm.locator('mat-form-field').filter({ hasText: 'Participants' }).locator('mat-select');
    this.newConvInitialMessageField = this.newConvForm.locator('mat-form-field').filter({ hasText: 'Initial Message' }).locator('textarea');
    this.newConvCreateButton = this.newConvForm.locator('.form-actions .primary-btn');
    this.newConvCancelButton = this.newConvForm.locator('.form-actions button[mat-stroked-button]');
  }

  async goto(): Promise<void> {
    await this.page.goto('/conversations');
    await this.page.waitForLoadState('domcontentloaded');
    await this.pageTitle.waitFor({ state: 'visible' });
  }

  getConversationItem(index: number): Locator {
    return this.conversationItems.nth(index);
  }

  getConversationSubject(index: number): Locator {
    return this.conversationItems.nth(index).locator('.conv-subject');
  }
}

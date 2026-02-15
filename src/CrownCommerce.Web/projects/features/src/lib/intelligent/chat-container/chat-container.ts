import { Component, inject, input, ViewChild } from '@angular/core';
import { ChatWidgetComponent } from 'components';
import { ChatService } from 'api';

@Component({
  selector: 'feat-chat-container',
  standalone: true,
  imports: [ChatWidgetComponent],
  template: `
    <lib-chat-widget
      [brandName]="brandName()"
      (messageSent)="onMessageSent($event)"
      #chatWidget
    />
  `,
})
export class ChatContainerComponent {
  private readonly chat = inject(ChatService);

  readonly brandName = input('');

  @ViewChild('chatWidget') chatWidget!: ChatWidgetComponent;

  private conversationId: string | null = null;
  private sessionId = crypto.randomUUID();

  onMessageSent(text: string): void {
    this.chatWidget.isTyping.set(true);

    if (!this.conversationId) {
      this.chat.createConversation({
        visitorName: 'Guest',
        initialMessage: text,
        sessionId: this.sessionId,
      }).subscribe({
        next: (conv) => {
          this.conversationId = conv.conversationId;
          this.handleAiReply(conv.messages);
        },
        error: () => this.handleError(),
      });
    } else {
      this.chat.sendMessage(this.conversationId, this.sessionId, {
        content: text,
        senderType: 'visitor',
      }).subscribe({
        next: (msg) => {
          this.chatWidget.isTyping.set(false);
          this.chatWidget.addAiMessage(msg.content);
        },
        error: () => this.handleError(),
      });
    }
  }

  private handleAiReply(messages: { content: string; senderType: string }[]): void {
    this.chatWidget.isTyping.set(false);
    const aiMsg = messages.find(m => m.senderType === 'ai' || m.senderType === 'assistant');
    if (aiMsg) {
      this.chatWidget.addAiMessage(aiMsg.content);
    }
  }

  private handleError(): void {
    this.chatWidget.isTyping.set(false);
    this.chatWidget.addAiMessage('Sorry, something went wrong. Please try again.');
  }
}

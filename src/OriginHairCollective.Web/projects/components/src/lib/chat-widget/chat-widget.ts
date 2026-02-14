import { Component, effect, ElementRef, input, output, signal, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ChatMessageComponent, type ChatMessageData } from '../chat-message/chat-message';
import { ChatTypingIndicatorComponent } from '../chat-typing-indicator/chat-typing-indicator';

@Component({
  selector: 'lib-chat-widget',
  imports: [FormsModule, ChatMessageComponent, ChatTypingIndicatorComponent],
  templateUrl: './chat-widget.html',
  styleUrl: './chat-widget.scss',
})
export class ChatWidgetComponent {
  brandName = input('Origin Hair Collective');

  isOpen = signal(false);
  isTyping = signal(false);
  inputValue = '';

  messages = signal<ChatMessageData[]>([]);

  messageSent = output<string>();

  @ViewChild('messageThread') messageThread?: ElementRef<HTMLDivElement>;

  constructor() {
    effect(() => {
      const name = this.brandName();
      if (this.messages().length === 0) {
        this.messages.set([
          {
            sender: 'ai',
            content: `Welcome to ${name}! How can I help you today?`,
            timestamp: new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }),
          },
        ]);
      }
    });
  }

  open(): void {
    this.isOpen.set(true);
    this.scrollToBottom();
  }

  close(): void {
    this.isOpen.set(false);
  }

  send(): void {
    const text = this.inputValue.trim();
    if (!text) return;

    const now = new Date();
    const timestamp = now.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
    });

    this.messages.update(msgs => [
      ...msgs,
      { sender: 'visitor', content: text, timestamp },
    ]);
    this.inputValue = '';
    this.messageSent.emit(text);
    this.scrollToBottom();
  }

  addAiMessage(content: string): void {
    const now = new Date();
    const timestamp = now.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
    });

    this.messages.update(msgs => [
      ...msgs,
      { sender: 'ai', content, timestamp },
    ]);
    this.scrollToBottom();
  }

  private scrollToBottom(): void {
    setTimeout(() => {
      const el = this.messageThread?.nativeElement;
      if (el) {
        el.scrollTop = el.scrollHeight;
      }
    });
  }
}

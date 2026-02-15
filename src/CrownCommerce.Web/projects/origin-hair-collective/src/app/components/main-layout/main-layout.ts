import { Component, inject, signal, ViewChild } from '@angular/core';
import { Router, RouterLink, RouterOutlet } from '@angular/router';
import {
  ButtonComponent,
  ChatWidgetComponent,
  CloseButtonComponent,
  FooterLinkColumnComponent,
  SocialIconsComponent,
  LogoComponent,
  DividerComponent,
} from 'components';
import type { FooterLink, SocialLink } from 'components';
import { ChatService } from 'api';

@Component({
  selector: 'app-main-layout',
  imports: [
    RouterOutlet,
    RouterLink,
    ButtonComponent,
    CloseButtonComponent,
    FooterLinkColumnComponent,
    SocialIconsComponent,
    LogoComponent,
    DividerComponent,
    ChatWidgetComponent,
  ],
  templateUrl: './main-layout.html',
  styleUrl: './main-layout.scss',
})
export class MainLayout {
  private readonly router = inject(Router);
  private readonly chatService = inject(ChatService);

  @ViewChild(ChatWidgetComponent) chatWidget?: ChatWidgetComponent;

  mobileMenuOpen = false;
  private conversationId: string | null = null;
  private chatSessionId: string;

  readonly navLinks = [
    { label: 'Collection', href: '/shop' },
    { label: 'Our Story', href: '/about' },
    { label: 'Hair Care', href: '/hair-care-guide' },
    { label: 'Wholesale', href: '/wholesale' },
  ];

  readonly socialLinks: SocialLink[] = [
    { platform: 'instagram', href: 'https://instagram.com/originhairco' },
    { platform: 'tiktok', href: 'https://tiktok.com/@originhairco' },
    { platform: 'email', href: 'mailto:hello@originhairco.ca' },
  ];

  readonly shopLinks: FooterLink[] = [
    { label: 'Bundles', href: '/shop?category=bundles' },
    { label: 'Closures', href: '/shop?category=closures' },
    { label: 'Frontals', href: '/shop?category=frontals' },
    { label: 'Bundle Deals', href: '/shop?category=deals' },
  ];

  readonly companyLinks: FooterLink[] = [
    { label: 'Our Story', href: '/about' },
    { label: 'Contact', href: '/contact' },
    { label: 'Wholesale', href: '/wholesale' },
    { label: 'Ambassador Program', href: '/ambassador' },
  ];

  readonly supportLinks: FooterLink[] = [
    { label: 'Hair Care Guide', href: '/hair-care-guide' },
    { label: 'Shipping Info', href: '/shipping-info' },
    { label: 'Returns & Exchanges', href: '/returns' },
    { label: 'FAQ', href: '/faq' },
  ];

  constructor() {
    this.chatSessionId = sessionStorage.getItem('chatSessionId') ?? this.generateSessionId();
    sessionStorage.setItem('chatSessionId', this.chatSessionId);
    this.conversationId = sessionStorage.getItem('chatConversationId');
  }

  toggleMobileMenu(): void {
    this.mobileMenuOpen = !this.mobileMenuOpen;
  }

  navigateToShop(): void {
    this.router.navigate(['/shop']);
    if (this.mobileMenuOpen) {
      this.mobileMenuOpen = false;
    }
  }

  onChatMessage(text: string): void {
    if (!this.conversationId) {
      this.chatWidget?.isTyping.set(true);
      this.chatService.createConversation({ sessionId: this.chatSessionId, initialMessage: text, visitorName: 'Visitor' }).subscribe({
        next: (conversation) => {
          this.conversationId = conversation.id;
          sessionStorage.setItem('chatConversationId', conversation.id);
          this.chatWidget?.isTyping.set(false);
          const aiMessages = conversation.messages?.filter(m => m.senderType === 'ai' || m.senderType === 'assistant');
          if (aiMessages?.length) {
            this.chatWidget?.addAiMessage(aiMessages[aiMessages.length - 1].content);
          }
        },
        error: () => {
          this.chatWidget?.isTyping.set(false);
          this.chatWidget?.addAiMessage('Sorry, I am unable to connect right now. Please try again later.');
        },
      });
    } else {
      this.sendChatMessage(text);
    }
  }

  private sendChatMessage(text: string): void {
    if (!this.conversationId) return;
    this.chatWidget?.isTyping.set(true);
    this.chatService.sendMessage(this.conversationId, this.chatSessionId, { content: text }).subscribe({
      next: (response) => {
        this.chatWidget?.isTyping.set(false);
        if (response.content) {
          this.chatWidget?.addAiMessage(response.content);
        }
      },
      error: () => {
        this.chatWidget?.isTyping.set(false);
        this.chatWidget?.addAiMessage('Sorry, something went wrong. Please try again.');
      },
    });
  }

  private generateSessionId(): string {
    return crypto.randomUUID();
  }
}

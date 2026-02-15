import { Component, inject, ViewChild } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
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
import { CartService } from '../../services/cart.service';

@Component({
  selector: 'app-main-layout',
  imports: [
    RouterOutlet,
    RouterLink,
    RouterLinkActive,
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
  readonly cartService = inject(CartService);

  @ViewChild(ChatWidgetComponent) chatWidget?: ChatWidgetComponent;

  mobileMenuOpen = false;
  currentYear = new Date().getFullYear();

  private conversationId: string | null = localStorage.getItem('chat_conversation_id');
  private sessionId: string = localStorage.getItem('chat_session_id') ?? crypto.randomUUID?.() ?? Date.now().toString();

  readonly navLinks = [
    { label: 'Collection', href: '/collection' },
    { label: 'Our Story', href: '/our-story' },
    { label: 'Hair Care', href: '/hair-care' },
    { label: 'Contact', href: '/contact' },
  ];

  readonly socialLinks: SocialLink[] = [
    { platform: 'instagram', href: 'https://instagram.com/manehaus' },
    { platform: 'tiktok', href: 'https://tiktok.com/@manehaus' },
    { platform: 'email', href: 'mailto:hello@manehaus.ca' },
  ];

  readonly shopLinks: FooterLink[] = [
    { label: 'Bundles', href: '/collection/bundles' },
    { label: 'Closures', href: '/collection/closures' },
    { label: 'Frontals', href: '/collection/frontals' },
    { label: 'Bundle Deals', href: '/collection/deals' },
  ];

  readonly companyLinks: FooterLink[] = [
    { label: 'Our Story', href: '/our-story' },
    { label: 'Contact', href: '/contact' },
    { label: 'Wholesale', href: '/wholesale' },
    { label: 'Ambassador Program', href: '/ambassador' },
  ];

  readonly supportLinks: FooterLink[] = [
    { label: 'Hair Care Guide', href: '/hair-care' },
    { label: 'Shipping Info', href: '/shipping' },
    { label: 'Returns & Exchanges', href: '/returns' },
    { label: 'FAQ', href: '/faq' },
  ];

  toggleMobileMenu(): void {
    this.mobileMenuOpen = !this.mobileMenuOpen;
  }

  navigateTo(path: string): void {
    this.router.navigate([path]);
    if (this.mobileMenuOpen) {
      this.mobileMenuOpen = false;
    }
  }

  onFooterLinkClick(href: string): void {
    this.router.navigate([href]);
  }

  onChatMessage(message: string): void {
    if (!this.chatWidget) return;

    this.chatWidget.isTyping.set(true);

    if (!this.conversationId) {
      localStorage.setItem('chat_session_id', this.sessionId);
      this.chatService.createConversation({
        sessionId: this.sessionId,
        initialMessage: message,
      }).subscribe({
        next: (conversation) => {
          this.conversationId = conversation.id;
          localStorage.setItem('chat_conversation_id', conversation.id);
          this.chatWidget!.isTyping.set(false);
          const aiMessages = conversation.messages.filter(m => m.senderType === 'ai' || m.senderType === 'assistant');
          if (aiMessages.length > 0) {
            this.chatWidget!.addAiMessage(aiMessages[aiMessages.length - 1].content);
          }
        },
        error: () => {
          this.chatWidget!.isTyping.set(false);
          this.chatWidget!.addAiMessage('Sorry, I\'m having trouble connecting. Please try again later.');
        },
      });
    } else {
      this.chatService.sendMessage(this.conversationId, this.sessionId, { content: message }).subscribe({
        next: (response) => {
          this.chatWidget!.isTyping.set(false);
          this.chatWidget!.addAiMessage(response.content);
        },
        error: () => {
          this.chatWidget!.isTyping.set(false);
          this.chatWidget!.addAiMessage('Sorry, I\'m having trouble connecting. Please try again later.');
        },
      });
    }
  }
}

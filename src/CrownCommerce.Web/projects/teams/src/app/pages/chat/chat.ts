import { Component, computed, effect, inject, signal } from '@angular/core';
import { BreakpointObserver } from '@angular/cdk/layout';
import { toSignal } from '@angular/core/rxjs-interop';
import { map } from 'rxjs';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatBadgeModule } from '@angular/material/badge';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { SchedulingService } from 'api';
import type { ChatChannel, ChatMessage } from '../../data/mock-data';

// Use first seeded employee as current user
const CURRENT_EMPLOYEE_ID_KEY = 'currentEmployeeId';

@Component({
  selector: 'app-chat',
  imports: [
    MatIconModule,
    MatButtonModule,
    MatBadgeModule,
    MatFormFieldModule,
    MatInputModule,
  ],
  templateUrl: './chat.html',
  styleUrl: './chat.scss',
})
export class ChatPage {
  private readonly breakpointObserver = inject(BreakpointObserver);
  private readonly schedulingService = inject(SchedulingService);

  private currentEmployeeId = '';

  private readonly isMobileSignal = toSignal(
    this.breakpointObserver.observe('(max-width: 767px)').pipe(
      map((result) => result.matches)
    ),
    { initialValue: false }
  );

  readonly isMobile = computed(() => this.isMobileSignal());
  readonly showChannelList = signal(true);
  readonly selectedChannelId = signal<number>(0);

  readonly channels = signal<ChatChannel[]>([]);
  readonly publicChannels = computed(() => this.channels().filter((c) => !c.isPrivate));
  readonly directMessages = computed(() => this.channels().filter((c) => c.isPrivate));

  readonly messages = signal<ChatMessage[]>([]);

  readonly selectedChannel = computed(() =>
    this.channels().find((c) => c.id === this.selectedChannelId())
  );

  private channelIdMap = new Map<number, string>(); // numeric id -> guid

  constructor() {
    // Load the first employee as current user, then load channels
    this.schedulingService.getEmployees().subscribe((employees) => {
      if (employees.length > 0) {
        this.currentEmployeeId = employees[0].id;
        this.loadChannels();
      }
    });

    // When selected channel changes, load messages
    effect(() => {
      const numId = this.selectedChannelId();
      const guid = this.channelIdMap.get(numId);
      if (guid) {
        this.schedulingService.getChannelMessages(guid).subscribe((msgs) => {
          this.messages.set(
            msgs.map((m, i) => ({
              id: i + 1,
              channelId: numId,
              senderId: 0,
              senderName: m.senderName,
              senderInitials: m.senderInitials,
              content: m.content,
              timestamp: new Date(m.sentAt).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true }),
              isOwn: m.senderEmployeeId === this.currentEmployeeId,
            }))
          );
        });

        // Mark as read
        this.schedulingService.markChannelAsRead(guid, { employeeId: this.currentEmployeeId }).subscribe();
      }
    });
  }

  private loadChannels() {
    this.schedulingService.getChannels(this.currentEmployeeId).subscribe((apiChannels) => {
      const mapped: ChatChannel[] = apiChannels.map((c, i) => {
        const numId = i + 1;
        this.channelIdMap.set(numId, c.id);
        return {
          id: numId,
          name: c.name,
          icon: c.icon ?? 'tag',
          unreadCount: c.unreadCount,
          lastMessage: c.lastMessage ?? '',
          lastMessageTime: c.lastMessageTime ? this.formatRelativeTime(c.lastMessageTime) : '',
          isPrivate: c.channelType === 'DirectMessage',
        };
      });

      this.channels.set(mapped);

      if (mapped.length > 0 && this.selectedChannelId() === 0) {
        this.selectedChannelId.set(mapped[0].id);
      }
    });
  }

  selectChannel(id: number) {
    this.selectedChannelId.set(id);
    if (this.isMobile()) {
      this.showChannelList.set(false);
    }
  }

  backToChannels() {
    this.showChannelList.set(true);
  }

  private formatRelativeTime(dateStr: string): string {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    if (diffMins < 1) return 'just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays}d ago`;
  }
}

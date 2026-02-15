import { Component, computed, inject, signal } from '@angular/core';
import { BreakpointObserver } from '@angular/cdk/layout';
import { toSignal } from '@angular/core/rxjs-interop';
import { map } from 'rxjs';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatBadgeModule } from '@angular/material/badge';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { CHAT_CHANNELS, CHAT_MESSAGES, type ChatChannel, type ChatMessage } from '../../data/mock-data';

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

  private readonly isMobileSignal = toSignal(
    this.breakpointObserver.observe('(max-width: 767px)').pipe(
      map((result) => result.matches)
    ),
    { initialValue: false }
  );

  readonly isMobile = computed(() => this.isMobileSignal());
  readonly showChannelList = signal(true);
  readonly selectedChannelId = signal(1);

  readonly channels = signal<ChatChannel[]>(CHAT_CHANNELS);
  readonly publicChannels = computed(() => this.channels().filter((c) => !c.isPrivate));
  readonly directMessages = computed(() => this.channels().filter((c) => c.isPrivate));

  readonly messages = computed(() =>
    CHAT_MESSAGES.filter((m) => m.channelId === this.selectedChannelId())
  );

  readonly selectedChannel = computed(() =>
    this.channels().find((c) => c.id === this.selectedChannelId())
  );

  selectChannel(id: number) {
    this.selectedChannelId.set(id);
    if (this.isMobile()) {
      this.showChannelList.set(false);
    }
  }

  backToChannels() {
    this.showChannelList.set(true);
  }
}

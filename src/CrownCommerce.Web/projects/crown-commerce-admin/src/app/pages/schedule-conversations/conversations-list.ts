import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import {
  SchedulingService,
  type Employee,
  type ScheduleConversationSummary,
  type ScheduleConversation,
  type ScheduleConversationMessage,
} from 'api';

@Component({
  selector: 'app-conversations-list',
  imports: [
    DatePipe,
    FormsModule,
    MatIconModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatProgressSpinnerModule,
  ],
  templateUrl: './conversations-list.html',
  styleUrl: './conversations-list.scss',
})
// TODO: Inject TeamHubService and subscribe to 'ReceiveMessage' events for real-time updates
// Example:
// private readonly teamHub = inject(TeamHubService);
// In ngOnInit: this.teamHub.onMessage$.subscribe(msg => { ... update active conversation ... });
// In selectConversation: join/leave channels
export class ConversationsListPage implements OnInit {
  private readonly schedulingService = inject(SchedulingService);

  readonly employees = signal<Employee[]>([]);
  readonly currentEmployee = signal<Employee | null>(null);
  readonly conversations = signal<ScheduleConversationSummary[]>([]);
  readonly activeConversation = signal<ScheduleConversation | null>(null);
  readonly newMessageContent = signal('');
  readonly showNewConversation = signal(false);
  readonly loading = signal(true);
  readonly error = signal<string | null>(null);

  // New conversation form
  newSubject = '';
  newParticipantIds: string[] = [];
  newInitialMessage = '';

  readonly employeeLookup = computed(() => {
    const map = new Map<string, Employee>();
    for (const emp of this.employees()) {
      map.set(emp.id, emp);
    }
    return map;
  });

  ngOnInit() {
    this.schedulingService.getEmployees().subscribe({
      next: (data) => this.employees.set(data),
      error: () => this.error.set('Failed to load employees'),
    });
    this.schedulingService.getCurrentEmployee().subscribe({
      next: (emp) => this.currentEmployee.set(emp),
      error: () => {
        // Fallback: use first employee if getCurrentEmployee fails
        // TODO: Ensure backend /api/scheduling/employees/me returns authenticated user
      },
    });
    this.loadConversations();
  }

  loadConversations() {
    this.schedulingService.getConversations().subscribe({
      next: (data) => {
        this.conversations.set(data);
        this.loading.set(false);
      },
      error: () => {
        this.error.set('Failed to load conversations');
        this.loading.set(false);
      },
    });
  }

  selectConversation(id: string) {
    this.showNewConversation.set(false);
    this.schedulingService.getConversation(id).subscribe({
      next: (data) => this.activeConversation.set(data),
      error: () => this.error.set('Failed to load conversation'),
    });
  }

  getSenderName(employeeId: string): string {
    const emp = this.employeeLookup().get(employeeId);
    return emp ? `${emp.firstName} ${emp.lastName}` : 'Unknown';
  }

  getSenderInitials(employeeId: string): string {
    const emp = this.employeeLookup().get(employeeId);
    return emp ? `${emp.firstName[0]}${emp.lastName[0]}` : '??';
  }

  private getCurrentEmployeeId(): string | null {
    return this.currentEmployee()?.id ?? this.employees()[0]?.id ?? null;
  }

  sendMessage() {
    const conv = this.activeConversation();
    const content = this.newMessageContent();
    if (!conv || !content.trim()) return;

    const senderId = this.getCurrentEmployeeId();
    if (!senderId) return;

    this.schedulingService.sendMessage(conv.id, { senderEmployeeId: senderId, content }).subscribe({
      next: (msg) => {
        const current = this.activeConversation();
        if (current) {
          this.activeConversation.set({
            ...current,
            messages: [...current.messages, msg],
            lastMessageAt: msg.sentAt,
          });
        }
        this.newMessageContent.set('');
        this.loadConversations();
      },
      error: () => this.error.set('Failed to send message'),
    });
  }

  openNewConversation() {
    this.showNewConversation.set(true);
    this.activeConversation.set(null);
  }

  createConversation() {
    if (!this.newSubject || this.newParticipantIds.length === 0) return;

    const creatorId = this.getCurrentEmployeeId();
    if (!creatorId) return;

    this.schedulingService.createConversation({
      subject: this.newSubject,
      createdByEmployeeId: creatorId,
      participantEmployeeIds: this.newParticipantIds,
      initialMessage: this.newInitialMessage || undefined,
    }).subscribe({
      next: (conv) => {
        this.showNewConversation.set(false);
        this.newSubject = '';
        this.newParticipantIds = [];
        this.newInitialMessage = '';
        this.loadConversations();
        this.activeConversation.set(conv);
      },
      error: () => this.error.set('Failed to create conversation'),
    });
  }

  getStatusIcon(status: string): string {
    switch (status) {
      case 'Active': return 'chat_bubble';
      case 'Archived': return 'archive';
      case 'Closed': return 'check_circle';
      default: return 'chat_bubble';
    }
  }
}

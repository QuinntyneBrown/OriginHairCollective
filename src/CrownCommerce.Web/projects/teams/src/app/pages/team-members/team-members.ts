import { Component, computed, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { SchedulingService } from 'api';
import { map } from 'rxjs';
import type { TeamMember } from '../../data/mock-data';

type StatusFilter = 'all' | 'online' | 'away';

@Component({
  selector: 'app-team-members',
  imports: [
    MatCardModule,
    MatIconModule,
    MatButtonModule,
    MatButtonToggleModule,
    MatFormFieldModule,
    MatInputModule,
  ],
  templateUrl: './team-members.html',
  styleUrl: './team-members.scss',
})
export class TeamMembersPage {
  private readonly schedulingService = inject(SchedulingService);

  private readonly apiMembers = toSignal(
    this.schedulingService.getEmployees().pipe(
      map((employees) =>
        employees.map((e) => ({
          id: e.id as unknown as number,
          name: `${e.firstName} ${e.lastName}`,
          initials: `${e.firstName[0]}${e.lastName[0]}`.toUpperCase(),
          role: e.jobTitle,
          department: e.department ?? '',
          avatar: '',
          status: (e.presence?.toLowerCase() ?? 'offline') as 'online' | 'away' | 'offline',
          email: e.email,
        }))
      )
    ),
    { initialValue: [] as TeamMember[] }
  );

  readonly members = computed(() => this.apiMembers());
  readonly searchQuery = signal('');
  readonly statusFilter = signal<StatusFilter>('all');

  readonly onlineCount = computed(() => this.members().filter((m) => m.status === 'online').length);
  readonly awayCount = computed(() => this.members().filter((m) => m.status === 'away').length);

  readonly filteredMembers = computed(() => {
    let result = this.members();
    const query = this.searchQuery().toLowerCase();
    if (query) {
      result = result.filter(
        (m) => m.name.toLowerCase().includes(query) || m.role.toLowerCase().includes(query) || m.department.toLowerCase().includes(query)
      );
    }
    const filter = this.statusFilter();
    if (filter !== 'all') {
      result = result.filter((m) => m.status === filter);
    }
    return result;
  });

  onSearch(event: Event) {
    this.searchQuery.set((event.target as HTMLInputElement).value);
  }

  onFilterChange(value: StatusFilter) {
    this.statusFilter.set(value);
  }
}

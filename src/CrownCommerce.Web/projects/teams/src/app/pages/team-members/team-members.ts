import { Component, computed, signal } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { TEAM_MEMBERS, type TeamMember } from '../../data/mock-data';

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
  readonly members = signal<TeamMember[]>(TEAM_MEMBERS);
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

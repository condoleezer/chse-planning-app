import { Component, OnInit } from '@angular/core';
import { FullCalendarModule } from '@fullcalendar/angular';
import { CalendarOptions, EventInput } from '@fullcalendar/core';
import dayGridPlugin from '@fullcalendar/daygrid';
import { UserService } from '../../../services/user/user.service';
import { PlanningService } from '../../../services/planning/planning.service';
import { AuthService } from '../../../services/auth/auth.service';
import { User } from '../../../models/User';
import { CommonModule } from '@angular/common';
import { MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';

@Component({
  selector: 'app-calendar',
  imports: [FullCalendarModule, CommonModule, ToastModule],
  providers: [MessageService],
  standalone: true,
  templateUrl: './calendar.component.html',
  styleUrls: ['./calendar.component.css']
})
export class CalendarComponent implements OnInit {
  calendarOptions: CalendarOptions = {
    plugins: [dayGridPlugin],
    initialView: 'dayGridMonth',
    events: [],
    eventContent: this.customEventContent.bind(this),
    headerToolbar: {
      left: 'prev,next today',
      center: 'title',
      right: 'dayGridMonth'
    }
  };
  loggedInUser: User | null = null;
  monthlyPlanning: any = null;

  constructor(
    private userService: UserService,
    private planningService: PlanningService,
    private authService: AuthService,
    private messageService: MessageService
  ) {}

  ngOnInit() {
    this.loadUserAndPlanning();
  }

  loadUserAndPlanning(): void {
    this.authService.getUserInfo().subscribe({
      next: (user: User | null) => {
        if (user?._id) {
          this.loggedInUser = user;
          this.loadPlanning(user._id);
        } else {
          this.showError('Impossible de charger les informations utilisateur');
        }
      },
      error: () => {
        this.showError('Échec de la connexion au serveur');
      }
    });
  }

  loadPlanning(userId: string): void {
    this.planningService.getUserPlanning(userId).subscribe({
      next: (response) => {
        if (response.data && response.data.type === 'monthly') {
          this.monthlyPlanning = response.data;
          this.updateCalendarEvents();
        } else {
          this.showInfo('Aucun planning mensuel trouvé pour votre profil');
        }
      },
      error: (err) => {
        console.error('Erreur chargement planning:', err);
        this.showError('Impossible de charger le planning');
      }
    });
  }

  updateCalendarEvents(): void {
    if (!this.monthlyPlanning || !this.monthlyPlanning.data) {
      return;
    }

    const events: EventInput[] = [];
    const currentYear = this.monthlyPlanning.year || 2026;
    const monthName = this.monthlyPlanning.month || 'février';
    const monthIndex = this.getMonthIndex(monthName);

    // Parcourir chaque employé dans le planning
    this.monthlyPlanning.data.forEach((employee: any) => {
      const employeeName = employee.employee;
      const days = employee.days;

      // Pour chaque jour travaillé
      Object.keys(days).forEach(dayNum => {
        const code = days[dayNum];
        const dayNumber = parseInt(dayNum);

        if (!isNaN(dayNumber) && dayNumber >= 1 && dayNumber <= 31) {
          const eventDate = new Date(currentYear, monthIndex, dayNumber);

          events.push({
            title: `${employeeName}: ${code}`,
            start: eventDate,
            allDay: true,
            backgroundColor: this.getCodeColor(code),
            borderColor: this.getCodeColor(code),
            extendedProps: {
              employee: employeeName,
              code: code
            }
          });
        }
      });
    });

    this.calendarOptions.events = events;
  }

  getMonthIndex(monthName: string): number {
    const months: { [key: string]: number } = {
      'janvier': 0, 'février': 1, 'mars': 2, 'avril': 3,
      'mai': 4, 'juin': 5, 'juillet': 6, 'août': 7,
      'septembre': 8, 'octobre': 9, 'novembre': 10, 'décembre': 11
    };
    return months[monthName.toLowerCase()] || 1;
  }

  getCodeColor(code: string): string {
    // Couleurs selon les codes
    const colorMap: { [key: string]: string } = {
      'RC': '#f59e0b', // Repos compensateur - orange
      'RH': '#10b981', // Repos hebdomadaire - vert
      'F': '#ef4444',  // Férié - rouge
      'CA': '#8b5cf6', // Congé annuel - violet
      'CM': '#ec4899', // Congé maladie - rose
      'CP': '#06b6d4', // Congé payé - cyan
      'J19': '#3b82f6', // Jour travaillé - bleu
      'M': '#6366f1',   // Matin - indigo
      'S': '#14b8a6',   // Soir - teal
      'N': '#64748b'    // Nuit - gris
    };
    return colorMap[code] || '#6b7280'; // Gris par défaut
  }

  customEventContent(arg: any) {
    const employee = arg.event.extendedProps.employee;
    const code = arg.event.extendedProps.code;

    return {
      html: `
        <div style="padding: 2px 4px; font-size: 11px; font-weight: 500; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">
          ${employee}: ${code}
        </div>
      `
    };
  }

  private showError(message: string): void {
    this.messageService.add({
      severity: 'error',
      summary: 'Erreur',
      detail: message
    });
  }

  private showInfo(message: string): void {
    this.messageService.add({
      severity: 'info',
      summary: 'Information',
      detail: message
    });
  }
}
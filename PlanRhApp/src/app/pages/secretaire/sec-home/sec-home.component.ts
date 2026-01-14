import { Component, OnInit, signal, WritableSignal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CardModule } from 'primeng/card';
import { TableModule } from 'primeng/table';
import { ChartModule } from 'primeng/chart';
import { TagModule } from 'primeng/tag';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { CalendarModule } from 'primeng/calendar';
import { FormsModule } from '@angular/forms';
import { MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { AbsenceService } from '../../../services/absence/absence.service';
import { AuthService } from '../../../services/auth/auth.service';
import { UserService } from '../../../services/user/user.service';
import { ContratService } from '../../../services/contrat/contrat.service';
import { ServiceService } from '../../../services/service/service.service';
import { Absence } from '../../../models/absence';
import { Service } from '../../../models/services';
import { User } from '../../../models/User';
import { Contrat } from '../../../models/contrat';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-sec-home',
  standalone: true,
  imports: [
    CommonModule,
    CardModule,
    TableModule,
    ChartModule,
    TagModule,
    ButtonModule,
    DialogModule,
    CalendarModule,
    FormsModule,
    ToastModule
  ],
  templateUrl: './sec-home.component.html',
  styleUrl: './sec-home.component.css',
  providers: [MessageService]
})
export class SecHomeComponent implements OnInit {
  stats = {
    plannedAbsences: 0,
    workedDays: 0,
    remainingDaysOff: 0,
    nextDayOff: 'Aucun',
    totalWorkedDays: 0, // New: Total days worked since Jan 1
    totalWorkedHours: 0 // New: Total hours worked since Jan 1
  };

  chartData: any;
  chartOptions: any;

  absences: Absence[] = [];
  upcomingAbsences: any[] = [];
  loggedInUser: User | null = null;
  displayRequestDialog: WritableSignal<boolean> = signal(false);
  userContract: Contrat | null = null;
  currentMonthWorkedDays: number = 0;
  currentMonthDaysOff: number = 0;
  workSchedule: {date: Date, isWorking: boolean, isAbsent: boolean}[] = [];
  contractWorkDays: string[] = [];
  allUsers: User[] = [];
  allServices: Service[] = [];

  absenceRequest = {
    startDate: new Date(),
    endDate: new Date(),
    reason: '',
    replacementId: ''
  };

  replacements: User[] = [];
  readonly HOURS_PER_WORKDAY: number = 8; // Assumption: 8 hours per workday

  constructor(
    private absenceService: AbsenceService,
    private authService: AuthService,
    private userService: UserService,
    private serviceService: ServiceService,
    private contratService: ContratService,
    private messageService: MessageService
  ) {}

  ngOnInit(): void {
    this.loadUserData();
    this.initChart();
  }

  loadUserData(): void {
    this.authService.getUserInfo().subscribe({
      next: (user: User | null) => {
        if (user?._id) {
          this.loggedInUser = user;
          this.loadDashboardData();
        } else {
          this.showError('Impossible de charger vos informations');
        }
      },
      error: () => {
        this.showError('Échec de la connexion au serveur');
      }
    });
  }

  loadDashboardData(): void {
    if (!this.loggedInUser?._id) return;

    forkJoin([
      this.contratService.getContratByUserId(this.loggedInUser._id),
      this.absenceService.findAllAbsences(),
      this.userService.findAllUsers(),
      this.userService.findAllNurse(),
      this.serviceService.findAllServices()
    ]).subscribe({
      next: ([contratResponse, absencesResponse, usersResponse, nursesResponse, servicesResponse]) => {
        if (contratResponse?.data) {
          this.userContract = contratResponse.data;
          this.contractWorkDays = this.userContract.work_days?.map(w => w.day) || [];
        }

        this.absences = absencesResponse.data?.filter(a => a.staff_id === this.loggedInUser?._id) || [];
        this.allUsers = usersResponse.data || [];
        this.replacements = nursesResponse.data || [];
        this.allServices = servicesResponse.data || [];

        this.generateMonthlySchedule();
        this.calculateStats();
        this.calculateTotalWorkedDaysAndHours(); // New: Calculate total days and hours
        this.prepareUpcomingAbsences();
        this.updateChart();
      },
      error: (err) => {
        console.error('Error loading dashboard data:', err);
        this.showError('Erreur lors du chargement des données');
      }
    });
  }

  calculateTotalWorkedDaysAndHours(): void {
    const today = new Date();
    const startOfYear = new Date(today.getFullYear(), 0, 1); // January 1st
    let totalWorkedDays = 0;
    let totalWorkedHours = 0;

    for (let date = new Date(startOfYear); date <= today; date.setDate(date.getDate() + 1)) {
      const dayName = this.getDayName(date);
      const isWorkingDay = this.contractWorkDays.includes(dayName);
      const isAbsent = this.isAbsentDay(date);

      if (isWorkingDay && !isAbsent) {
        totalWorkedDays++;
        totalWorkedHours += this.HOURS_PER_WORKDAY;
      }
    }

    this.stats.totalWorkedDays = totalWorkedDays;
    this.stats.totalWorkedHours = totalWorkedHours;
  }

  generateMonthlySchedule(): void {
    const today = new Date();
    const year = today.getFullYear();
    const month = today.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    
    this.workSchedule = [];
    this.currentMonthWorkedDays = 0;
    this.currentMonthDaysOff = 0;

    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day);
      const dayName = this.getDayName(date);
      const isWorkingDay = this.contractWorkDays.includes(dayName);
      const isAbsent = this.isAbsentDay(date);
      
      this.workSchedule.push({
        date,
        isWorking: isWorkingDay && !isAbsent,
        isAbsent
      });

      if (day <= today.getDate()) {
        if (isWorkingDay && !isAbsent) {
          this.currentMonthWorkedDays++;
        } else {
          this.currentMonthDaysOff++;
        }
      }
    }
  }

  getDayName(date: Date): string {
    const days = ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];
    return days[date.getDay()];
  }

  isAbsentDay(date: Date): boolean {
    if (!this.absences) return false;
    
    return this.absences.some(a => {
      if (a.status !== 'Validé par le cadre') return false;
      
      const start = new Date(a.start_date);
      const end = new Date(a.end_date);
      start.setHours(0, 0, 0, 0);
      end.setHours(23, 59, 59, 999);
      date.setHours(0, 0, 0, 0);
      
      return date >= start && date <= end;
    });
  }

  calculateStats(): void {
    const today = new Date();
    const remainingWorkDays = this.calculateRemainingWorkDays(today);
    
    this.stats = {
      ...this.stats, // Preserve totalWorkedDays and totalWorkedHours
      plannedAbsences: this.absences.filter(a => 
        new Date(a.end_date) >= today && a.status !== 'Refusé par le cadre'
      ).length,
      workedDays: this.currentMonthWorkedDays,
      remainingDaysOff: remainingWorkDays,
      nextDayOff: this.getNextDayOff()
    };
  }

  calculateRemainingWorkDays(today: Date): number {
    if (!this.userContract) return 0;
    
    const year = today.getFullYear();
    const month = today.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    let remainingWorkDays = 0;

    for (let day = today.getDate() + 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day);
      const dayName = this.getDayName(date);
      if (this.contractWorkDays.includes(dayName) && !this.isAbsentDay(date)) {
        remainingWorkDays++;
      }
    }

    return remainingWorkDays;
  }

  getNextDayOff(): string {
    const today = new Date();
    const nextDayOff = this.workSchedule.find(day => 
      !day.isWorking && day.date > today && !day.isAbsent
    );
    
    return nextDayOff ? this.formatDate(nextDayOff.date) : 'Aucun';
  }

  updateChart(): void {
    const today = new Date();
    const monthNames = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin', 'Juil', 'Août', 'Sep', 'Oct', 'Nov', 'Déc'];
    
    const labels = [];
    const workedDaysData = [];
    const daysOffData = [];
    const absenceDaysData = [];
    
    for (let i = 5; i >= 0; i--) {
      const targetDate = new Date(today.getFullYear(), today.getMonth() - i, 1);
      const year = targetDate.getFullYear();
      const month = targetDate.getMonth();
      
      labels.push(monthNames[month]);
      
      const stats = this.calculateMonthlyStats(year, month);
      workedDaysData.push(stats.workedDays);
      daysOffData.push(stats.daysOff);
      absenceDaysData.push(stats.absenceDays);
    }
    
    const documentStyle = getComputedStyle(document.documentElement);
    
    this.chartData = {
      labels,
      datasets: [
        {
          label: 'Jours travaillés',
          data: workedDaysData,
          backgroundColor: documentStyle.getPropertyValue('--blue-500'),
          borderColor: documentStyle.getPropertyValue('--blue-500'),
          tension: 0.4
        },
        {
          label: 'Jours de repos',
          data: daysOffData,
          backgroundColor: documentStyle.getPropertyValue('--green-500'),
          borderColor: documentStyle.getPropertyValue('--green-500'),
          tension: 0.4
        },
        {
          label: 'Jours d\'absence',
          data: absenceDaysData,
          backgroundColor: documentStyle.getPropertyValue('--red-500'),
          borderColor: documentStyle.getPropertyValue('--red-500'),
          tension: 0.4
        }
      ]
    };
  }

  calculateMonthlyStats(year: number, month: number): { workedDays: number, daysOff: number, absenceDays: number } {
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    let workedDays = 0;
    let daysOff = 0;
    let absenceDays = 0;

    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day);
      const dayName = this.getDayName(date);
      const isWorkingDay = this.contractWorkDays.includes(dayName);
      const isAbsent = this.isAbsentDay(date);
      
      if (isAbsent) {
        absenceDays++;
      } else if (isWorkingDay) {
        workedDays++;
      } else {
        daysOff++;
      }
    }

    return { workedDays, daysOff, absenceDays };
  }

  prepareUpcomingAbsences(): void {
    this.upcomingAbsences = this.absences
      .filter(a => new Date(a.end_date) >= new Date())
      .map(a => ({
        id: a.id,
        startDate: this.formatDate(a.start_date),
        endDate: this.formatDate(a.end_date),
        status: a.status,
        reason: a.reason,
        created_at: a.created_at,
      }))
      .sort((a, b) => {
        const dateA = a.created_at ? new Date(a.created_at) : new Date(0);
        const dateB = b.created_at ? new Date(b.created_at) : new Date(0);
        return dateB.getTime() - dateA.getTime();
      });
  }

  initChart(): void {
    const documentStyle = getComputedStyle(document.documentElement);
    const textColor = documentStyle.getPropertyValue('--text-color');
    const textColorSecondary = documentStyle.getPropertyValue('--text-color-secondary');
    const surfaceBorder = documentStyle.getPropertyValue('--surface-border');

    this.chartOptions = {
      maintainAspectRatio: false,
      aspectRatio: 0.8,
      plugins: {
        legend: {
          labels: {
            color: textColor,
            font: {
              size: 14
            }
          },
          position: 'bottom'
        },
        tooltip: {
          mode: 'index',
          intersect: false,
          callbacks: {
            label: function(context: any) {
              return `${context.dataset.label}: ${context.raw} jours`;
            }
          }
        }
      },
      scales: {
        x: {
          ticks: {
            color: textColorSecondary,
            font: {
              weight: 500
            }
          },
          grid: {
            color: surfaceBorder,
            drawBorder: false
          }
        },
        y: {
          min: 0,
          ticks: {
            color: textColorSecondary,
            stepSize: 5,
            callback: function(value: any) {
              return value + ' j';
            }
          },
          grid: {
            color: surfaceBorder,
            drawBorder: false
          }
        }
      },
      interaction: {
        mode: 'nearest',
        axis: 'x',
        intersect: false
      }
    };
  }

  showRequestDialog(): void {
    this.displayRequestDialog.set(true);
  }

  getBadgeSeverity(status: string): 'success' | 'info' | 'danger' | 'secondary' | 'warn' {
    switch (status.toLowerCase()) {
      case 'accepté par le remplaçant':
        return 'warn';
      case 'validé par le cadre':
        return 'success';
      case 'en cours':
        return 'info';
      case 'refusé':
      case 'refusé par le remplaçant':
      case 'refusé par le cadre':
        return 'danger';
      default:
        return 'secondary';
    }
  }

  private formatDate(dateString: string | Date): string {
    const date = new Date(dateString);
    return isNaN(date.getTime()) 
      ? 'N/A' 
      : date.toLocaleDateString('fr-FR');
  }

  private showError(message: string): void {
    this.messageService.add({
      severity: 'error',
      summary: 'Erreur',
      detail: message
    });
  }
}
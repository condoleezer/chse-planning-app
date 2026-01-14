import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TableModule } from 'primeng/table';
import { BadgeModule } from 'primeng/badge';
import { CardModule } from 'primeng/card';
import { ChartModule } from 'primeng/chart';
import { AbsenceService } from '../../../services/absence/absence.service';
import { UserService } from '../../../services/user/user.service';
import { ServiceService } from '../../../services/service/service.service';
import { AuthService } from '../../../services/auth/auth.service';
import { Absence } from '../../../models/absence';
import { User } from '../../../models/User';
import { Service } from '../../../models/services';
import { forkJoin } from 'rxjs';
import { MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { Router } from '@angular/router';
import { TagModule } from 'primeng/tag';

@Component({
  selector: 'app-cadre-home',
  imports: [
    CommonModule, 
    TableModule, 
    CardModule,
    ChartModule,
    BadgeModule,
    ToastModule,
    TagModule
  ],
  standalone: true,
  templateUrl: './cadre-home.component.html',
  styleUrls: ['./cadre-home.component.css'],
  providers: [MessageService]
})
export class CadreHomeComponent implements OnInit {
  // Tableau des absences
  cols: any[] = [
    { field: 'staffName', header: 'Nom employé' },
    { field: 'startDate', header: 'Date début' },
    { field: 'endDate', header: 'Date Fin' },
    { field: 'replacementName', header: 'Remplaçant' },
    { field: 'status', header: 'Statut' }
  ];

  // Données pour les cartes
  stats = {
    todayAbsences: 0,
    tomorrowAbsences: 0,
    monthAbsences: 0,
    serviceStaff: 0,
    availableReplacements: 0
  };

  // Données pour les graphiques
  chartData: any;
  chartOptions: any;

  absences: any[] = [];
  todayAbsences: any[] = [];
  tomorrowAbsences: any[] = [];
  allAbsences: Absence[] = [];
  allUsers: User[] = [];
  allServices: Service[] = [];
  loggedInUser: User | null = null;

  constructor(
    private absenceService: AbsenceService,
    private userService: UserService,
    private serviceService: ServiceService,
    private authService: AuthService,
    private messageService: MessageService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadUserAndData();
    this.initChart();
  }

  loadUserAndData(): void {
    this.authService.getUserInfo().subscribe({
      next: (user: User | null) => {
        if (user?._id) {
          this.loggedInUser = user;
          this.loadAllData();
        } else {
          this.showError('Impossible de charger les informations utilisateur');
        }
      },
      error: (err) => {
        this.showError('Échec de la connexion au serveur');
      }
    });
  }

  loadAllData(): void {
    forkJoin([
      this.absenceService.findAllAbsences(),
      this.userService.findAllUsers(),
      this.serviceService.findAllServices()
    ]).subscribe({
      next: ([absencesResponse, usersResponse, servicesResponse]) => {
        this.allAbsences = absencesResponse.data || [];
        this.allUsers = usersResponse.data || [];
        this.allServices = servicesResponse.data || [];

        this.calculateStats();
        this.loadFilteredAbsences();
        //this.loadTodayAbsences();
        this.loadTomorrowAbsences();
        this.updateChart();
      },
      error: (err) => {
        console.error('Error loading data:', err);
        this.showError('Échec du chargement des données');
      }
    });
  }

  calculateStats(): void {
    if (!this.loggedInUser?.service_id) return;
  
    const today = new Date().toISOString().split('T')[0];
    const currentMonth = new Date().getMonth() + 1;
    const currentYear = new Date().getFullYear();
  
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowStr = tomorrow.toISOString().split('T')[0];
  
    // Compter les absences d'aujourd'hui (validées par le cadre)
    const todayAbsencesList = this.allAbsences.filter(absence => 
      absence.start_date <= today && 
      absence.end_date >= today &&
      absence.service_id === this.loggedInUser?.service_id &&
      ['Validé par le cadre'].includes(absence.status)
    );
    this.stats.todayAbsences = todayAbsencesList.length;
  
    // Compter les absences de demain (validées par le cadre)
    const tomorrowAbsencesList = this.allAbsences.filter(absence => 
      absence.start_date <= tomorrowStr && 
      absence.end_date >= tomorrowStr &&
      absence.service_id === this.loggedInUser?.service_id &&
      ['Validé par le cadre'].includes(absence.status)
    );
    this.stats.tomorrowAbsences = tomorrowAbsencesList.length;
  
    // Compter les absences du mois (validées par le cadre)
    this.stats.monthAbsences = this.allAbsences.filter(absence => {
      const absenceDate = new Date(absence.start_date);
      return absenceDate.getMonth() + 1 === currentMonth && 
             absenceDate.getFullYear() === currentYear &&
             absence.service_id === this.loggedInUser?.service_id &&
             ['Validé par le cadre'].includes(absence.status);
    }).length;

    // Compter le personnel du service (excluant l'utilisateur connecté)
    const serviceStaffList = this.allUsers.filter(user => 
      user.service_id === this.loggedInUser?.service_id &&
      user.id !== this.loggedInUser?.id
    );
    this.stats.serviceStaff = serviceStaffList.length;
  
    // Compter les personnes disponibles (qui travaillent aujourd'hui, excluant l'utilisateur connecté)
    const absentStaffIds = todayAbsencesList.map(absence => absence.staff_id);
    this.stats.availableReplacements = serviceStaffList.filter(
      staff => !absentStaffIds.includes(staff._id)
    ).length;
  }

  loadFilteredAbsences(): void {
    if (!this.loggedInUser?.service_id) return;

    this.absences = this.allAbsences
      .filter(absence => absence.service_id === this.loggedInUser?.service_id)
      .map(this.mapAbsenceData.bind(this));
  }

  /*loadTodayAbsences(): void {
    if (!this.loggedInUser?.service_id) return;

    const today = new Date().toISOString().split('T')[0];
    
    this.todayAbsences = this.allAbsences
      .filter(absence => 
        absence.start_date <= today && 
        absence.end_date >= today &&
        absence.service_id === this.loggedInUser?.service_id &&
        ['Validé par le cadre'].includes(absence.status)
      )
      .map(this.mapAbsenceData.bind(this))
      .sort((a, b) => {
        const dateA = a.created_at ? new Date(a.created_at) : new Date(0);
        const dateB = b.created_at ? new Date(b.created_at) : new Date(0);
        return dateB.getTime() - dateA.getTime();
      });
  }*/

  loadTomorrowAbsences(): void {
    if (!this.loggedInUser?.service_id) return;
  
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowStr = tomorrow.toISOString().split('T')[0];
    
    this.tomorrowAbsences = this.allAbsences
      .filter(absence => 
        absence.start_date <= tomorrowStr && 
        absence.end_date >= tomorrowStr &&
        absence.service_id === this.loggedInUser?.service_id
      )
      .map(this.mapAbsenceData.bind(this))
      .sort((a, b) => {
        const dateA = a.created_at ? new Date(a.created_at) : new Date(0);
        const dateB = b.created_at ? new Date(b.created_at) : new Date(0);
        return dateB.getTime() - dateA.getTime();
      });
  }

  mapAbsenceData(absence: Absence): any {
    const staffUser = this.allUsers.find(user => user.id === absence.staff_id);
    const replacementUser = absence.replacement_id
      ? this.allUsers.find(user => user.id === absence.replacement_id)
      : null;

    return {
      id: absence.id,
      staffName: staffUser ? `${staffUser.first_name} ${staffUser.last_name}` : 'Inconnu',
      startDate: this.formatDate(absence.start_date),
      endDate: this.formatDate(absence.end_date),
      replacementName: replacementUser
        ? `${replacementUser.first_name} ${replacementUser.last_name}`
        : 'Non spécifié',
      status: absence.status
    };
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
          position: 'top',
          labels: {
            color: textColor,
            usePointStyle: true,
            padding: 20
          }
        },
        tooltip: {
          mode: 'index',
          intersect: false
        }
      },
      scales: {
        x: {
          stacked: false,
          ticks: {
            color: textColorSecondary
          },
          grid: {
            color: surfaceBorder,
            drawBorder: false
          }
        },
        y: {
          stacked: false,
          ticks: {
            color: textColorSecondary
          },
          grid: {
            color: surfaceBorder,
            drawBorder: false
          }
        }
      }
    };
  
    // Initialisation avec des données vides
    this.chartData = {
      labels: ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin', 'Juil', 'Août', 'Sep', 'Oct', 'Nov', 'Déc'],
      datasets: [
        {
          label: 'Absences validées',
          data: Array(12).fill(0),
          backgroundColor: documentStyle.getPropertyValue('--green-500'),
          borderColor: documentStyle.getPropertyValue('--green-500'),
          tension: 0.4
        },
        {
          label: 'Absences refusées',
          data: Array(12).fill(0),
          backgroundColor: documentStyle.getPropertyValue('--red-500'),
          borderColor: documentStyle.getPropertyValue('--red-500'),
          tension: 0.4
        }
      ]
    };
  }

  updateChart(): void {
    if (!this.allAbsences.length) return;
  
    const monthlyCountsValidated = Array(12).fill(0);
    const monthlyCountsRejected = Array(12).fill(0);
    const currentYear = new Date().getFullYear();
  
    this.allAbsences.forEach(absence => {
      const date = new Date(absence.start_date);
      if (date.getFullYear() === currentYear && 
          absence.service_id === this.loggedInUser?.service_id) {
        const month = date.getMonth();
        
        if (absence.status === 'Validé par le cadre') {
          monthlyCountsValidated[month]++;
        } else if (absence.status === 'Refusé par le cadre') {
          monthlyCountsRejected[month]++;
        }
      }
    });
  
    const documentStyle = getComputedStyle(document.documentElement);
  
    this.chartData = {
      labels: ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin', 'Juil', 'Août', 'Sep', 'Oct', 'Nov', 'Déc'],
      datasets: [
        {
          label: 'Absences validées',
          data: monthlyCountsValidated,
          backgroundColor: documentStyle.getPropertyValue('--green-500'),
          borderColor: documentStyle.getPropertyValue('--green-500'),
          tension: 0.4
        },
        {
          label: 'Absences refusées',
          data: monthlyCountsRejected,
          backgroundColor: documentStyle.getPropertyValue('--red-500'),
          borderColor: documentStyle.getPropertyValue('--red-500'),
          tension: 0.4
        }
      ]
    };
  }

  getBadgeSeverity(status: string):  'success' | 'info' | 'danger' | 'secondary' | 'warn'   {
    switch (status.toLowerCase()) {
      case 'accepté par le remplaçant': return 'warn';
      case 'validé par le cadre': return 'success';
      case 'en cours': return 'info';
      case 'refusé par le remplaçant':
      case 'refusé par le cadre': return 'danger';
      default: return 'secondary';
    }
  }

  viewDetails(absenceId: string): void {
    this.router.navigate(['/cadre/treat-absence', absenceId]);
  }

  private formatDate(dateString: string): string {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return isNaN(date.getTime()) 
      ? dateString 
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
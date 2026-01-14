import { Component, OnInit } from '@angular/core';
import { CommonModule, NgForOf } from '@angular/common';
import { TableModule } from 'primeng/table';
import { BadgeModule } from 'primeng/badge';
import { AbsenceService } from '../../../services/absence/absence.service';
import { UserService } from '../../../services/user/user.service';
import { ServiceService } from '../../../services/service/service.service';
import { AuthService } from '../../../services/auth/auth.service';
import { Absence } from '../../../models/absence';
import { User } from '../../../models/User';
import { Service } from '../../../models/services';
import { forkJoin } from 'rxjs';
import { MessageService, SelectItem } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { Router } from '@angular/router';
import { TabViewModule } from 'primeng/tabview';
import { FormsModule } from '@angular/forms';
import { DropdownModule } from 'primeng/dropdown';
import { InputText } from 'primeng/inputtext';
import { PaginatorModule, PaginatorState } from 'primeng/paginator';
import { Select } from 'primeng/select';
import { CodeService } from '../../../services/code/code.service';
import { Code } from '../../../models/services';

@Component({
  selector: 'app-absences',
  imports: [
    NgForOf,
    TableModule,
    CommonModule,
    ToastModule,
    BadgeModule,
    TabViewModule,
    FormsModule,
    DropdownModule,
    InputText,
    PaginatorModule,
    Select
  ],
  providers: [MessageService],
  standalone: true,
  templateUrl: './absences.component.html',
  styleUrls: ['./absences.component.css']
})
export class AbsencesComponent implements OnInit {
  cols: any[] = [
    { field: 'codeAbsences', header: 'Code absences' },
    { field: 'staffName', header: 'Nom employé' },
    { field: 'startDate', header: 'Date début' },
    { field: 'endDate', header: 'Date Fin' },
    { field: 'heure', header: 'Heure' },
    { field: 'replacementName', header: 'Nom remplaçant' },
    { field: 'status', header: 'Statut' },
    { field: 'actions', header: 'Actions' }
  ];

  absences: any[] = [];
  absences2: any[] = [];
  filteredAbsences: any[] = [];
  filteredAbsences2: any[] = [];
  allAbsences: Absence[] = [];
  allUsers: User[] = [];
  allServices: Service[] = [];
  loggedInUser: User | null = null;
  allCodeAbsences: Code[] = [];

  searchTerm1: string = '';
  searchTerm2: string = '';
  selectedStatus1: string = '';
  selectedStatus2: string = '';
  statusOptions: SelectItem[] = [
    { label: 'Tous', value: '' },
    { label: 'En cours', value: 'En cours' },
    { label: 'Accepté par le remplaçant', value: 'Accepté par le remplaçant' },
    { label: 'Refusé par le remplaçant', value: 'Refusé par le remplaçant' },
    { label: 'Validé par le cadre', value: 'Validé par le cadre' },
    { label: 'Refusé par le cadre', value: 'Refusé par le cadre' }
  ];

  activeTabIndex: number = 0;
  first1: number = 0;
  rows1: number = 10;
  totalRecords1: number = 0;
  first2: number = 0;
  rows2: number = 10;
  totalRecords2: number = 0;

  constructor(
    private absenceService: AbsenceService,
    private userService: UserService,
    private serviceService: ServiceService,
    private authService: AuthService,
    private codeService: CodeService,
    private messageService: MessageService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadUserAndData();
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
      this.serviceService.findAllServices(),
      this.codeService.findAllCodes()
    ]).subscribe({
      next: ([absencesResponse, usersResponse, servicesResponse, codeResponse]) => {
        this.allAbsences = absencesResponse.data || [];
        this.allUsers = usersResponse.data || [];
        this.allServices = servicesResponse.data || [];
        this.allCodeAbsences = codeResponse.data || [];

        this.loadFilteredAbsences();
        this.loadFilteredAbsences2();
      },
      error: (err) => {
        console.error('Error loading data:', err);
        this.showError('Échec du chargement des données');
      }
    });
  }

  loadFilteredAbsences(): void {
    if (!this.loggedInUser?.service_id) {
      this.showError('Service de l\'utilisateur non défini');
      return;
    }

    const filteredAbsences = this.allAbsences.filter(
      absence => absence.service_id === this.loggedInUser?.service_id && 
      ['En cours', 'Accepté par le remplaçant', 'Refusé par le remplaçant'].includes(absence.status)
    ).sort((a, b) => {
      const dateA = a.created_at ? new Date(a.created_at) : new Date(0);
      const dateB = b.created_at ? new Date(b.created_at) : new Date(0);
      return dateB.getTime() - dateA.getTime();
    });

    this.absences = filteredAbsences.map(absence => {
      const staffUser = this.allUsers.find(user => user.id === absence.staff_id);
      const replacementUser = absence.replacement_id
        ? this.allUsers.find(user => user.id === absence.replacement_id)
        : null;
      const service = this.allServices.find(s => s.id === absence.service_id);
      const code = this.allCodeAbsences.find(s => s.id === absence.absence_code_id);

      return {
        id: absence.id,
        staffName: staffUser ? `${staffUser.first_name} ${staffUser.last_name}` : 'Inconnu',
        startDate: this.formatDate(absence.start_date),
        endDate: this.formatDate(absence.end_date),
        heure: `${absence.start_hour}H - ${absence.end_hour}H`,
        code: code?.name_abrege || 'Non attribué',
        replacementName: replacementUser
          ? `${replacementUser.first_name} ${replacementUser.last_name}`
          : 'Non spécifié',
        serviceName: service?.name || 'Non attribué',
        status: absence.status
      };
    });

    this.filteredAbsences = [...this.absences];
    this.applyFilter();
    if (this.absences.length === 0) {
      this.showInfo('Aucune absence pour votre service');
    }
  }

  loadFilteredAbsences2(): void {
    if (!this.loggedInUser?.service_id) {
      this.showError('Service de l\'utilisateur non défini');
      return;
    }

    const filteredAbsences = this.allAbsences.filter(
      absence => absence.service_id === this.loggedInUser?.service_id && 
      ['Validé par le cadre', 'Refusé par le cadre'].includes(absence.status)
    ).sort((a, b) => {
      const dateA = a.created_at ? new Date(a.created_at) : new Date(0);
      const dateB = b.created_at ? new Date(b.created_at) : new Date(0);
      return dateB.getTime() - dateA.getTime();
    });

    this.absences2 = filteredAbsences.map(absence => {
      const staffUser = this.allUsers.find(user => user.id === absence.staff_id);
      const replacementUser = absence.replacement_id
        ? this.allUsers.find(user => user.id === absence.replacement_id)
        : null;
      const service = this.allServices.find(s => s.id === absence.service_id);
      const code = this.allCodeAbsences.find(s => s.id === absence.absence_code_id);

      return {
        id: absence.id,
        staffName: staffUser ? `${staffUser.first_name} ${staffUser.last_name}` : 'Inconnu',
        startDate: this.formatDate(absence.start_date),
        endDate: this.formatDate(absence.end_date),
        heure: `${absence.start_hour}H - ${absence.end_hour}H`,
        code: code?.name_abrege || 'Non attribué',
        replacementName: replacementUser
          ? `${replacementUser.first_name} ${replacementUser.last_name}`
          : 'Non spécifié',
        serviceName: service?.name || 'Non attribué',
        status: absence.status
      };
    });

    this.filteredAbsences2 = [...this.absences2];
    this.applyFilter();
    if (this.absences2.length === 0) {
      this.showInfo('Aucune absence pour votre service');
    }
  }

  applyFilter(): void {
    if (this.activeTabIndex === 0) {
      const term = (this.searchTerm1 || '').toLowerCase();
      this.filteredAbsences = this.absences.filter(absence => {
        const staffName = (absence.staffName || '').toLowerCase();
        const replacementName = (absence.replacementName || '').toLowerCase();
        const startDate = (absence.startDate || '').toLowerCase();
        const endDate = (absence.endDate || '').toLowerCase();
        const heure = (absence.heure || '').toLowerCase();
        const serviceName = (absence.serviceName || '').toLowerCase();
        const status = (absence.status || '').toLowerCase();
        const matchesSearch =
          term === '' ||
          staffName.includes(term) ||
          replacementName.includes(term) ||
          startDate.includes(term) ||
          endDate.includes(term) ||
          heure.includes(term) ||
          serviceName.includes(term) ||
          status.includes(term);
        const matchesStatus = !this.selectedStatus1 || absence.status === this.selectedStatus1;
        return matchesSearch && matchesStatus;
      });
      this.updatePagination();
    } else if (this.activeTabIndex === 1) {
      const term = (this.searchTerm2 || '').toLowerCase();
      this.filteredAbsences2 = this.absences2.filter(absence => {
        const staffName = (absence.staffName || '').toLowerCase();
        const replacementName = (absence.replacementName || '').toLowerCase();
        const startDate = (absence.startDate || '').toLowerCase();
        const endDate = (absence.endDate || '').toLowerCase();
        const heure = (absence.heure || '').toLowerCase();
        const serviceName = (absence.serviceName || '').toLowerCase();
        const status = (absence.status || '').toLowerCase();
        const matchesSearch =
          term === '' ||
          staffName.includes(term) ||
          replacementName.includes(term) ||
          startDate.includes(term) ||
          endDate.includes(term) ||
          heure.includes(term) ||
          serviceName.includes(term) ||
          status.includes(term);
        const matchesStatus = !this.selectedStatus2 || absence.status === this.selectedStatus2;
        return matchesSearch && matchesStatus;
      });
      this.updatePagination();
    }
  }

  updatePagination(): void {
    if (this.activeTabIndex === 0) {
      this.totalRecords1 = this.filteredAbsences.length;
      this.first1 = 0;
    } else if (this.activeTabIndex === 1) {
      this.totalRecords2 = this.filteredAbsences2.length;
      this.first2 = 0;
    }
  }

  onTabChange(event: any): void {
    this.activeTabIndex = event.index;
    this.applyFilter();
  }

  onPageChange1(event: PaginatorState): void {
    this.first1 = event.first ?? 0;
    this.rows1 = event.rows ?? 10;
  }

  onPageChange2(event: PaginatorState): void {
    this.first2 = event.first ?? 0;
    this.rows2 = event.rows ?? 10;
  }

  getBadgeSeverity(status: string): 'success' | 'info' | 'danger' | 'secondary' | 'warn' {
    switch (status.toLowerCase()) {
      case 'accepté par le remplaçant':
      case 'Non spécifié':
        return 'warn';
      case 'validé par le cadre':
        return 'success';
      case 'en cours':
        return 'info';
      case 'refusé par le remplaçant':
      case 'refusé par le cadre':
        return 'danger';
      default:
        return 'secondary';
    }
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

  private showInfo(message: string): void {
    this.messageService.add({
      severity: 'info',
      summary: 'Information',
      detail: message
    });
  }

  viewDetails(absenceId: string): void {
    console.log('Attempting to navigate to /cadre/treat-absence with ID:', absenceId);
    this.router.navigate(['/cadre/treat-absence', absenceId]).then(success => {
      console.log('Navigation success:', success);
      if (!success) {
        console.error('Navigation failed for absenceId:', absenceId);
      }
    }).catch(error => {
      console.error('Navigation error:', error);
    });
  }
}
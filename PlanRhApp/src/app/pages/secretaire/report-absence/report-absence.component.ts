import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { TableModule } from 'primeng/table';
import { CommonModule } from '@angular/common';
import { TabViewModule } from 'primeng/tabview';
import { InputTextModule } from 'primeng/inputtext';
import { DatePickerModule } from 'primeng/datepicker';
import { ButtonModule } from 'primeng/button';
import { SelectModule } from 'primeng/select';
import { MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { AbsenceService } from '../../../services/absence/absence.service';
import { UserService } from '../../../services/user/user.service';
import { CodeService } from '../../../services/code/code.service';
import { Code } from '../../../models/services';
import { ServiceService } from '../../../services/service/service.service';
import { AuthService } from '../../../services/auth/auth.service';
import { User } from '../../../models/User';
import { Service } from '../../../models/services';
import { Response } from '../../../dtos/response/Response';
import { CreateAbsenceRequest } from '../../../dtos/request/CreateAbsenceRequest';

@Component({
  selector: 'app-report-absence',
  imports: [
    TableModule,
    CommonModule,
    TabViewModule,
    InputTextModule,
    DatePickerModule,
    ButtonModule,
    SelectModule,
    ReactiveFormsModule,
    ToastModule
  ],
  standalone: true,
  templateUrl: './report-absence.component.html',
  styleUrls: ['./report-absence.component.css'],
  providers: [MessageService]
})
export class ReportAbsenceComponent implements OnInit {
  reportForm: FormGroup;
  replacementForm: FormGroup;
  nurses: User[] = [];
  codeAbsence: Code[] = [];
  currentUser: User | null = null;
  serviceId: string | null = null;
  isLoading: boolean = true;
  today: Date = new Date();

  constructor(
    private fb: FormBuilder,
    private absenceService: AbsenceService,
    private userService: UserService,
    private serviceService: ServiceService,
    private codeService: CodeService,
    private authService: AuthService,
    private messageService: MessageService,
    private router: Router
  ) {
    this.reportForm = this.fb.group({
      absenceCodeId: ['', Validators.required],
      startDate: ['', Validators.required],
      startHour: ['', Validators.required],
      endDate: ['', Validators.required],
      endHour: ['', Validators.required],
      reason: ['', Validators.required],
      comment: ['', Validators.required]
    }, { validators: [this.timeRangeValidator, this.validateMin72Hours] });

    this.replacementForm = this.fb.group({
      absenceCodeId: ['', Validators.required],
      startDate: ['', Validators.required],
      startHour: ['', Validators.required],
      endDate: ['', Validators.required],
      endHour: ['', Validators.required],
      reason: ['', Validators.required],
      comment: ['', Validators.required],
      replacementId: ['', Validators.required]
    }, { validators: [this.timeRangeValidator, this.validateMin72Hours] });
  }

  ngOnInit() {
    this.loadCurrentUser();
    this.loadNurses();
    this.loadCodes();
  }

  timeRangeValidator(control: FormGroup): { [key: string]: boolean } | null {
    const startDate = control.get('startDate')?.value;
    const startHour = control.get('startHour')?.value;
    const endDate = control.get('endDate')?.value;
    const endHour = control.get('endHour')?.value;

    if (
      startDate instanceof Date &&
      startHour instanceof Date &&
      endDate instanceof Date &&
      endHour instanceof Date &&
      !isNaN(startDate.getTime()) &&
      !isNaN(startHour.getTime()) &&
      !isNaN(endDate.getTime()) &&
      !isNaN(endHour.getTime())
    ) {
      const startDateTime = new Date(startDate);
      startDateTime.setHours(startHour.getHours(), startHour.getMinutes());

      const endDateTime = new Date(endDate);
      endDateTime.setHours(endHour.getHours(), endHour.getMinutes());

      if (startDateTime.getTime() >= endDateTime.getTime()) {
        return { invalidTimeRange: true };
      }
    }
    return null;
  }

  formatTime(time: Date | string): string {
    if (typeof time === 'string') {
      return time;
    }
    if (!(time instanceof Date) || isNaN(time.getTime())) {
      return '00:00';
    }
    const hours = time.getHours().toString().padStart(2, '0');
    const minutes = time.getMinutes().toString().padStart(2, '0');
    return `${hours}:${minutes}`;
  }

  loadCurrentUser() {
    this.isLoading = true;
    this.authService.getUserInfo().subscribe({
      next: (user: User | null) => {
        if (!user) {
          this.isLoading = false;
          this.router.navigate(['/']);
          return;
        }
        this.currentUser = user;
        this.serviceId = this.currentUser.service_id || null;
        this.isLoading = false;
      },
      error: () => {
        this.showError('Erreur lors du chargement de l\'utilisateur');
        this.isLoading = false;
        this.router.navigate(['/']);
      }
    });
  }

  validateMin72Hours(control: FormGroup): { [key: string]: boolean } | null {
    const startDate = control.get('startDate')?.value;
    const startHour = control.get('startHour')?.value;

    if (!startDate || !startHour) {
      return null;
    }

    const startDateTime = new Date(startDate);
    startDateTime.setHours(startHour.getHours(), startHour.getMinutes());

    const now = new Date();
    const diffInMs = startDateTime.getTime() - now.getTime();
    const diffInHours = diffInMs / (1000 * 60 * 60);

    if (diffInHours < 72) {
      return { min72Hours: true };
    }

    return null;
  }

  loadNurses() {
    this.userService.getNurses().subscribe({
      next: (response: Response<User[]>) => {
        if (!response || !response.data) {
          this.nurses = [];
          this.showWarning('Aucun infirmier trouvé.');
          return;
        }
        this.nurses = response.data;
      },
      error: () => {
        this.showError('Erreur lors du chargement des infirmiers');
        this.nurses = [];
      }
    });
  }

  loadCodes() {
    this.codeService.findAllCodes().subscribe({
      next: (response: Response<Code[]>) => {
        if (!response || !response.data) {
          this.codeAbsence = [];
          this.showWarning('Aucun code trouvé.');
          return;
        }
        this.codeAbsence = response.data;
      },
      error: () => {
        this.showError('Erreur lors du chargement des codes absences');
        this.codeAbsence = [];
      }
    });
  }

  submitReport() {
    if (this.reportForm.invalid || this.reportForm.errors?.['invalidTimeRange'] || this.reportForm.errors?.['min72Hours']) {
      this.reportForm.markAllAsTouched();
      if (this.reportForm.errors?.['min72Hours']) {
        this.showError('Impossible d\'effectuer une demande d\'absence moins de 72h avant le début de l\'absence');
      } else if (this.reportForm.errors?.['invalidTimeRange']) {
        this.showError('La date et heure de fin doivent être postérieures à la date et heure de début.');
      }
      return;
    }

    if (this.isLoading || !this.currentUser?._id || !this.serviceId) {
      this.showError('Données utilisateur ou service manquantes');
      return;
    }

    const formValues = this.reportForm.value;
    const absenceData: CreateAbsenceRequest = {
      staff_id: this.currentUser._id,
      start_date: this.formatDate(formValues.startDate),
      start_hour: this.formatTime(formValues.startHour),
      end_date: this.formatDate(formValues.endDate),
      end_hour: this.formatTime(formValues.endHour),
      reason: formValues.reason,
      comment: formValues.comment,
      service_id: this.serviceId,
      absence_code_id: formValues.absenceCodeId,
      replacement_id: undefined,
      status: 'En cours'
    };

    this.absenceService.createAbsence(absenceData).subscribe({
      next: () => {
        this.showSuccess('Absence signalée avec succès');
        this.reportForm.reset();
      },
      error: (err) => {
        this.showError(err.error?.message || 'Erreur lors de la demande de l\'absence');
      }
    });
  }

  submitReplacement() {
    if (this.replacementForm.invalid || this.replacementForm.errors?.['invalidTimeRange'] || this.replacementForm.errors?.['min72Hours']) {
      this.replacementForm.markAllAsTouched();
      if (this.replacementForm.errors?.['min72Hours']) {
        this.showError('Impossible d\'effectuer une demande d\'absence moins de 72h avant le début de l\'absence');
      } else if (this.replacementForm.errors?.['invalidTimeRange']) {
        this.showError('La date et heure de fin doivent être postérieures à la date et heure de début.');
      }
      return;
    }

    if (this.isLoading || !this.currentUser?._id || !this.serviceId) {
      this.showError('Données utilisateur ou service manquantes');
      return;
    }

    const formValues = this.replacementForm.value;
    const absenceData: CreateAbsenceRequest = {
      staff_id: this.currentUser._id,
      start_date: this.formatDate(formValues.startDate),
      start_hour: this.formatTime(formValues.startHour),
      end_date: this.formatDate(formValues.endDate),
      end_hour: this.formatTime(formValues.endHour),
      reason: formValues.reason,
      comment: formValues.comment,
      replacement_id: formValues.replacementId,
      absence_code_id: formValues.absenceCodeId,
      service_id: this.serviceId,
      status: 'En cours'
    };

    this.absenceService.createAbsence(absenceData).subscribe({
      next: () => {
        this.showSuccess('Demande de remplacement transmise');
        this.replacementForm.reset();
      },
      error: (err) => {
        this.showError(err.error?.message || 'Erreur lors de la demande de l\'absence');
      }
    });
  }

  formatDate(date: Date): string {
    if (!(date instanceof Date) || isNaN(date.getTime())) {
      return '';
    }
    return date.toISOString().split('T')[0];
  }

  showSuccess(message: string) {
    this.messageService.add({ severity: 'success', summary: 'Succès', detail: message });
  }

  showError(message: string) {
    this.messageService.add({ severity: 'error', summary: 'Erreur', detail: message });
  }

  showWarning(message: string) {
    this.messageService.add({ severity: 'warn', summary: 'Attention', detail: message });
  }
}
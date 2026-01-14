import { Component, signal, WritableSignal } from '@angular/core';
import { MessageService, SelectItem, ConfirmationService } from 'primeng/api';
import { Paginator, PaginatorState } from 'primeng/paginator';
import { Button } from 'primeng/button';
import { TableModule } from 'primeng/table';
import { DialogModule } from 'primeng/dialog';
import { Drawer } from "primeng/drawer";
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { InputText } from 'primeng/inputtext';
import { Select,  } from 'primeng/select';
import { MultiSelect } from 'primeng/multiselect';
import { ServiceService } from '../../../services/service/service.service';
import { CodeService } from '../../../services/code/code.service';
import { SpecialityService } from '../../../services/speciality/speciality.service';
import { Service, Code, Speciality } from '../../../models/services';
import { UserService } from '../../../services/user/user.service';
import { User } from '../../../models/User';
import { IftaLabel } from 'primeng/iftalabel';
import { CreateServiceRequest,  CreateCodeRequest, CreateSpecialityRequest } from '../../../dtos/request/CreateServiceRequest';
import { Router } from '@angular/router';
import { ToastModule } from 'primeng/toast';
import { TabViewModule } from 'primeng/tabview';
import { FileUploadModule } from 'primeng/fileupload';
import { HttpEventType, HttpResponse } from '@angular/common/http';
import { environment } from '../../../environment/environment';
import { CommonModule, NgForOf } from '@angular/common';
import { BadgeModule } from 'primeng/badge';
import { DropdownModule } from 'primeng/dropdown';
import { DatePickerModule } from 'primeng/datepicker';

@Component({
  selector: 'app-services',
  imports: [
    Button,
    TableModule,
    Drawer,
    FormsModule,
    InputText,
    Select,
    IftaLabel,
    ReactiveFormsModule,
    DialogModule,
    ToastModule,
    TabViewModule,
    FileUploadModule,
    CommonModule, BadgeModule, DropdownModule, DatePickerModule
  ],
  standalone: true,
  templateUrl: './services.component.html',
  styleUrl: './services.component.css',
  providers: [ConfirmationService, MessageService]
})

export class ServicesComponent {
  services!: Service[];
  codes!: Code[];
  specialities!: Speciality[];
  statuses!: SelectItem[];
  // Variables pour chaque formulaire
  serviceVisible: boolean = false;
  poleVisible: boolean = false;
  codeVisible: boolean = false;
  specialityVisible: boolean = false;
  // Variables pour les dialogues de suppression
  deleteServiceDialog: boolean = false;
  deleteCodeDialog: boolean = false;
  deleteSpecialityDialog: boolean = false;
  value1: any = 1;
  value2: any = 1;
  value3: any = 1;
  cadreUsers!: User[];
  selectedResponsible!: string;
  serviceForm!: FormGroup;
  codeForm!: FormGroup;
  specialityForm!: FormGroup;
  loading = signal(false);
  isEditMode = false;
  currentServiceId: string | null = null;
  currentCodeId: string | null = null;
  currentSpecialityId: string | null = null;
  serviceToDelete: Service | null = null;
  codeToDelete: Code | null = null;
  specialityToDelete: Speciality | null = null;
  // variables for upload
  uploadDialogVisible: boolean = false;
  uploadType: string = '';
  uploadUrl: string = '';
  uploadedFiles: any[] = [];
  uploadProgress: number = 0;
  specialityOptions: SelectItem[] = [];

  // Ajoutez ces propriétés à votre classe
  activeTabIndex: number = 0; // Track the active tab
  filteredService: Service[] = [];
  filteredCode: Code[] = [];
  filteredSpeciality: Speciality[] = [];
  // Remplacez searchTerm par des variables spécifiques à chaque onglet
  searchTermService: string = '';
  searchTermCode: string = '';
  searchTermSpeciality: string = '';
  selectedStatus: string = '';
  first: number = 0;
  rows: number = 10;
  totalRecords: number = 0;
  today: Date = new Date();
  minDate: Date = new Date();

  statusOptions = [
    { label: 'En cours', value: 'En cours' },
    { label: 'Réservé', value: 'Réservé' },
    { label: 'Disponible', value: 'Disponible' }
  ];


  constructor(
    private userService: UserService, 
    private serviceService: ServiceService, 
    private codeService: CodeService, 
    private specialityService: SpecialityService, 
    private router: Router, 
    private fb: FormBuilder, 
    private messageService: MessageService,
    private confirmationService: ConfirmationService
  ) {
    this.serviceForm = this.fb.group({
      name: ['', Validators.required],
      head: ['', Validators.required],
    });

    this.codeForm = this.fb.group({
      name: ['', Validators.required],
      name_abrege: [''],
      regroupement: [''],
      indicator: [''],
      begin_date: [''],
      end_date: [''],
    });

    this.specialityForm = this.fb.group({
      name: ['', Validators.required],
    });
  }

  ngOnInit() {
    this.loadServices();
    this.loadCodes();
    this.loadSpecialities();
    this.loadCadreUsers();

    // Initialiser les options de spécialités
    this.specialityService.findAllSpecialities().subscribe(data => {
        this.specialityOptions = data.data.map(spec => ({
            label: spec.name,
            value: spec.id
        }));
    });
  }

  loadServices() {
    this.serviceService.findAllServices().subscribe(data => {
      this.services = data.data.sort((a, b) => {
        const dateA = a.created_at ? new Date(a.created_at) : new Date(0);
        const dateB = b.created_at ? new Date(b.created_at) : new Date(0);
        return dateB.getTime() - dateA.getTime();
      });
      this.filteredService = [...this.services]; // Initialize filtered array
      if (this.isActiveTab(0)) {
        this.applyFilter(); // Apply filter only if services tab is active
      }
    });
  }
  
  loadCodes() {
    this.codeService.findAllCodes().subscribe(data => {
      this.codes = data.data.sort((a, b) => {
        const dateA = a.created_at ? new Date(a.created_at) : new Date(0);
        const dateB = b.created_at ? new Date(b.created_at) : new Date(0);
        return dateB.getTime() - dateA.getTime();
      });
      this.filteredCode = [...this.codes]; // Initialize filtered array
      if (this.isActiveTab(2)) {
        this.applyFilter(); // Apply filter only if rooms tab is active
      }
    });
  }
  
  formatDate(dateString: string): string {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return isNaN(date.getTime()) 
      ? dateString 
      : date.toLocaleDateString('fr-FR');
  }

  loadSpecialities() {
    this.specialityService.findAllSpecialities().subscribe(data => {
      this.specialities = data.data.sort((a, b) => {
        const dateA = a.created_at ? new Date(a.created_at) : new Date(0);
        const dateB = b.created_at ? new Date(b.created_at) : new Date(0);
        return dateB.getTime() - dateA.getTime();
      });
      this.filteredSpeciality = [...this.specialities]; // Initialize filtered array
      if (this.isActiveTab(3)) {
        this.applyFilter(); // Apply filter only if specialities tab is active
      }
    });
  }

  // Modifiez applyFilter pour utiliser les bons indices et termes de recherche
  applyFilter() {
    if (this.isActiveTab(0)) {
      // Filter Services
      const term = (this.searchTermService || '').toLowerCase();
      this.filteredService = this.services.filter(service => {
        const name = (service.name || '').toLowerCase();
        const head = (service.head || '').toLowerCase();
        const matricule = (service.matricule || '').toLowerCase();
        return name.includes(term) || head.includes(term) || matricule.includes(term);
      });
    } else if (this.isActiveTab(1)) {
      // Filter Codes
      const term = (this.searchTermCode || '').toLowerCase();
      this.filteredCode = this.codes.filter(code => {
        const name = (code.name || '').toLowerCase();
        const name_abrege = (code.name_abrege || '').toLowerCase();
        const indicator = (code.indicator || '').toLowerCase();
        const matricule = (code.matricule || '').toLowerCase();
        const regroupement = (code.regroupement || '').toLowerCase();
        return (
          term === '' ||
          name.includes(term) ||
          name_abrege.includes(term) ||
          indicator.includes(term) ||
          matricule.includes(term) ||
          regroupement.includes(term)
        );
      });
    } else if (this.isActiveTab(2)) {
      // Filter Specialities
      const term = (this.searchTermSpeciality || '').toLowerCase();
      this.filteredSpeciality = this.specialities.filter(spec => {
        const name = (spec.name || '').toLowerCase();
        const matricule = (spec.matricule || '').toLowerCase();
        return name.includes(term) || matricule.includes(term);
      });
    }

    this.updatePagination();
  }

  // Mettez à jour updatePagination avec les bons indices
  updatePagination() {
    switch (this.activeTabIndex) {
      case 0:
        this.totalRecords = this.filteredService.length;
        break;
      case 1:
        this.totalRecords = this.filteredCode.length;
        break;
      case 2:
        this.totalRecords = this.filteredSpeciality.length;
        break;
      default:
        this.totalRecords = 0;
    }
    this.first = 0; // Reset to first page
  }

  // Mettez à jour onTabChange pour réinitialiser les termes de recherche si nécessaire
  onTabChange(event: any) {
    this.activeTabIndex = event.index;
    this.applyFilter(); // Re-apply filter when tab changes
  }

  onPageChange(event: any) {
    this.first = event.first;
    this.rows = event.rows;
  }

  isActiveTab(index: number): boolean {
    return this.activeTabIndex === index;
  }

  loadCadreUsers() {
    this.userService.findAllUsers().subscribe(data => {
      // Filtrer pour ne garder que les utilisateurs avec le rôle "cadre"
      this.cadreUsers = data.data.filter(user => user.role === 'cadre');
    });
  }

  showAddDialog() {
    this.isEditMode = false;
    this.serviceForm.reset();
    this.serviceVisible = true;
  }

  showAddDialogCode() {
    this.isEditMode = false;
    this.codeForm.reset();
    this.codeVisible = true;
  }

  showAddDialogSpeciality() {
    this.isEditMode = false;
    this.specialityForm.reset();
    this.specialityVisible = true;
  }

  showEditDialog(service: Service) {
    this.isEditMode = true;
    this.currentServiceId = service.id;
    
    // Trouver l'utilisateur cadre correspondant au responsable du service
    const selectedCadre = this.cadreUsers.find(user => user.first_name === service.head);
    
    if (!selectedCadre) {
      this.showError('Le responsable actuel n\'est pas un cadre ou n\'existe plus');
      return;
    }
    
    this.serviceForm.patchValue({
      name: service.name,
      head: selectedCadre || ''
    });
    
    this.serviceVisible = true;
  }

  showEditDialogCode(code: Code) {
    this.isEditMode = true;
    this.currentCodeId = code.id;
    
    this.codeForm.patchValue({
      name: code.name,
      name_abrege: code.name_abrege || '',
      regroupement: code.regroupement || '',
      indicator: code.indicator || '',
      begin_date: code.begin_date || '',
      end_date: code.end_date || ''
    });
    
    this.codeVisible = true;
  }

  showEditDialogSpeciality(speciality: Speciality) {
    this.isEditMode = true;
    this.currentSpecialityId = speciality.id;
    
    this.specialityForm.patchValue({
      name: speciality.name
    });
    
    this.specialityVisible = true;
  }

  onSubmit() {
    if (this.serviceForm.invalid) {
      this.serviceForm.markAllAsTouched();
      return;
    }

    this.loading.set(true);
    const rawValues = this.serviceForm.getRawValue();
    const createServiceRequest: CreateServiceRequest = {
      name: rawValues.name,
      head: rawValues.head.first_name,
    };

    this.serviceService.createService(createServiceRequest).subscribe({
      next: (data) => {
        this.loading.set(false);
        this.showSuccess('Service créé avec succès');
        this.serviceVisible = false;
        this.loadServices();
      },
      error: (error) => {
        this.loading.set(false);
        console.log(error);
        this.showError('Une erreur est survenue lors de la création');
      }
    });
  }

  onSubmitCode() {
    if (this.codeForm.invalid) {
      this.codeForm.markAllAsTouched();
      return;
    }

    this.loading.set(true);
    const rawValues = this.codeForm.getRawValue();
    const createCodeRequest: CreateCodeRequest = {
      name: rawValues.name,
      name_abrege: rawValues.name_abrege,
      regroupement: rawValues.regroupement,
      indicator: rawValues.indicator,
      begin_date: rawValues.begin_date,
      end_date: rawValues.end_date,
    };

    this.codeService.createCode(createCodeRequest).subscribe({
      next: (data) => {
        this.loading.set(false);
        this.showSuccess('Code créé avec succès');
        this.codeVisible = false;
        this.loadCodes();
      },
      error: (error) => {
        this.loading.set(false);
        console.log(error);
        this.showError('Une erreur est survenue lors de la création');
      }
    });
  }

  onSubmitSpeciality() {
    if (this.specialityForm.invalid) {
      this.specialityForm.markAllAsTouched();
      return;
    }

    this.loading.set(true);
    const rawValues = this.specialityForm.getRawValue();
    const createSpecialityRequest: CreateSpecialityRequest = {
      name: rawValues.name,
    };

    this.specialityService.createSpeciality(createSpecialityRequest).subscribe({
      next: (data) => {
        this.loading.set(false);
        this.showSuccess('Specialité créé avec succès');
        this.specialityVisible = false;
        this.loadSpecialities();
      },
      error: (error) => {
        this.loading.set(false);
        console.log(error);
        this.showError('Une erreur est survenue lors de la création');
      }
    });
  }

  updateService() {
    if (this.serviceForm.invalid || !this.currentServiceId) {
      this.showError('Formulaire invalide');
      return;
    }

    this.loading.set(true);
    const rawValues = this.serviceForm.getRawValue();
    const updateServiceRequest: CreateServiceRequest = {
      name: rawValues.name,
      head: rawValues.head.first_name,
    };

    this.serviceService.updateService(this.currentServiceId, updateServiceRequest).subscribe({
      next: (data) => {
        this.loading.set(false);
        this.showSuccess('Service mis à jour avec succès');
        this.serviceVisible = false;
        this.loadServices();
      },
      error: (error) => {
        this.loading.set(false);
        console.log(error);
        this.showError('Une erreur est survenue lors de la mise à jour');
      }
    });
  }

  updateCodes() {
    if (this.codeForm.invalid || !this.currentCodeId) {
      this.showError('Formulaire invalide');
      return;
    }

    this.loading.set(true);
    const rawValues = this.codeForm.getRawValue();
    const updateCodeRequest: CreateCodeRequest = {
      name: rawValues.name,
      name_abrege: rawValues.name_abrege,
      regroupement: rawValues.regroupement,
      indicator: rawValues.indicator,
      begin_date: rawValues.begin_date,
      end_date: rawValues.end_date,
    };

    this.codeService.updateCode(this.currentCodeId, updateCodeRequest).subscribe({
      next: (data) => {
        this.loading.set(false);
        this.showSuccess('Code mis à jour avec succès');
        this.codeVisible = false;
        this.loadCodes();
      },
      error: (error) => {
        this.loading.set(false);
        console.log(error);
        this.showError('Une erreur est survenue lors de la mise à jour');
      }
    });
  }

  updateSpeciality() {
    if (this.specialityForm.invalid || !this.currentSpecialityId) {
      this.showError('Formulaire invalide');
      return;
    }

    this.loading.set(true);
    const rawValues = this.specialityForm.getRawValue();
    const updateSpecialityRequest: CreateSpecialityRequest = {
      name: rawValues.name,
    };

    this.specialityService.updateSpeciality(this.currentSpecialityId, updateSpecialityRequest).subscribe({
      next: (data) => {
        this.loading.set(false);
        this.showSuccess('Specialité mis à jour avec succès');
        this.specialityVisible = false;
        this.loadSpecialities();
      },
      error: (error) => {
        this.loading.set(false);
        console.log(error);
        this.showError('Une erreur est survenue lors de la mise à jour');
      }
    });
  }


  confirmDelete(service: Service) {
    this.serviceToDelete = service;
    this.deleteServiceDialog = true;
  }

  confirmDeleteCode(code: Code) {
    this.codeToDelete = code;
    this.deleteCodeDialog = true;
  }

  confirmDeleteSpeciality(speciality: Speciality) {
    this.specialityToDelete = speciality;
    this.deleteSpecialityDialog = true;
  }

  deleteService() {
    if (!this.serviceToDelete) return;

    this.loading.set(true);
    this.serviceService.deleteService(this.serviceToDelete.id).subscribe({
      next: () => {
        this.loading.set(false);
        this.showSuccess('Service supprimé avec succès');
        this.deleteServiceDialog = false;
        this.loadServices();
      },
      error: (error) => {
        this.loading.set(false);
        console.log(error);
        this.showError('Une erreur est survenue lors de la suppression');
        this.deleteServiceDialog = false;
      }
    });
  }

  deleteCode() {
    if (!this.codeToDelete) return;

    this.loading.set(true);
    this.codeService.deleteCode(this.codeToDelete.id).subscribe({
      next: () => {
        this.loading.set(false);
        this.showSuccess('Code supprimé avec succès');
        this.deleteCodeDialog = false;
        this.loadCodes();
      },
      error: (error) => {
        this.loading.set(false);
        console.log(error);
        this.showError('Une erreur est survenue lors de la suppression');
        this.deleteCodeDialog = false;
      }
    });
  }

  deleteSpeciality() {
    if (!this.specialityToDelete) return;

    this.loading.set(true);
    this.specialityService.deleteSpeciality(this.specialityToDelete.id).subscribe({
      next: () => {
        this.loading.set(false);
        this.showSuccess('Specialité supprimé avec succès');
        this.deleteSpecialityDialog = false;
        this.loadSpecialities();
      },
      error: (error) => {
        this.loading.set(false);
        console.log(error);
        this.showError('Une erreur est survenue lors de la suppression');
        this.deleteSpecialityDialog = false;
      }
    });
  }

  getEndpointForType(type: string): string {
    switch(type) {
      case 'service': return 'services';
      case 'code': return 'codes';
      case 'speciality': return 'speciality';
      default: return '';
    }
  }
  
  showUploadDialog(type: string) {
    this.uploadDialogVisible = true;
    this.uploadType = type;
    this.uploadUrl = `${environment.apiUrl}/${this.getEndpointForType(type)}/upload`;
  }
  
  onUpload(event: any) {
    for (let file of event.files) {
      this.uploadedFiles.push(file);
    }
  
    if (event.originalEvent instanceof HttpResponse) {
      this.messageService.add({severity: 'success', summary: 'Succès', detail: 'Fichier uploadé avec succès'});
      this.uploadDialogVisible = false;
      this.refreshData();
    }
  }
  
  onBeforeUpload(event: any) {
    event.xhr.upload.addEventListener('progress', (e: ProgressEvent) => {
      if (e.lengthComputable) {
        this.uploadProgress = Math.round((e.loaded * 100) / e.total);
      }
    });
  }
  
  onUploadError(error: any) {
    this.messageService.add({severity: 'error', summary: 'Erreur', detail: 'Échec de l\'upload du fichier'});
    this.uploadProgress = 0;
  }
  
  refreshData() {
    switch(this.uploadType) {
      case 'service': this.loadServices(); break;
      case 'room': this.loadCodes(); break;
      case 'speciality': this.loadSpecialities(); break;
    }
  }

  getBadgeSeverity(status: string): 'success' | 'danger' | 'secondary' {
    switch (status.toLowerCase()) {
      case 'disponible':
        return 'success';
      case 'indisponible':
      case 'réservé':
        return 'danger';
      default:
        return 'secondary';
    }
  }

  showSuccess(message: string) {
    this.messageService.add({ severity: 'success', summary: 'Succès', detail: message });
  }

  showError(message: string) {
    this.messageService.add({ severity: 'error', summary: 'Erreur', detail: message });
  }
}
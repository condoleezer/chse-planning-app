import { Component, OnInit } from '@angular/core';
import {FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators} from '@angular/forms';
import {MenuItem} from 'primeng/api';
import {Breadcrumb} from 'primeng/breadcrumb';
import {Select} from 'primeng/select';
import {Password} from 'primeng/password';
import {Button} from 'primeng/button';
import {InputText} from 'primeng/inputtext';
import {RoleService} from '../../../services/role/role.service';

@Component({
  selector: 'app-add-account',
  imports: [
    Breadcrumb,
    ReactiveFormsModule,
    Select,
    Password,
    Button,
    InputText
  ],
  standalone : true,
  templateUrl: './add-account.component.html',
  styleUrl: './add-account.component.css'
})
export class AddAccountComponent implements OnInit {
  items: MenuItem[] | undefined;

  adminForm!: FormGroup;

  roles: any[] = [];

  constructor(private fb: FormBuilder, private roleService: RoleService) {

  }

  ngOnInit() {
    this.loadRoles();
    this.items = [
      { label: 'Compte' },
      { label: 'Créer un compte' },
    ];
    this.adminForm = this.fb.group({
      password: ['', Validators.required],
      re_password: ['', Validators.required],
      email: ['', Validators.required],
      role: new FormControl<any | null>(null, Validators.required),
    });
  }

  loadRoles() {
    this.roleService.findAllRoles().subscribe({
      next: (response) => {
        this.roles = response.data.map(role => ({
          label: this.getDisplayRole(role.name),
          value: role.name
        }));
      },
      error: (err) => {
        console.error('Erreur lors du chargement des rôles', err);
      }
    });
  }

  getDisplayRole(role: string): string {
    switch (role) {
      case 'admin': return 'Administrateur';
      case 'cadre': return 'Cadre de santé';
      case 'nurse': return 'Agent de santé';
      default: return role;
    }
  }

  submit() {

  }
}

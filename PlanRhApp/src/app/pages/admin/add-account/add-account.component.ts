import { Component } from '@angular/core';
import {FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators} from '@angular/forms';
import {MenuItem} from 'primeng/api';
import {Breadcrumb} from 'primeng/breadcrumb';
import {Select} from 'primeng/select';
import {Password} from 'primeng/password';
import {Button} from 'primeng/button';
import {InputText} from 'primeng/inputtext';

class BaseEntity {
}

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
export class AddAccountComponent {
  items: MenuItem[] | undefined;

  adminForm!: FormGroup;

  roles!: BaseEntity[];

  constructor(private fb: FormBuilder) {

  }

  ngOnInit() {
    this.roles = [
      { name: 'Sécrétaire', id: 'NY' },
      { name: 'Admin', id: 'RM' },
      { name: 'Cadre', id: 'LDN' }
    ];
    this.items = [
      { label: 'Compte' },
      { label: 'Créer un compte' },
    ];
    this.adminForm = this.fb.group({
      password: ['', Validators.required],
      re_password: ['', Validators.required],
      email: ['', Validators.required],
      role: new FormControl<BaseEntity | null>(this.roles[0], Validators.required),
    });
  }

  submit() {

  }
}

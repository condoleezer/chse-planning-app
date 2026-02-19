import { Injectable } from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {environment} from '../../environment/environment';
import {Observable} from 'rxjs';
import {Role} from '../../models/role';
import {Response} from "../../dtos/response/Response";

@Injectable({
  providedIn: 'root'
})
export class RoleService {

  private apiUrl = 'https://planrh-backend.onrender.com/api';
  constructor(private http: HttpClient) { }

  findAllRoles(): Observable<Response<Role[]>>{
    return this.http.get<Response<Role[]>>(`${this.apiUrl}/roles`);
  }
}

import { Injectable } from '@angular/core';
import {environment} from '../../environment/environment';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';
import {Response} from "../../dtos/response/Response";
import {User} from '../../models/User';
import {ChangePasswordRequest} from '../../dtos/request/ChangePasswordRequest';
import {AssignServiceRequest} from '../../dtos/request/AssignServiceRequest';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private apiUrl = 'https://planrh-backend.onrender.com/api';
  constructor(private http: HttpClient) {}

  findAllUsers(): Observable<Response<User[]>> {
    return this.http.get<Response<User[]>>(`${this.apiUrl}/users`)
  }

  findUserById(userId: string): Observable<Response<User>> {
    return this.http.get<Response<User>>(`${this.apiUrl}/users/${userId}`)
  }

  getNurses(): Observable<Response<User[]>> {
    return this.http.get<Response<User[]>>(`${this.apiUrl}/users/nurse`);
  }

  getUserInfo(): Observable<Response<User>> {
    return this.http.get<Response<User>>(`${this.apiUrl}/users/user-info`);
  }

  findAllNurse(): Observable<Response<User[]>> {
    return this.http.get<Response<User[]>>(`${this.apiUrl}/users/nurse`)
  }

  findAllHead(): Observable<Response<User[]>> {
    return this.http.get<Response<User[]>>(`${this.apiUrl}/users/head`)
  }

  deleteUser(userId: string): Observable<Response<any>> {
    return this.http.delete<Response<any>>(`${this.apiUrl}/users/delete/${userId}`);
  }

  updateUser(userId: string, userData: any): Observable<Response<User>> {
    return this.http.put<Response<User>>(`${this.apiUrl}/users/update/${userId}`, userData);
  }

  assignService(userId: string, assignServiceRequest: AssignServiceRequest): Observable<Response<User>> {
    return this.http.put<Response<User>>(`${this.apiUrl}/users/assignService/${userId}`, assignServiceRequest);
  }

  changePassword(userId: string, changePasswordRequest: ChangePasswordRequest): Observable<Response<User>> {
    return this.http.put<Response<User>>(`${this.apiUrl}/users/changePassword/${userId}`, changePasswordRequest);
  }
}
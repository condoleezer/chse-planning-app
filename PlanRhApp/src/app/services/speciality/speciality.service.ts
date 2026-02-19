import { Injectable } from '@angular/core';
import { environment } from '../../environment/environment';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Response } from '../../dtos/response/Response';
import { Speciality } from '../../models/services';
import { CreateSpecialityRequest } from '../../dtos/request/CreateServiceRequest';


@Injectable({
  providedIn: 'root'
})
export class SpecialityService {
  private apiUrl = 'https://planrh-backend.onrender.com/api';
  
  constructor(private http: HttpClient) {}

  findAllSpecialities(): Observable<Response<Speciality[]>> {
    return this.http.get<Response<Speciality[]>>(`${this.apiUrl}/speciality`);
  }

  findSpecialityById(specialityId: string): Observable<Response<Speciality>> {
    return this.http.get<Response<Speciality>>(`${this.apiUrl}/speciality/${specialityId}`);
  }

  createSpeciality(createSpecialityRequest: CreateSpecialityRequest): Observable<Response<Speciality>> {
    return this.http.post<Response<Speciality>>(`${this.apiUrl}/speciality/create`, createSpecialityRequest);
  }

  updateSpeciality(specialityId: string, SpecialityData: CreateSpecialityRequest): Observable<any> {
    return this.http.put(`${this.apiUrl}/speciality/update/${specialityId}`, SpecialityData);
  }
  
  deleteSpeciality(specialityId: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/speciality/delete/${specialityId}`);
  }
}

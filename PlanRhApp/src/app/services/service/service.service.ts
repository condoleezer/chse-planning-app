import { Injectable } from '@angular/core';
import { environment } from '../../environment/environment';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Response } from '../../dtos/response/Response';
import { Service } from '../../models/services';
import { CreateServiceRequest } from '../../dtos/request/CreateServiceRequest';

@Injectable({
  providedIn: 'root'
})
export class ServiceService {
  private apiUrl = 'https://planrh-backend.onrender.com/api';
  
  constructor(private http: HttpClient) {}

  findAllServices(): Observable<Response<Service[]>> {
    return this.http.get<Response<Service[]>>(`${this.apiUrl}/services`);
  }

  findServiceById(serviceId: string): Observable<Response<Service>> {
    return this.http.get<Response<Service>>(`${this.apiUrl}/services/${serviceId}`);
  }

  createService(createServiceRequest: CreateServiceRequest): Observable<Response<Service>> {
    return this.http.post<Response<Service>>(`${this.apiUrl}/services/create`, createServiceRequest);
  }

  updateService(serviceId: string, serviceData: CreateServiceRequest): Observable<any> {
    return this.http.put(`${this.apiUrl}/services/update/${serviceId}`, serviceData);
  }
  
  deleteService(serviceId: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/services/delete/${serviceId}`);
  }
}
import { Injectable } from '@angular/core';
import {environment} from '../../environment/environment';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';
import {Response} from '../../dtos/response/Response';
import {GetPlanByNameRequest} from '../../dtos/request/GetPlanByNameRequest';
import {Programs} from '../../models/programs';

@Injectable({
  providedIn: 'root'
})
export class ProgramService {

  private apiUrl = 'https://planrh-backend.onrender.com/api';

  constructor(private http: HttpClient) { }

  findAllPrograms(): Observable<Response<Programs[]>>{
    return this.http.get<Response<Programs[]>>(`${this.apiUrl}/programs`);
  }

  findProgramById(ProgramId: string): Observable<Response<Programs[]>> {
    return this.http.get<Response<Programs[]>>(`${this.apiUrl}/programs/${ProgramId}`)
  }

  findProgramByName(getPlanByNameRequest: GetPlanByNameRequest): Observable<Response<Programs>> {
    return this.http.post<Response<Programs>>(`${this.apiUrl}/programs/name`, getPlanByNameRequest)
  }
}

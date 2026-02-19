import { Injectable } from '@angular/core';
import {environment} from '../../environment/environment';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';
import {Response} from '../../dtos/response/Response';
import {CreateAskRequest} from '../../dtos/request/CreateAskRequest';
import {Ask} from '../../models/ask';
import {ChangeAskStatusRequest} from '../../dtos/request/ChangeAskStatusRequest';

@Injectable({
  providedIn: 'root'
})
export class AsksAsk {

  private apiUrl = 'https://planrh-backend.onrender.com/api';
  constructor(private http: HttpClient) {}

  findAllAsks(): Observable<Response<Ask[]>> {
    return this.http.get<Response<Ask[]>>(`${this.apiUrl}/asks`)
  }

  findAskById(AskId: string): Observable<Response<Ask[]>> {
    return this.http.get<Response<Ask[]>>(`${this.apiUrl}/asks/${AskId}`)
  }

  createAsk(createAskRequest: CreateAskRequest): Observable<Response<Ask>> {
    return this.http.post<Response<Ask>>(`${this.apiUrl}/asks/create`, createAskRequest)
  }

  deleteAsk(AskId: string): Observable<unknown> {
    return this.http.delete(`${this.apiUrl}/asks/delete/${AskId}`);
  }

  changeAskStatus(AskId:string, changeAskStatusRequest: ChangeAskStatusRequest): Observable<Response<Ask>> {
    return this.http.put<Response<Ask>>(`${this.apiUrl}/asks/changeStatus/${AskId}`, changeAskStatusRequest);
  }
}

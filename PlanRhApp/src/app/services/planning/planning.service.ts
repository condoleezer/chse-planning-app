import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface PlanningResponse {
  message: string;
  data: Planning;
}

export interface Planning {
  id: string;
  name: string;
  type: 'annual' | 'monthly';
  year: number;
  month?: string;
  data: any;
}

export interface AllPlanningsResponse {
  message: string;
  count: number;
  data: Planning[];
}

@Injectable({
  providedIn: 'root'
})
export class PlanningService {
  private apiUrl = 'https://planrh-backend.onrender.com/api';

  constructor(private http: HttpClient) {}

  // Récupérer le planning d'un utilisateur par son ID
  getUserPlanning(userId: string): Observable<PlanningResponse> {
    return this.http.get<PlanningResponse>(`${this.apiUrl}/planning/user/${userId}`);
  }

  // Récupérer le planning annuel d'un agent par son nom
  getAnnualPlanning(agentName: string): Observable<PlanningResponse> {
    return this.http.get<PlanningResponse>(`${this.apiUrl}/planning/annual/${agentName}`);
  }

  // Récupérer tous les plannings annuels
  getAllAnnualPlannings(): Observable<AllPlanningsResponse> {
    return this.http.get<AllPlanningsResponse>(`${this.apiUrl}/planning/annual`);
  }

  // Récupérer le planning mensuel d'un cadre par son nom
  getMonthlyPlanning(cadreName: string): Observable<PlanningResponse> {
    return this.http.get<PlanningResponse>(`${this.apiUrl}/planning/monthly/${cadreName}`);
  }

  // Récupérer tous les plannings mensuels
  getAllMonthlyPlannings(): Observable<AllPlanningsResponse> {
    return this.http.get<AllPlanningsResponse>(`${this.apiUrl}/planning/monthly`);
  }

  // Récupérer les significations des codes
  getCodeMeanings(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/planning/codes`);
  }
}

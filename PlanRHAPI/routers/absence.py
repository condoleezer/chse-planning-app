from bson import ObjectId
from fastapi import HTTPException, APIRouter, Body
from starlette import status
from crud.absence import create_absence, delete_absence, assign_replacer_to_absence, update_absence_status
from database.database import absences
from schemas.absence import AbsenceCreate, AbsenceUpdate
from pydantic import BaseModel
from typing import Optional
from datetime import datetime

router = APIRouter()

"""@router.post("/absences/create")
async def register(absence_info: AbsenceCreate):
    try:
        result = await create_absence({
            "staff_id": absence_info.staff_id,
            "start_date": absence_info.start_date,
            "start_hour": absence_info.start_hour,  # Add this field
            "end_date": absence_info.end_date,
            "end_hour": absence_info.end_hour,      # Add this field
            "reason": absence_info.reason,
            "comment": absence_info.comment,
            "replacement_id": absence_info.replacement_id,
            "service_id": absence_info.service_id,
            "status": absence_info.status,
        })
        return {"message": "Absence registered successfully", "data": result}
    except Exception as e:
        if isinstance(e, HTTPException):
            return e
        return HTTPException(status_code=500, detail=f"Internal Server Error: {str(e)}")"""
    
@router.post("/absences/create")
async def register(absence_info: AbsenceCreate):
    try:
        absence_data = {
            "staff_id": absence_info.staff_id,
            "start_date": absence_info.start_date,
            "start_hour": absence_info.start_hour,
            "end_date": absence_info.end_date,
            "end_hour": absence_info.end_hour,
            "reason": absence_info.reason,
            "comment": absence_info.comment,
            "replacement_id": absence_info.replacement_id,
            "service_id": absence_info.service_id,
            "absence_code_id": absence_info.absence_code_id,
            "status": absence_info.status
        }
        
        result = await create_absence(absence_data)
        return {
            "message": "Absence enregistrée avec succès",
            "data": {
                "id": result["absence_id"],
                "matricule": result["matricule"],
                "created_at": result["created_at"]
            }
        }
    except HTTPException as e:
        raise e
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Erreur interne du serveur: {str(e)}"
        )

@router.delete("/absences/delete/{absence_id}")
async def delete(absence_id: str):
    try:
        result = await delete_absence(absence_id)
        return {"message": "Absence deleted successfully", "data": result}
    except Exception as e:
        return HTTPException(status_code=500, detail=f"Internal Server Error: {str(e)}")

class AbsenceUpdate(BaseModel):
    status: Optional[str] = None  # Status is optional
    replacement_id: Optional[str] = None  # Replacement ID is optional

"""@router.put("/absences/update/{absence_id}")
async def update_absence(
    absence_id: str, 
    update_data: AbsenceUpdate  # Utilisez le modèle AbsenceUpdate que vous avez déjà
):
    try:
        # Vérifier que l'absence existe
        absence = absences.find_one({"_id": ObjectId(absence_id)})
        if not absence:
            raise HTTPException(status_code=404, detail="Absence non trouvée")

        # Préparer les données de mise à jour
        update_fields = {}
        if update_data.status:
            allowed_statuses = ['En cours', 'Accepté par le remplaçant', 'Validé par le cadre', 'Refusé par le remplaçant', 'Refusé par le cadre']
            if update_data.status not in allowed_statuses:
                raise HTTPException(
                    status_code=422,
                    detail=f"Statut invalide. Valeurs autorisées : {allowed_statuses}"
                )
            update_fields["status"] = update_data.status

        if update_data.replacement_id is not None:  # None signifie que le champ était présent mais vide
            update_fields["replacement_id"] = update_data.replacement_id

        # Mettre à jour seulement si on a des champs à modifier
        if update_fields:
            result = absences.update_one(
                {"_id": ObjectId(absence_id)},
                {"$set": update_fields}
            )

        # Récupérer le document mis à jour
        updated_absence = absences.find_one({"_id": ObjectId(absence_id)})
        
        if updated_absence:
            return {
                "message": "Absence mise à jour avec succès",
                "data": {
                    "id": str(updated_absence["_id"]),
                    "status": updated_absence.get("status"),
                    "replacement_id": updated_absence.get("replacement_id"),
                    # Autres champs si besoin
                }
            }
        else:
            raise HTTPException(status_code=404, detail="Absence non trouvée après mise à jour")
            
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Erreur interne du serveur: {str(e)}"
        )"""
    
@router.put("/absences/update/{absence_id}")
async def update_absence(
    absence_id: str, 
    update_data: AbsenceUpdate
):
    try:
        # Préparer les données de mise à jour
        update_fields = {
            "updated_at": datetime.now()
        }
        
        # Ajouter seulement les champs qui ont été fournis
        if update_data.status:
            update_fields["status"] = update_data.status
        if update_data.replacement_id is not None:
            update_fields["replacement_id"] = update_data.replacement_id
        
        result = absences.update_one(
            {"_id": ObjectId(absence_id)},
            {"$set": update_fields}
        )
        
        if result.modified_count == 0:
            raise HTTPException(status_code=404, detail="Absence non trouvée ou aucune modification")
        
        updated_absence = absences.find_one({"_id": ObjectId(absence_id)})
        return {
            "message": "Absence mise à jour avec succès",
            "data": {
                "id": str(updated_absence["_id"]),
                "status": updated_absence["status"],
                "matricule": updated_absence.get("matricule", ""),
                "updated_at": update_fields["updated_at"].isoformat()
            }
        }
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Erreur interne du serveur: {str(e)}"
        )
         
"""@router.get("/absences")
async def get_absences():
    try:
        absence_l = absences.find()
        absence_list = [
            {
                "id": str(absence["_id"]),
                "staff_id": absence["staff_id"],
                "start_date": absence["start_date"],
                "start_hour": absence["start_hour"],  # Add this field
                "end_date": absence["end_date"],
                "end_hour": absence["end_hour"],      # Add this field
                "reason": absence["reason"],
                "comment": absence["comment"],
                "replacement_id": absence["replacement_id"],
                "service_id": absence["service_id"],
                "status": absence["status"]
            } for absence in absence_l
        ]
        return {"message": "Absences retrieved successfully", "data": absence_list}
    except Exception as e:
        return HTTPException(status_code=500, detail=f"Internal Server Error: {str(e)}")"""
    
@router.get("/absences")
async def get_absences():
    try:
        absence_l = absences.find()
        absence_list = [
            {
                "id": str(absence["_id"]),
                "staff_id": absence["staff_id"],
                "start_date": absence["start_date"],
                "start_hour": absence["start_hour"],
                "end_date": absence["end_date"],
                "end_hour": absence["end_hour"],
                "reason": absence["reason"],
                "comment": absence["comment"],
                "replacement_id": absence["replacement_id"],
                "service_id": absence["service_id"],
                "absence_code_id": absence["absence_code_id"],
                "status": absence["status"],
                "matricule": absence.get("matricule", ""),
                "created_at": absence.get("created_at", "").isoformat() if absence.get("created_at") else "",
                "updated_at": absence.get("updated_at", "").isoformat() if absence.get("updated_at") else ""
            } for absence in absence_l
        ]
        return {"message": "Absences récupérées avec succès", "data": absence_list}
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Erreur interne du serveur: {str(e)}"
        )

@router.get("/absences/{absence_id}")
async def get_absence_by_id(absence_id: str):
    try:
        absence = absences.find_one({"_id": ObjectId(absence_id)})
        if absence:
            absence_details = {
                "id": str(absence["_id"]),
                "staff_id": absence["staff_id"],
                "start_date": absence["start_date"],
                "start_hour": absence["start_hour"],
                "end_date": absence["end_date"],
                "end_hour": absence["end_hour"],
                "reason": absence["reason"],
                "comment": absence["comment"],
                "replacement_id": absence["replacement_id"],
                "service_id": absence["service_id"],
                "absence_code_id": absence["absence_code_id"],
                "status": absence["status"],
                "matricule": absence.get("matricule", ""),
                "created_at": absence.get("created_at", "").isoformat() if absence.get("created_at") else "",
                "updated_at": absence.get("updated_at", "").isoformat() if absence.get("updated_at") else ""
            }
            return {"message": "Absence récupérée avec succès", "data": absence_details}
        else:
            raise HTTPException(status_code=404, detail="Absence non trouvée")
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Erreur interne du serveur: {str(e)}"
        )

"""@router.get("/absences/{absence_id}")
async def get_absence_by_id(absence_id: str):
    try:
        absence = absences.find_one({"_id": ObjectId(absence_id)})
        if absence:
            absence_details = {
                "id": str(absence["_id"]),
                "staff_id": absence["staff_id"],
                "start_date": absence["start_date"],
                "start_hour": absence["start_hour"],  # Add this field
                "end_date": absence["end_date"],
                "end_hour": absence["end_hour"],      # Add this field
                "reason": absence["reason"],
                "comment": absence["comment"],
                "replacement_id": absence["replacement_id"],
                "service_id": absence["service_id"],
                "status": absence["status"]
            }
            return {"message": "Absence retrieved successfully", "data": absence_details}
        else:
            return HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Absence non trouvé",
            )
    except Exception as e:
        return HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erreur interne du serveur: {str(e)}",
        )"""
    
@router.post("/absences/replace/{absence_id}")
async def set_replacement(absence_id: str, replacement_id: str):
    try:
        result = await assign_replacer_to_absence(absence_id, replacement_id)
        return result
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Error updating replacement: {str(e)}")


@router.post("/absences/set-replacement/{absence_id}/{replacement_id}")
async def set_replacement_by_id(absence_id: str, replacement_id: str):
    try:
        result = await assign_replacer_to_absence(absence_id, replacement_id)
        return result
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Error updating replacement: {str(e)}")



@router.post("/absences/check-availability/{absence_id}")
async def check_replacement_availability(absence_id: str):
    """
    Vérifie la disponibilité du remplaçant assigné à une absence
    en consultant son calendrier personnel à la date/heure de l'absence
    """
    try:
        from database.database import users, monthly_programs, code_meanings
        from datetime import datetime, timedelta
        
        # Récupérer l'absence
        absence = absences.find_one({"_id": ObjectId(absence_id)})
        if not absence:
            raise HTTPException(status_code=404, detail="Absence non trouvée")
        
        # Vérifier qu'un remplaçant est assigné
        replacement_id = absence.get("replacement_id")
        if not replacement_id:
            raise HTTPException(
                status_code=400, 
                detail="Aucun remplaçant assigné à cette absence"
            )
        
        # Récupérer le remplaçant
        replacement = users.find_one({"_id": ObjectId(replacement_id)})
        if not replacement:
            raise HTTPException(status_code=404, detail="Remplaçant non trouvé")
        
        replacement_name = f"{replacement.get('first_name', '')} {replacement.get('last_name', '')}".strip()
        
        # Extraire les dates et heures de l'absence
        start_date_str = absence.get("start_date")
        end_date_str = absence.get("end_date")
        start_hour = absence.get("start_hour", "")
        end_hour = absence.get("end_hour", "")
        
        # Parser les dates
        try:
            start = datetime.fromisoformat(start_date_str.replace('Z', '+00:00'))
            end = datetime.fromisoformat(end_date_str.replace('Z', '+00:00'))
        except:
            raise HTTPException(
                status_code=400,
                detail="Format de date invalide"
            )
        
        # Récupérer tous les code_meanings
        all_codes = list(code_meanings.find({}))
        
        # Codes indiquant une indisponibilité (repos, congés, etc.)
        unavailable_code_patterns = ['RC', 'RH', 'CA', 'CM', 'F', 'CP', 'RTT', 'MA', 'RTS', 'AAQ', 'AI']
        
        # Mapping des jours de la semaine en français
        day_mapping = {
            'Monday': 'L',
            'Tuesday': 'M',
            'Wednesday': 'M',
            'Thursday': 'J',
            'Friday': 'V',
            'Saturday': 'S',
            'Sunday': 'D'
        }
        
        # Vérifier la disponibilité pour chaque jour de l'absence
        unavailable_days = []
        available_days = []
        
        current_date = start
        while current_date <= end:
            month_name = current_date.strftime('%B')
            year = current_date.year
            day_num = current_date.day
            
            # Chercher le planning mensuel du remplaçant pour ce mois/année
            monthly_planning = monthly_programs.find_one({
                "name": replacement_name,
                "type": "monthly",
                "month": month_name,
                "year": year
            })
            
            if monthly_planning and "data" in monthly_planning:
                # Chercher les données du remplaçant dans le planning
                employee_data = None
                for entry in monthly_planning["data"]:
                    if entry.get("employee") == replacement_name:
                        employee_data = entry
                        break
                
                if employee_data and "days" in employee_data:
                    # Construire la clé du jour (ex: "L 05", "M 06", etc.)
                    day_of_week = day_mapping.get(current_date.strftime('%A'), '?')
                    day_key = f"{day_of_week} {day_num:02d}"
                    
                    code = employee_data["days"].get(day_key, "")
                    
                    if code and code.strip():
                        # Vérifier si le code indique une indisponibilité
                        is_unavailable = any(pattern in code for pattern in unavailable_code_patterns)
                        
                        # Chercher le meaning du code
                        code_meaning = next(
                            (c.get("meaning", code) for c in all_codes if c.get("code") == code),
                            code
                        )
                        
                        day_info = {
                            'date': current_date.strftime('%Y-%m-%d'),
                            'day': day_key,
                            'code': code,
                            'meaning': code_meaning
                        }
                        
                        if is_unavailable:
                            unavailable_days.append(day_info)
                        else:
                            available_days.append(day_info)
                    else:
                        # Pas de code trouvé pour ce jour - considéré comme disponible
                        available_days.append({
                            'date': current_date.strftime('%Y-%m-%d'),
                            'day': day_key,
                            'code': 'N/A',
                            'meaning': 'Pas de données'
                        })
                else:
                    # Pas de données pour ce remplaçant ce mois-ci
                    day_of_week = day_mapping.get(current_date.strftime('%A'), '?')
                    available_days.append({
                        'date': current_date.strftime('%Y-%m-%d'),
                        'day': f"{day_of_week} {day_num:02d}",
                        'code': 'N/A',
                        'meaning': 'Pas de planning pour ce mois'
                    })
            else:
                # Pas de planning mensuel trouvé pour ce mois/année
                day_of_week = day_mapping.get(current_date.strftime('%A'), '?')
                available_days.append({
                    'date': current_date.strftime('%Y-%m-%d'),
                    'day': f"{day_of_week} {day_num:02d}",
                    'code': 'N/A',
                    'meaning': 'Pas de planning disponible'
                })
            
            # Passer au jour suivant
            current_date += timedelta(days=1)
        
        # Déterminer la disponibilité globale
        is_available = len(unavailable_days) == 0
        
        return {
            "message": "Vérification de disponibilité effectuée",
            "available": is_available,
            "replacement_id": replacement_id,
            "replacement_name": replacement_name,
            "absence_period": {
                "start": start.strftime('%Y-%m-%d'),
                "end": end.strftime('%Y-%m-%d'),
                "start_hour": start_hour,
                "end_hour": end_hour,
                "total_days": len(available_days) + len(unavailable_days)
            },
            "availability_details": {
                "available_days": available_days,
                "unavailable_days": unavailable_days,
                "available_count": len(available_days),
                "unavailable_count": len(unavailable_days)
            },
            "recommendation": "Disponible pour remplacement" if is_available else "Non disponible - Conflits détectés dans le planning"
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Erreur lors de la vérification: {str(e)}"
        )

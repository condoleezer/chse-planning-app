from bson import ObjectId
from fastapi import APIRouter, HTTPException
from starlette import status

from database.database import annual_programs, monthly_programs, code_meanings

router = APIRouter()


# Route pour récupérer le planning annuel d'un agent par son nom
@router.get("/planning/annual/{agent_name}")
async def get_annual_planning(agent_name: str):
    """
    Récupère le planning annuel d'un agent de santé
    """
    try:
        planning = annual_programs.find_one({"name": agent_name, "type": "annual"})
        
        if planning:
            planning_details = {
                "id": str(planning["_id"]),
                "name": planning["name"],
                "type": planning["type"],
                "year": planning.get("year", 2026),
                "data": planning["data"]
            }
            return {
                "message": "Planning annuel récupéré avec succès",
                "data": planning_details
            }
        else:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Planning annuel non trouvé pour l'agent: {agent_name}"
            )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erreur interne du serveur: {str(e)}"
        )


# Route pour récupérer tous les plannings annuels
@router.get("/planning/annual")
async def get_all_annual_plannings():
    """
    Récupère tous les plannings annuels
    """
    try:
        plannings_cursor = annual_programs.find({"type": "annual"})
        plannings_list = []
        
        for planning in plannings_cursor:
            plannings_list.append({
                "id": str(planning["_id"]),
                "name": planning["name"],
                "type": planning["type"],
                "year": planning.get("year", 2026),
                "data": planning["data"]
            })
        
        return {
            "message": "Plannings annuels récupérés avec succès",
            "count": len(plannings_list),
            "data": plannings_list
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erreur interne du serveur: {str(e)}"
        )


# Route pour récupérer le planning mensuel d'un cadre par son nom
@router.get("/planning/monthly/{cadre_name}")
async def get_monthly_planning(cadre_name: str):
    """
    Récupère le planning mensuel d'un cadre de santé
    """
    try:
        planning = monthly_programs.find_one({"name": cadre_name, "type": "monthly"})
        
        if planning:
            planning_details = {
                "id": str(planning["_id"]),
                "name": planning["name"],
                "type": planning["type"],
                "month": planning.get("month", ""),
                "year": planning.get("year", 2026),
                "data": planning["data"]
            }
            return {
                "message": "Planning mensuel récupéré avec succès",
                "data": planning_details
            }
        else:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Planning mensuel non trouvé pour le cadre: {cadre_name}"
            )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erreur interne du serveur: {str(e)}"
        )


# Route pour récupérer tous les plannings mensuels
@router.get("/planning/monthly")
async def get_all_monthly_plannings():
    """
    Récupère tous les plannings mensuels
    """
    try:
        plannings_cursor = monthly_programs.find({"type": "monthly"})
        plannings_list = []
        
        for planning in plannings_cursor:
            plannings_list.append({
                "id": str(planning["_id"]),
                "name": planning["name"],
                "type": planning["type"],
                "month": planning.get("month", ""),
                "year": planning.get("year", 2026),
                "data": planning["data"]
            })
        
        return {
            "message": "Plannings mensuels récupérés avec succès",
            "count": len(plannings_list),
            "data": plannings_list
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erreur interne du serveur: {str(e)}"
        )


# Route pour récupérer les significations des codes
@router.get("/planning/codes")
async def get_code_meanings():
    """
    Récupère toutes les significations des codes de planning
    """
    try:
        codes_cursor = code_meanings.find()
        codes_list = []
        
        for code_doc in codes_cursor:
            if '_id' in code_doc:
                del code_doc['_id']
            codes_list.append(code_doc)
        
        return {
            "message": "Codes récupérés avec succès",
            "count": len(codes_list),
            "data": codes_list
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erreur interne du serveur: {str(e)}"
        )


# Route pour récupérer le planning d'un utilisateur connecté
@router.get("/planning/user/{user_id}")
async def get_user_planning(user_id: str):
    """
    Récupère le planning d'un utilisateur en fonction de son rôle
    - Si agent de santé: retourne le planning annuel
    - Si cadre: retourne le planning mensuel
    """
    try:
        from database.database import users
        
        # Récupérer l'utilisateur
        user = users.find_one({"_id": ObjectId(user_id)})
        
        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Utilisateur non trouvé"
            )
        
        user_name = f"{user.get('first_name', '')} {user.get('last_name', '')}".strip()
        user_role = user.get('role', '')
        
        # Déterminer le type de planning en fonction du rôle
        if 'cadre' in user_role.lower():
            # Récupérer le planning mensuel
            planning = monthly_programs.find_one({"name": user_name, "type": "monthly"})
            planning_type = "monthly"
        else:
            # Récupérer le planning annuel (agent de santé)
            planning = annual_programs.find_one({"name": user_name, "type": "annual"})
            planning_type = "annual"
        
        if planning:
            planning_details = {
                "id": str(planning["_id"]),
                "name": planning["name"],
                "type": planning["type"],
                "year": planning.get("year", 2026),
                "data": planning["data"]
            }
            
            if planning_type == "monthly":
                planning_details["month"] = planning.get("month", "")
            
            return {
                "message": f"Planning {planning_type} récupéré avec succès",
                "user_role": user_role,
                "data": planning_details
            }
        else:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Aucun planning trouvé pour {user_name}"
            )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erreur interne du serveur: {str(e)}"
        )

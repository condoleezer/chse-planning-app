from bson import ObjectId
from fastapi import HTTPException, APIRouter, Depends
from starlette import status

from database.database import db

router = APIRouter()

# Utiliser la collection 'role' (singulier) qui existe dans la base de données
role_collection = db['role']


# Route qui récupère tous les users de la base de donnée
@router.get("/roles")
async def get_roles():
    try:
        role_l = role_collection.find()
        roles_list = [
            {"id": str(role["_id"]), "name": role["name"],} for
            role in role_l]

        print(role_l)
        return {"message" : "Roles recupéré avec succès", "data": roles_list}
    except Exception as e:
        return HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erreur interne du serveur: {str(e)}",
        )

# Route qui récupère tous les utilisateurs en fonction de l'ID de la base de donnée
@router.get("/roles/{role_id}")
async def get_role_by_id(role_id: str):
    try:
        found_role = role_collection.find_one({"_id": ObjectId(role_id)})
        if found_role:
            role_details = {
                "id": str(found_role["_id"]),
                "name": found_role["name"],
            }
            return {"message" : "Roles recupéré avec succès", "data": role_details}
        else:
            return HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Role non trouvé",
            )
    except Exception as e:
        return HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erreur interne du serveur: {str(e)}",
        )

from bson import ObjectId
from fastapi import HTTPException
import random
import string
from datetime import datetime

from crud.jwt_config import create_token
from database.database import db, users, services


def get_user_by_email(email):
    user = db.users.find_one({"email": email})
    print(f"User found: {user}")
    return user

def generate_matricule(role: str) -> str:
    """Génère un matricule unique basé sur le rôle et un suffixe aléatoire"""
    prefix = {
        "admin": "ADM",
        "cadre": "CAD",
        "nurse": "INF"
    }.get(role.lower(), "USR")
    
    random_suffix = ''.join(random.choices(string.digits, k=6))
    random_letter = ''.join(random.choices(string.ascii_uppercase, k=4))
    return f"{prefix}{random_suffix}{random_letter}"

"""async def create_user(user_info):
    try:
        # Utilisez 'insert_one' sans 'await'
        db_response = users.insert_one(user_info)

        # Récupérez l'ID du document inséré
        user_id = db_response.inserted_id

        # Créer un token pour cet utilisateur
        token = create_token(str(user_id))

        print("Utilisateur créé avec succès")

        return {"message": "User registered successfully", "user_id": str(user_id), "token": token}

    except Exception as e:
        print(f"Erreur lors de la création de l'utilisateur : {str(e)}")
        raise HTTPException(status_code=500, detail=f"Internal Server Error: {str(e)}")"""
    
async def create_user(user_info: dict):
    try:
        # Vérifier si l'email existe déjà
        if users.find_one({"email": user_info["email"]}):
            raise HTTPException(status_code=400, detail="Email already exists")
        
        # Générer le matricule
        matricule = generate_matricule(user_info["role"])
        while users.find_one({"matricule": matricule}):
            matricule = generate_matricule(user_info["role"])
        
        # Ajouter les timestamps et le matricule
        now = datetime.now()
        user_info.update({
            "created_at": now,
            "updated_at": now,
            "matricule": matricule
        })
        
        # Insérer l'utilisateur
        db_response = users.insert_one(user_info)
        user_id = db_response.inserted_id
        
        # Créer un token
        token = create_token(str(user_id))
        
        # Si c'est un cadre, mettre à jour la tête du service
        if user_info.get("role") == "cadre" and user_info.get("service_id"):
            services.update_one({"_id": ObjectId(user_info["service_id"])}, {"$set": {"head": user_info["first_name"], "updated_at": now}})
        
        return {
            "message": "User registered successfully",
            "user_id": str(user_id),
            "token": token,
            "matricule": matricule
        }

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Internal Server Error: {str(e)}")


async def delete_user(user_id):
    try:
        # Utilisez 'insert_one' sans 'await'
        db_response = users.delete_one({"_id": ObjectId(user_id)})

        print("Utilisateur supprimé avec succès")

        return {"message": "Utilisateur supprimé avec succès", "user_id": str(user_id)}

    except Exception as e:
        print(f"Erreur lors de la création de l'utilisateur : {str(e)}")
        raise HTTPException(status_code=500, detail=f"Internal Server Error: {str(e)}")
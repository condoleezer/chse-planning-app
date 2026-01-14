from bson import ObjectId
from fastapi import HTTPException, APIRouter
from starlette import status
from crud.code import create_code, delete_code, update_code, generate_code_matricule
from database.database import codes
from schemas.serviceCreate import CodeCreate
from datetime import datetime
from fastapi import File, UploadFile
from utils.excel_utils import parse_excel

router = APIRouter()
       
@router.post("/codes/upload")
async def upload_codes(file: UploadFile = File(...)):
    try:
        data = await parse_excel(file)
        inserted_ids = []
        for item in data:
            code_data = {
                "name": item.get("name"),
                "localisation": item.get("localisation", ""),
                "description": item.get("description", ""),
                "matricule": item.get("matricule", generate_code_matricule),
                "created_at": datetime.now(),
                "updated_at": datetime.now()
            }
            result = await codes.insert_one(code_data)
            inserted_ids.append(str(result.inserted_id))
        
        return {"message": f"{len(inserted_ids)} chambres créées avec succès", "data": inserted_ids}
    except Exception as e:
        raise HTTPException(
            status_code=400,
            detail=f"Erreur lors de l'upload du fichier: {str(e)}"
        )
    
@router.post("/codes/create")
async def register(code_info: CodeCreate):
    try:
        code_data = {
            "name": code_info.name,
            "name_abrege": code_info.name_abrege,
            "regroupement": code_info.regroupement,
            "indicator": code_info.indicator,
            "begin_date": code_info.begin_date,
            "end_date": code_info.end_date,
        }
        
        result = await create_code(code_data)
        return {
            "message": "code créé avec succès",
            "data": {
                "id": result["code_id"],
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

@router.delete("/codes/delete/{code_id}")
async def delete(code_id: str):
    try:
        result = await delete_code(code_id)
        return {"message": "code supprimé avec succès", "data": result}
    except Exception as e:
        return HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erreur interne du serveur: {str(e)}",
        )

@router.get("/codes")
async def get_codes():
    try:
        code_l = codes.find()
        code_list = [
            {
                "id": str(code["_id"]),
                "name": code["name"],
                "name_abrege": code["name_abrege"],
                "regroupement": code["regroupement"],
                "indicator": code["indicator"],
                "begin_date": code["begin_date"],
                "end_date": code["end_date"],
                "matricule": code.get("matricule", ""),
                "created_at": code.get("created_at", "").isoformat() if code.get("created_at") else "",
                "updated_at": code.get("updated_at", "").isoformat() if code.get("updated_at") else ""
            } for code in code_l
        ]
        return {"message": "codes récupérés avec succès", "data": code_list}
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Erreur interne du serveur: {str(e)}"
        )

@router.get("/codes/{code_id}")
async def get_code_by_id(code_id: str):
    try:
        code = codes.find_one({"_id": ObjectId(code_id)})
        if code:
            code_details = {
                "id": str(code["_id"]),
                "name": code["name"],
                "name_abrege": code["name_abrege"],
                "regroupement": code["regroupement"],
                "indicator": code["indicator"],
                "begin_date": code["begin_date"],
                "end_date": code["end_date"],
                "matricule": code.get("matricule", ""),
                "created_at": code.get("created_at", "").isoformat() if code.get("created_at") else "",
                "updated_at": code.get("updated_at", "").isoformat() if code.get("updated_at") else ""
            }
            return {"message": "code récupéré avec succès", "data": code_details}
        else:
            raise HTTPException(status_code=404, detail="code non trouvé")
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Erreur interne du serveur: {str(e)}"
        )
    
@router.put("/codes/update/{code_id}")
async def update_code(code_id: str, code_info: CodeCreate):
    try:
        code_data = {
            "name": code_info.name,
            "name_abrege": code_info.name_abrege,
            "regroupement": code_info.regroupement,
            "indicator": code_info.indicator,
            "begin_date": code_info.begin_date,
            "end_date": code_info.end_date,
            "updated_at": datetime.now()
        }
        
        result = codes.update_one(
            {"_id": ObjectId(code_id)},
            {"$set": code_data}
        )
        
        if result.modified_count == 1:
            updated_code = codes.find_one({"_id": ObjectId(code_id)})
            return {
                "message": "code mis à jour avec succès",
                "data": {
                    "id": str(updated_code["_id"]),
                    "name": updated_code["name"],
                    "name_abrege": updated_code["name_abrege"],
                    "regroupement": updated_code["regroupement"],
                    "indicator": updated_code["indicator"],
                    "begin_date": updated_code["begin_date"],
                    "end_date": updated_code["end_date"],
                    "matricule": updated_code.get("matricule", ""),
                    "updated_at": code_data["updated_at"].isoformat()
                }
            }
        else:
            raise HTTPException(status_code=404, detail="code non trouvé")
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Erreur interne du serveur: {str(e)}"
        )
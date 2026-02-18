import os
from pymongo import MongoClient

# Récupère l'URI MongoDB depuis les variables d'environnement
MONGO_URI = os.getenv("MONGODB_URI", "mongodb://localhost:27017")
MONGO_DB = os.getenv("MONGO_DB", "planRH")

# Connexion à MongoDB
client = MongoClient(MONGO_URI)
db = client[MONGO_DB]

# Collections MongoDB
users = db["users"]
roles = db["roles"]
role = db["roles"]
services = db["services"]
absences = db["absences"]
programs = db["programs"]
annual_programs = db["annual_programs"]
asks = db["asks"]
codes = db["codes"]
code_meanings = db["code_meanings"]
contrats = db["contrats"]
user_contrat = db["user_contrat"]
specialities = db["specialities"]
speciality = db["specialities"]
sessions = db["sessions"]
import os
from pymongo import MongoClient

# Configure Mongo via environment for container/production flexibility
MONGO_URI = os.getenv("MONGO_URI", "mongodb://localhost:27017")
MONGO_DB = os.getenv("MONGO_DB", "planRH")

client = MongoClient(MONGO_URI)
db = client[MONGO_DB]
programs = db["annual_programs"]
users = db["users"]
services = db["services"]
absences = db["absences"]
speciality = db["speciality"]
roles = db["role"]
codes = db["code_meanings"]
asks = db["asks"]
user_contrat = db["user_contrat"]

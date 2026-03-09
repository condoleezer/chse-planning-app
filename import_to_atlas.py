"""
Script pour importer les fichiers JSON exportés vers MongoDB Atlas
"""
import json
import sys
from pymongo import MongoClient

# Configuration
MONGODB_URI = "mongodb+srv://madaveisabelle_db_user:Madave14@cluster0.uqvmy3o.mongodb.net/planRH"
MONGO_DB = "planRH"
EXPORT_DIR = "mongodb_export_plannings"

print("=" * 70)
print("IMPORT DES PLANNINGS VERS MONGODB ATLAS")
print("=" * 70)
print()

# Connexion à MongoDB Atlas
print("Connexion à MongoDB Atlas...")
try:
    client = MongoClient(MONGODB_URI, serverSelectionTimeoutMS=30000)
    db = client[MONGO_DB]
    # Tester la connexion
    client.server_info()
    print("✅ Connexion réussie!")
except Exception as e:
    print(f"❌ Erreur de connexion: {e}")
    print("\nSi le problème persiste, utilise l'interface web MongoDB Atlas:")
    print("1. Va sur cloud.mongodb.com")
    print("2. Browse Collections → Insert Document → Import JSON")
    sys.exit(1)

print()

# Importer les plannings annuels
print("📅 Import des plannings annuels...")
try:
    with open(f"{EXPORT_DIR}/annual_programs.json", 'r', encoding='utf-8') as f:
        annual_data = json.load(f)
    
    # Supprimer les anciens documents s'ils existent
    db.annual_programs.delete_many({})
    
    # Insérer les nouveaux
    if annual_data:
        # Retirer les _id pour laisser MongoDB les générer
        for item in annual_data:
            if '_id' in item:
                del item['_id']
        result = db.annual_programs.insert_many(annual_data)
        print(f"   ✅ {len(result.inserted_ids)} plannings annuels importés")
    else:
        print("   ⚠️ Aucune donnée à importer")
except Exception as e:
    print(f"   ❌ Erreur: {e}")

# Importer les plannings mensuels
print("\n📅 Import des plannings mensuels...")
try:
    with open(f"{EXPORT_DIR}/monthly_programs.json", 'r', encoding='utf-8') as f:
        monthly_data = json.load(f)
    
    # Supprimer les anciens documents
    db.monthly_programs.delete_many({})
    
    # Insérer les nouveaux
    if monthly_data:
        for item in monthly_data:
            if '_id' in item:
                del item['_id']
        result = db.monthly_programs.insert_many(monthly_data)
        print(f"   ✅ {len(result.inserted_ids)} plannings mensuels importés")
    else:
        print("   ⚠️ Aucune donnée à importer")
except Exception as e:
    print(f"   ❌ Erreur: {e}")

# Importer les codes
print("\n📋 Import des codes...")
try:
    with open(f"{EXPORT_DIR}/code_meanings.json", 'r', encoding='utf-8') as f:
        codes_data = json.load(f)
    
    # Supprimer les anciens documents
    db.code_meanings.delete_many({})
    
    # Insérer les nouveaux
    if codes_data:
        for item in codes_data:
            if '_id' in item:
                del item['_id']
        result = db.code_meanings.insert_many(codes_data)
        print(f"   ✅ {len(result.inserted_ids)} codes importés")
    else:
        print("   ⚠️ Aucune donnée à importer")
except Exception as e:
    print(f"   ❌ Erreur: {e}")

client.close()

print("\n" + "=" * 70)
print("✅ IMPORT TERMINÉ!")
print("=" * 70)
print()
print("Vérification:")
print("1. Va sur MongoDB Atlas (cloud.mongodb.com)")
print("2. Clique sur 'Browse Collections'")
print("3. Vérifie les collections:")
print("   - annual_programs")
print("   - monthly_programs")
print("   - code_meanings")
print()
print("Ton application sur Render devrait maintenant afficher les plannings!")

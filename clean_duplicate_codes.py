"""
Script pour nettoyer les codes d'absence en doublon dans MongoDB Atlas
"""
from pymongo import MongoClient

# Configuration
MONGODB_URI = "mongodb+srv://madaveisabelle_db_user:Madave14@cluster0.uqvmy3o.mongodb.net/planRH"
MONGO_DB = "planRH"

print("=" * 70)
print("NETTOYAGE DES CODES EN DOUBLON")
print("=" * 70)
print()

# Connexion à MongoDB Atlas
print("Connexion à MongoDB Atlas...")
try:
    client = MongoClient(MONGODB_URI, serverSelectionTimeoutMS=30000)
    db = client[MONGO_DB]
    client.server_info()
    print("✅ Connexion réussie!")
except Exception as e:
    print(f"❌ Erreur de connexion: {e}")
    exit(1)

print()

# Récupérer tous les codes
codes_collection = db.code_meanings
all_codes = list(codes_collection.find())

print(f"📊 Total de codes trouvés: {len(all_codes)}")
print()

# Identifier les doublons basés sur name_abrege
seen = {}
duplicates = []

for code in all_codes:
    # Vérifier uniquement les codes d'absence (avec name et name_abrege)
    if "name" in code and "name_abrege" in code:
        key = code["name_abrege"]
        if key in seen:
            duplicates.append(code["_id"])
            print(f"⚠️ Doublon trouvé: {code['name_abrege']} - {code['name']}")
        else:
            seen[key] = code["_id"]

print()

if duplicates:
    print(f"🗑️ {len(duplicates)} doublons à supprimer")
    confirm = input("Voulez-vous supprimer ces doublons? (oui/non): ")
    
    if confirm.lower() in ['oui', 'o', 'yes', 'y']:
        result = codes_collection.delete_many({"_id": {"$in": duplicates}})
        print(f"✅ {result.deleted_count} doublons supprimés")
    else:
        print("❌ Annulé")
else:
    print("✅ Aucun doublon trouvé!")

client.close()

print()
print("=" * 70)
print("TERMINÉ!")
print("=" * 70)

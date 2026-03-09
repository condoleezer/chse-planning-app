"""
Script pour synchroniser les codes d'absence de la base locale vers Atlas
"""
import json
from pymongo import MongoClient

# Configuration
LOCAL_URI = "mongodb://localhost:27017/"
ATLAS_URI = "mongodb+srv://madaveisabelle_db_user:Madave14@cluster0.uqvmy3o.mongodb.net/planRH"
DB_NAME = "planRH"

print("=" * 70)
print("SYNCHRONISATION DES CODES D'ABSENCE")
print("=" * 70)
print()

# Connexion à la base locale
print("📂 Connexion à la base locale...")
try:
    local_client = MongoClient(LOCAL_URI, serverSelectionTimeoutMS=5000)
    local_db = local_client[DB_NAME]
    local_client.server_info()
    print("✅ Connexion locale réussie!")
except Exception as e:
    print(f"❌ Erreur connexion locale: {e}")
    exit(1)

# Récupérer uniquement les codes d'absence (avec name et name_abrege)
print("\n📋 Récupération des codes d'absence...")
absence_codes = list(local_db.code_meanings.find({
    "name": {"$exists": True},
    "name_abrege": {"$exists": True}
}))

print(f"✅ {len(absence_codes)} codes d'absence trouvés:")
for code in absence_codes:
    print(f"   - {code.get('name_abrege')}: {code.get('name')}")

# Sauvegarder dans un fichier JSON
print("\n💾 Sauvegarde dans absence_codes.json...")
# Retirer les _id pour laisser MongoDB les générer
for code in absence_codes:
    if '_id' in code:
        del code['_id']

with open('absence_codes.json', 'w', encoding='utf-8') as f:
    json.dump(absence_codes, f, indent=2, ensure_ascii=False, default=str)

print("✅ Fichier absence_codes.json créé")

# Connexion à Atlas
print("\n☁️ Connexion à MongoDB Atlas...")
try:
    atlas_client = MongoClient(ATLAS_URI, serverSelectionTimeoutMS=30000)
    atlas_db = atlas_client[DB_NAME]
    atlas_client.server_info()
    print("✅ Connexion Atlas réussie!")
except Exception as e:
    print(f"❌ Erreur connexion Atlas: {e}")
    print("\n💡 Tu peux importer manuellement le fichier absence_codes.json")
    print("   depuis l'interface MongoDB Atlas:")
    print("   1. Va sur cloud.mongodb.com")
    print("   2. Browse Collections → code_meanings")
    print("   3. Supprime les codes horaires")
    print("   4. Insert Document → Import JSON → absence_codes.json")
    local_client.close()
    exit(1)

# Supprimer tous les codes existants dans Atlas
print("\n🗑️ Suppression des codes existants dans Atlas...")
result = atlas_db.code_meanings.delete_many({})
print(f"✅ {result.deleted_count} codes supprimés")

# Importer les codes d'absence
print("\n📤 Import des codes d'absence dans Atlas...")
if absence_codes:
    result = atlas_db.code_meanings.insert_many(absence_codes)
    print(f"✅ {len(result.inserted_ids)} codes importés")
else:
    print("⚠️ Aucun code à importer")

# Vérification
print("\n🔍 Vérification...")
atlas_count = atlas_db.code_meanings.count_documents({})
print(f"✅ Total de codes dans Atlas: {atlas_count}")

local_client.close()
atlas_client.close()

print("\n" + "=" * 70)
print("✅ SYNCHRONISATION TERMINÉE!")
print("=" * 70)
print("\nLes codes d'absence ont été synchronisés avec succès.")
print("Ton application devrait maintenant afficher uniquement les codes d'absence.")

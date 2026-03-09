"""
Script pour supprimer les codes horaires de la collection code_meanings
et garder uniquement les codes d'absence
"""
from pymongo import MongoClient

# Configuration
MONGODB_URI = "mongodb+srv://madaveisabelle_db_user:Madave14@cluster0.uqvmy3o.mongodb.net/planRH"
MONGO_DB = "planRH"

print("=" * 70)
print("NETTOYAGE DES CODES HORAIRES")
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

# Identifier les codes horaires (format code/meaning)
horaire_codes = []
absence_codes = []

for code in all_codes:
    if "code" in code and "meaning" in code and "name" not in code:
        # C'est un code horaire
        horaire_codes.append(code)
        print(f"🗑️ Code horaire à supprimer: {code['code']} - {code['meaning']}")
    elif "name" in code and "name_abrege" in code:
        # C'est un code d'absence
        absence_codes.append(code)
        print(f"✅ Code d'absence à garder: {code['name_abrege']} - {code['name']}")

print()
print(f"📋 Codes d'absence: {len(absence_codes)}")
print(f"🗑️ Codes horaires: {len(horaire_codes)}")
print()

if horaire_codes:
    confirm = input("Voulez-vous supprimer les codes horaires? (oui/non): ")
    
    if confirm.lower() in ['oui', 'o', 'yes', 'y']:
        # Supprimer tous les documents qui ont "code" et "meaning" mais pas "name"
        result = codes_collection.delete_many({
            "code": {"$exists": True},
            "meaning": {"$exists": True},
            "name": {"$exists": False}
        })
        print(f"✅ {result.deleted_count} codes horaires supprimés")
        print(f"✅ {len(absence_codes)} codes d'absence conservés")
    else:
        print("❌ Annulé")
else:
    print("✅ Aucun code horaire trouvé!")

client.close()

print()
print("=" * 70)
print("TERMINÉ!")
print("=" * 70)
print()
print("La collection code_meanings contient maintenant uniquement les codes d'absence.")

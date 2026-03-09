"""
Script pour exporter les plannings depuis la base locale vers des fichiers JSON
Ces fichiers pourront ensuite être importés dans MongoDB Atlas via l'interface web
"""
import json
import sys
import os
from datetime import datetime
from bson import ObjectId

sys.path.insert(0, 'PlanRHAPI')

from database.database import annual_programs, monthly_programs, code_meanings

def convert_to_json_serializable(obj):
    """Convertir les objets MongoDB en format JSON"""
    if isinstance(obj, ObjectId):
        return str(obj)
    if isinstance(obj, datetime):
        return obj.isoformat()
    if isinstance(obj, dict):
        return {k: convert_to_json_serializable(v) for k, v in obj.items()}
    if isinstance(obj, list):
        return [convert_to_json_serializable(item) for item in obj]
    return obj

print("=" * 60)
print("EXPORT DES PLANNINGS VERS JSON")
print("=" * 60)
print()

# Créer un dossier pour les exports
export_dir = "mongodb_export_plannings"
if not os.path.exists(export_dir):
    os.makedirs(export_dir)
    print(f"✅ Dossier créé: {export_dir}")

# Exporter les plannings annuels
print("\n📅 Export des plannings annuels...")
annual_list = list(annual_programs.find())
annual_list = convert_to_json_serializable(annual_list)

with open(f"{export_dir}/annual_programs.json", 'w', encoding='utf-8') as f:
    json.dump(annual_list, f, ensure_ascii=False, indent=2)
print(f"   ✅ {len(annual_list)} plannings annuels exportés")

# Exporter les plannings mensuels
print("\n📅 Export des plannings mensuels...")
monthly_list = list(monthly_programs.find())
monthly_list = convert_to_json_serializable(monthly_list)

with open(f"{export_dir}/monthly_programs.json", 'w', encoding='utf-8') as f:
    json.dump(monthly_list, f, ensure_ascii=False, indent=2)
print(f"   ✅ {len(monthly_list)} plannings mensuels exportés")

# Exporter les codes
print("\n📋 Export des codes...")
codes_list = list(code_meanings.find())
codes_list = convert_to_json_serializable(codes_list)

with open(f"{export_dir}/code_meanings.json", 'w', encoding='utf-8') as f:
    json.dump(codes_list, f, ensure_ascii=False, indent=2)
print(f"   ✅ {len(codes_list)} codes exportés")

print("\n" + "=" * 60)
print("✅ EXPORT TERMINÉ!")
print("=" * 60)
print()
print(f"Les fichiers JSON sont dans le dossier: {export_dir}/")
print()
print("PROCHAINES ÉTAPES:")
print("1. Va sur MongoDB Atlas (cloud.mongodb.com)")
print("2. Clique sur 'Browse Collections'")
print("3. Pour chaque collection (annual_programs, monthly_programs, code_meanings):")
print("   - Clique sur 'Insert Document'")
print("   - Clique sur le bouton {} et choisis 'Import JSON'")
print("   - Sélectionne le fichier JSON correspondant")
print("   - Clique sur 'Insert'")
print()
print("Ou utilise mongoimport en ligne de commande:")
print(f"mongoimport --uri 'VOTRE_URI' --collection annual_programs --file {export_dir}/annual_programs.json --jsonArray")
print(f"mongoimport --uri 'VOTRE_URI' --collection monthly_programs --file {export_dir}/monthly_programs.json --jsonArray")
print(f"mongoimport --uri 'VOTRE_URI' --collection code_meanings --file {export_dir}/code_meanings.json --jsonArray")

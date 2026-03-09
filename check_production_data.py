import sys
import os
sys.path.insert(0, 'PlanRHAPI')

# Utiliser les variables d'environnement de production
os.environ['MONGODB_URI'] = 'mongodb+srv://votre_uri_atlas'  # À remplacer
os.environ['MONGO_DB'] = 'planRH'

from database.database import annual_programs, monthly_programs, users

print("Vérification des données de production\n")
print("=" * 60)

# Vérifier les utilisateurs
users_count = users.count_documents({})
print(f"Utilisateurs: {users_count}")

# Vérifier les plannings annuels
annual_count = annual_programs.count_documents({})
print(f"Plannings annuels: {annual_count}")

if annual_count > 0:
    print("\nExemples de plannings annuels:")
    for planning in annual_programs.find().limit(3):
        print(f"  - {planning.get('name')} ({planning.get('type')})")

# Vérifier les plannings mensuels
monthly_count = monthly_programs.count_documents({})
print(f"\nPlannings mensuels: {monthly_count}")

if monthly_count > 0:
    print("\nExemples de plannings mensuels:")
    for planning in monthly_programs.find().limit(3):
        print(f"  - {planning.get('name')} ({planning.get('type')})")

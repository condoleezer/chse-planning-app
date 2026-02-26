"""
Script pour insérer les plannings CHSE dans MongoDB Atlas (production)
Utilise les variables d'environnement pour se connecter à la base de production
"""
import os
import sys

# Définir les variables d'environnement pour la production
# IMPORTANT: Remplacer par votre URI MongoDB Atlas
PRODUCTION_MONGODB_URI = os.getenv("MONGODB_URI", "mongodb://localhost:27017")
PRODUCTION_MONGO_DB = os.getenv("MONGO_DB", "planRH")

print(f"Connexion à: {PRODUCTION_MONGO_DB}")
print(f"URI: {PRODUCTION_MONGODB_URI[:30]}...")

# Importer le script d'extraction
from extract_chse import main

# Exécuter l'extraction et l'insertion
if __name__ == "__main__":
    print("\n" + "=" * 60)
    print("INSERTION DES PLANNINGS DANS LA BASE DE PRODUCTION")
    print("=" * 60)
    
    # Vérifier que les fichiers Excel existent
    import os
    if not os.path.exists('CHSE_agent annuel.xlsx'):
        print("❌ Fichier CHSE_agent annuel.xlsx non trouvé")
        print("   Assurez-vous que les fichiers Excel sont dans le même dossier")
        sys.exit(1)
    
    if not os.path.exists('CHSE_Cadre mensuel.xlsx'):
        print("❌ Fichier CHSE_Cadre mensuel.xlsx non trouvé")
        print("   Assurez-vous que les fichiers Excel sont dans le même dossier")
        sys.exit(1)
    
    # Lancer l'extraction
    main()
    
    print("\n✅ Insertion terminée!")
    print("Vérifiez votre base MongoDB Atlas pour confirmer")

"""
Script pour uploader les plannings CHSE vers MongoDB Atlas (production)
Ce script lit les fichiers Excel locaux et les insère dans votre base Atlas
"""
import os
import sys
from getpass import getpass

def main():
    print("=" * 70)
    print("UPLOAD DES PLANNINGS CHSE VERS MONGODB ATLAS")
    print("=" * 70)
    print()
    
    # Demander l'URI MongoDB Atlas
    print("Entrez votre URI MongoDB Atlas:")
    print("Format: mongodb+srv://username:password@cluster.mongodb.net/")
    print()
    mongodb_uri = input("URI MongoDB Atlas: ").strip()
    
    if not mongodb_uri:
        print("❌ URI vide. Abandon.")
        sys.exit(1)
    
    # Demander le nom de la base de données
    db_name = input("Nom de la base de données (défaut: planRH): ").strip()
    if not db_name:
        db_name = "planRH"
    
    print()
    print(f"Configuration:")
    print(f"  - Base de données: {db_name}")
    print(f"  - URI: {mongodb_uri[:30]}...")
    print()
    
    # Confirmer
    confirm = input("Continuer? (oui/non): ").strip().lower()
    if confirm not in ['oui', 'o', 'yes', 'y']:
        print("❌ Annulé par l'utilisateur")
        sys.exit(0)
    
    # Définir les variables d'environnement
    os.environ['MONGODB_URI'] = mongodb_uri
    os.environ['MONGO_DB'] = db_name
    
    # Vérifier que les fichiers Excel existent
    print()
    print("Vérification des fichiers Excel...")
    
    annual_file = 'CHSE_agent annuel.xlsx'
    monthly_file = 'CHSE_Cadre mensuel.xlsx'
    
    if not os.path.exists(annual_file):
        print(f"❌ Fichier non trouvé: {annual_file}")
        print("   Assurez-vous que le fichier est dans le même dossier que ce script")
        sys.exit(1)
    else:
        print(f"✅ Trouvé: {annual_file}")
    
    if not os.path.exists(monthly_file):
        print(f"❌ Fichier non trouvé: {monthly_file}")
        print("   Assurez-vous que le fichier est dans le même dossier que ce script")
        sys.exit(1)
    else:
        print(f"✅ Trouvé: {monthly_file}")
    
    print()
    print("Connexion à MongoDB Atlas...")
    
    # Tester la connexion
    try:
        from pymongo import MongoClient
        client = MongoClient(mongodb_uri, serverSelectionTimeoutMS=5000)
        # Tester la connexion
        client.server_info()
        print("✅ Connexion réussie à MongoDB Atlas")
        client.close()
    except Exception as e:
        print(f"❌ Erreur de connexion: {e}")
        print()
        print("Vérifiez:")
        print("  1. Que votre URI est correcte")
        print("  2. Que votre IP est autorisée dans MongoDB Atlas (Network Access)")
        print("  3. Que vos identifiants sont corrects")
        sys.exit(1)
    
    print()
    print("Lancement de l'extraction et de l'upload...")
    print()
    
    # Importer et exécuter le script d'extraction
    sys.path.insert(0, 'PlanRHAPI')
    from extract_chse import main as extract_main
    
    try:
        extract_main()
        print()
        print("=" * 70)
        print("✅ UPLOAD TERMINÉ AVEC SUCCÈS!")
        print("=" * 70)
        print()
        print("Les plannings ont été uploadés dans MongoDB Atlas.")
        print("Vous pouvez maintenant vérifier dans votre interface MongoDB Atlas.")
        print()
        print("Prochaines étapes:")
        print("  1. Vérifiez les collections 'annual_programs' et 'monthly_programs'")
        print("  2. Redémarrez votre application sur Render si nécessaire")
        print("  3. Testez l'affichage des calendriers dans l'application")
        
    except Exception as e:
        print()
        print("=" * 70)
        print("❌ ERREUR LORS DE L'UPLOAD")
        print("=" * 70)
        print(f"Erreur: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)


if __name__ == "__main__":
    try:
        main()
    except KeyboardInterrupt:
        print()
        print("❌ Interrompu par l'utilisateur")
        sys.exit(1)

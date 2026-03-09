# Instructions pour uploader les plannings vers MongoDB Atlas

## Prérequis

1. Python 3.x installé
2. Les dépendances installées : `pip install pymongo pandas openpyxl`
3. Les fichiers Excel dans le dossier racine :
   - `CHSE_agent annuel.xlsx`
   - `CHSE_Cadre mensuel.xlsx`
4. Votre URI MongoDB Atlas

## Étapes

### 1. Récupérer votre URI MongoDB Atlas

1. Connectez-vous à [MongoDB Atlas](https://cloud.mongodb.com/)
2. Cliquez sur "Connect" sur votre cluster
3. Choisissez "Connect your application"
4. Copiez l'URI (format: `mongodb+srv://username:password@cluster.mongodb.net/`)
5. Remplacez `<password>` par votre mot de passe réel

### 2. Autoriser votre IP

1. Dans MongoDB Atlas, allez dans "Network Access"
2. Cliquez sur "Add IP Address"
3. Ajoutez votre IP actuelle ou "Allow Access from Anywhere" (0.0.0.0/0) pour les tests

### 3. Exécuter le script d'upload

```bash
python upload_to_atlas.py
```

Le script vous demandera :
- Votre URI MongoDB Atlas
- Le nom de la base de données (défaut: planRH)

### 4. Vérifier l'upload

1. Retournez dans MongoDB Atlas
2. Cliquez sur "Browse Collections"
3. Vérifiez que les collections suivantes existent :
   - `annual_programs` (plannings annuels des agents)
   - `monthly_programs` (plannings mensuels des cadres)
   - `code_meanings` (significations des codes)

### 5. Redémarrer l'application

Si votre application est déjà déployée sur Render, elle devrait automatiquement utiliser les nouvelles données.

## Dépannage

### Erreur de connexion

Si vous obtenez une erreur de connexion :
- Vérifiez que votre IP est autorisée dans "Network Access"
- Vérifiez que votre mot de passe ne contient pas de caractères spéciaux non encodés
- Essayez d'encoder les caractères spéciaux dans l'URI

### Fichiers Excel non trouvés

Assurez-vous que les fichiers Excel sont dans le même dossier que le script `upload_to_atlas.py`

### Erreur d'import

Si vous obtenez une erreur d'import, installez les dépendances :
```bash
pip install pymongo pandas openpyxl
```

## Résultat attendu

Après l'exécution réussie, vous devriez voir :
- 8 plannings annuels créés (un par agent de santé)
- 3 plannings mensuels créés (un par cadre)
- Les codes de planning insérés

## Support

En cas de problème, vérifiez :
1. Les logs du script
2. Les collections dans MongoDB Atlas
3. Les variables d'environnement sur Render

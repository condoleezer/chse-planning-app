Déploiement - Option Docker Compose

1) Prérequis sur le serveur (Ubuntu 22.04+ recommandé)
   - Docker & docker-compose
   - Un domaine pointant sur l'IP du serveur (ex: chseplanifrhia.fr)

2) Copier le repo sur le serveur
   git clone <votre-repo>

3) Construire et démarrer
   cd <repo-root>
   sudo docker-compose build --pull
   sudo docker-compose up -d

4) TLS / HTTPS
   - Option A (simple) : utilisez un reverse-proxy sur l'hôte pour récupérer les certificats LetsEncrypt et proxy_pass vers le conteneur frontend.
   - Option B (conteneurisé) : utilisez jwilder/nginx-proxy + companion pour automatiser l'emission de certificats.

5) Variables sensibles
   - Ne pas stocker de secrets dans le dépôt. Utilisez un fichier `.env` et `env_file` dans docker-compose, ou Docker secrets.

6) Debug
   - Logs backend: sudo docker logs -f planrh_backend
   - Logs frontend: sudo docker logs -f planrh_frontend

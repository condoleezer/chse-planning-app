#!/bin/bash
# ============================================================
#  Obtenir le certificat SSL Let's Encrypt pour chseplanifrhia.fr
#  À lancer UNE SEULE FOIS après que le DNS pointe vers le VPS
#  Usage : bash init-ssl.sh
# ============================================================
set -e

DOMAIN="chseplanifrhia.fr"
EMAIL="ton-email@example.com"   # ← remplace par ton vrai email
APP_DIR="/opt/planrh"

echo "=============================="
echo " Init SSL - $DOMAIN"
echo "=============================="

# Crée les dossiers nécessaires
mkdir -p "$APP_DIR/nginx/certbot/conf"
mkdir -p "$APP_DIR/nginx/certbot/www"

# Vérifie que le DNS pointe bien vers ce serveur
echo "[1/3] Vérification DNS..."
RESOLVED=$(dig +short "$DOMAIN" | tail -1)
SERVER_IP=$(curl -s https://api.ipify.org)
if [ "$RESOLVED" != "$SERVER_IP" ]; then
    echo "  ATTENTION : $DOMAIN pointe vers $RESOLVED"
    echo "  mais l'IP de ce serveur est $SERVER_IP"
    echo "  Attends que le DNS se propage (jusqu'à 24h) avant de continuer."
    read -p "  Continuer quand même ? (o/N) " confirm
    [[ "$confirm" != "o" && "$confirm" != "O" ]] && exit 1
fi

# Lance nginx temporaire pour le challenge ACME
echo "[2/3] Démarrage Nginx temporaire pour le challenge ACME..."
docker run --rm -d \
    --name certbot_nginx_tmp \
    -p 80:80 \
    -v "$APP_DIR/nginx/certbot/www:/var/www/certbot" \
    nginx:stable-alpine \
    sh -c 'mkdir -p /var/www/certbot && nginx -g "daemon off;"'
sleep 3

# Obtention du certificat
echo "[3/3] Obtention du certificat SSL..."
docker run --rm \
    -v "$APP_DIR/nginx/certbot/conf:/etc/letsencrypt" \
    -v "$APP_DIR/nginx/certbot/www:/var/www/certbot" \
    certbot/certbot certonly --webroot \
    --webroot-path=/var/www/certbot \
    --email "$EMAIL" \
    --agree-tos \
    --no-eff-email \
    -d "$DOMAIN" -d "www.$DOMAIN"

docker stop certbot_nginx_tmp 2>/dev/null || true

echo ""
echo "=============================="
echo " Certificat SSL obtenu !"
echo " Lance maintenant : docker-compose up -d --build"
echo "=============================="

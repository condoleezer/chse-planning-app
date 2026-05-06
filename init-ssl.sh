#!/bin/bash
# ============================================================
#  Obtenir le certificat SSL Let's Encrypt pour chseplanifrhia.fr
#  À lancer UNE SEULE FOIS après que le DNS pointe vers le VPS
#  Usage : bash init-ssl.sh
# ============================================================
set -e

DOMAIN="chseplanifrhia.fr"
EMAIL="madaveisabelle@gmail.com"
APP_DIR="/opt/planrh"

echo "=============================="
echo " Init SSL - $DOMAIN"
echo "=============================="

# Crée les dossiers nécessaires
mkdir -p "$APP_DIR/nginx/certbot/conf"
mkdir -p "$APP_DIR/nginx/certbot/www/.well-known/acme-challenge"

# Arrête tout ce qui tourne sur le port 80
echo "[1/3] Libération du port 80..."
systemctl stop nginx 2>/dev/null || true
docker stop certbot_nginx_tmp 2>/dev/null || true
sleep 2

# Lance nginx avec le bon montage du dossier webroot
echo "[2/3] Démarrage Nginx temporaire..."
docker run --rm -d \
    --name certbot_nginx_tmp \
    -p 80:80 \
    -v "$APP_DIR/nginx/certbot/www:/usr/share/nginx/html:ro" \
    nginx:stable-alpine
sleep 3

# Test que nginx répond
echo "  Test nginx..."
curl -s http://localhost/ > /dev/null && echo "  Nginx OK ✅" || echo "  Nginx ne répond pas ⚠️"

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
echo " Lance maintenant : cd /opt/planrh && docker-compose up -d --build"
echo "=============================="

#!/bin/bash
# ============================================================
#  Script de déploiement PlanRH sur VPS Hostinger
#  Domaine : chseplanifrhia.fr  |  IP : 168.231.77.116
#
#  Prérequis :
#    - DNS chseplanifrhia.fr → 168.231.77.116 (déjà configuré)
#    - Lancer init-ssl.sh UNE FOIS avant ce script
#
#  Usage : bash deploy.sh
# ============================================================
set -e

APP_DIR="/opt/planrh"
REPO_URL="https://github.com/condoleezer/chse-planning-app.git"

echo "=============================="
echo " PlanRH - Déploiement VPS"
echo " chseplanifrhia.fr"
echo "=============================="

# ── 1. Mise à jour système ──────────────────────────────────
echo "[1/5] Mise à jour du système..."
apt-get update -y && apt-get upgrade -y

# ── 2. Installation Docker ──────────────────────────────────
echo "[2/5] Vérification Docker..."
if ! command -v docker &> /dev/null; then
    echo "  Installation de Docker..."
    curl -fsSL https://get.docker.com | sh
    systemctl enable docker
    systemctl start docker
else
    echo "  Docker déjà installé : $(docker --version)"
fi

if ! command -v docker-compose &> /dev/null; then
    echo "  Installation de Docker Compose..."
    curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" \
         -o /usr/local/bin/docker-compose
    chmod +x /usr/local/bin/docker-compose
else
    echo "  Docker Compose déjà installé : $(docker-compose --version)"
fi

# ── 3. Clone / mise à jour du repo ─────────────────────────
echo "[3/5] Récupération du code..."
if [ -d "$APP_DIR/.git" ]; then
    echo "  Mise à jour du repo existant..."
    cd "$APP_DIR"
    git pull
else
    echo "  Clone du repo..."
    git clone "$REPO_URL" "$APP_DIR"
    cd "$APP_DIR"
fi
cd "$APP_DIR"

# ── 4. Vérification .env ────────────────────────────────────
echo "[4/5] Vérification du fichier .env..."
if [ ! -f "$APP_DIR/PlanRHAPI/.env" ]; then
    echo ""
    echo "  ⚠️  ATTENTION : PlanRHAPI/.env introuvable !"
    echo "  Crée-le avec :"
    echo "    cp $APP_DIR/PlanRHAPI/.env.example $APP_DIR/PlanRHAPI/.env"
    echo "    nano $APP_DIR/PlanRHAPI/.env"
    echo ""
    echo "  Contenu minimal requis :"
    echo "    MONGODB_URI=mongodb://mongodb:27017"
    echo "    MONGO_DB=planRH"
    echo "    SECRET_KEY=<une-clé-secrète-longue>"
    echo ""
    exit 1
fi

# Vérifie que le certificat SSL existe
if [ ! -d "$APP_DIR/nginx/certbot/conf/live/chseplanifrhia.fr" ]; then
    echo ""
    echo "  ⚠️  Certificat SSL introuvable !"
    echo "  Lance d'abord : bash init-ssl.sh"
    echo ""
    exit 1
fi

# ── 5. Build et lancement ───────────────────────────────────
echo "[5/5] Build et lancement des containers..."
docker-compose down --remove-orphans 2>/dev/null || true
docker-compose up -d --build

echo ""
echo "=============================="
echo " ✅ Déploiement terminé !"
echo ""
echo " 🌐 Site    : https://chseplanifrhia.fr"
echo " 🔌 API     : https://chseplanifrhia.fr/api"
echo ""
echo " Vérifier les logs :"
echo "   docker-compose logs -f"
echo "=============================="

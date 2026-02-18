#!/bin/sh
# Remplace la variable API_URL dans nginx.conf au démarrage
sed -i "s|BACKEND_URL_PLACEHOLDER|${API_URL}|g" /etc/nginx/nginx.conf
nginx -g "daemon off;"
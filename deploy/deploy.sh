#!/bin/bash
# JournalFX — деплой скрипт
# Запускать на сервере: bash deploy.sh
# Переменная SERVER уже должна быть настроена или передаётся как аргумент

set -e

SERVER=${1:-"your_server_ip"}
SSH_USER=${2:-"root"}
DEPLOY_PATH="/var/www/journalfx"

echo "==> Building frontend..."
cd frontend
npm run build
cd ..

echo "==> Uploading files to $SERVER..."

# Создать директории на сервере
ssh $SSH_USER@$SERVER "mkdir -p $DEPLOY_PATH/backend $DEPLOY_PATH/dist"

# Загрузить бэкенд
rsync -av --exclude='node_modules' --exclude='journalfx.db' \
  backend/ $SSH_USER@$SERVER:$DEPLOY_PATH/backend/

# Загрузить собранный фронтенд
rsync -av frontend/dist/ $SSH_USER@$SERVER:$DEPLOY_PATH/dist/

# Загрузить PM2 конфиг
scp deploy/ecosystem.config.js $SSH_USER@$SERVER:$DEPLOY_PATH/

echo "==> Installing backend dependencies on server..."
ssh $SSH_USER@$SERVER "cd $DEPLOY_PATH/backend && npm install --production"

echo "==> Restarting backend via PM2..."
ssh $SSH_USER@$SERVER "cd $DEPLOY_PATH && pm2 startOrRestart ecosystem.config.js --env production && pm2 save"

echo "==> Copying Nginx configs..."
scp deploy/nginx/journalfx.amalkhon.tech.conf $SSH_USER@$SERVER:/etc/nginx/sites-available/
scp deploy/nginx/api.amalkhon.tech.conf       $SSH_USER@$SERVER:/etc/nginx/sites-available/

ssh $SSH_USER@$SERVER "
  ln -sf /etc/nginx/sites-available/journalfx.amalkhon.tech.conf /etc/nginx/sites-enabled/
  ln -sf /etc/nginx/sites-available/api.amalkhon.tech.conf /etc/nginx/sites-enabled/
  nginx -t && systemctl reload nginx
"

echo ""
echo "Done! App available at:"
echo "  Frontend: https://journalfx.amalkhon.tech"
echo "  API:      https://api.amalkhon.tech/journalfx/health"

#!/usr/bin/env bash
# Run on EC2 via SSM. Argument: SHA-tagged image
set -euo pipefail

SHA="${1:?SHA argument required}"
REGISTRY="250847881242.dkr.ecr.ap-northeast-2.amazonaws.com"
REPO="study-helper-web"
IMAGE="${REGISTRY}/${REPO}:${SHA}"

cd "$(dirname "$0")"

echo "[1/4] Update IMAGE in .env.prod -> ${IMAGE}"
if [ ! -f .env.prod ]; then
  echo "ERROR: .env.prod not found at $(pwd). Bootstrap it from .env.prod.example first." >&2
  exit 2
fi
if grep -q '^IMAGE=' .env.prod; then
  sudo sed -i "s|^IMAGE=.*|IMAGE=${IMAGE}|" .env.prod
else
  echo "IMAGE=${IMAGE}" | sudo tee -a .env.prod >/dev/null
fi

echo "[2/4] ECR login"
aws ecr get-login-password --region ap-northeast-2 \
  | sudo docker login --username AWS --password-stdin "${REGISTRY}"

echo "[3/4] Pull + up"
sudo docker compose -f docker-compose.prod.yml --env-file .env.prod pull
sudo docker compose -f docker-compose.prod.yml --env-file .env.prod up -d --remove-orphans

echo "[4/4] Status"
sleep 5
sudo docker compose -f docker-compose.prod.yml --env-file .env.prod ps

sudo docker image prune -f

echo "=== Deploy complete: ${IMAGE} ==="

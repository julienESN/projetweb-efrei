#!/bin/bash
set -e

echo "🐳 Test de l'image Docker Secure-Docs"
echo "======================================"

# Variables
IMAGE_NAME="secure-docs:latest"
CONTAINER_NAME="secure-docs-test"
PORT="3001"

# Couleurs pour l'affichage
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${YELLOW}🔨 Construction de l'image Docker...${NC}"
docker build -t $IMAGE_NAME .

echo -e "${YELLOW}🚀 Démarrage du conteneur...${NC}"
docker run --name $CONTAINER_NAME -p $PORT:3000 -d $IMAGE_NAME

# Attendre que le conteneur démarre
echo -e "${YELLOW}⏳ Attente du démarrage (30s)...${NC}"
sleep 30

# Vérifier que le conteneur est en cours d'exécution
if ! docker ps | grep -q $CONTAINER_NAME; then
    echo -e "${RED}❌ Le conteneur n'est pas en cours d'exécution${NC}"
    docker logs $CONTAINER_NAME
    exit 1
fi

echo -e "${YELLOW}🧪 Test des endpoints...${NC}"

# Test de l'endpoint de base
echo "Test GET /"
RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:$PORT)
if [ $RESPONSE -eq 200 ]; then
    echo -e "${GREEN}✅ GET / : OK (200)${NC}"
else
    echo -e "${RED}❌ GET / : ÉCHEC ($RESPONSE)${NC}"
fi

# Test de l'endpoint health
echo "Test GET /health"
HEALTH_RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:$PORT/health)
if [ $HEALTH_RESPONSE -eq 200 ]; then
    echo -e "${GREEN}✅ GET /health : OK (200)${NC}"
else
    echo -e "${RED}❌ GET /health : ÉCHEC ($HEALTH_RESPONSE)${NC}"
fi

# Test GraphQL endpoint
echo "Test POST /graphql"
GRAPHQL_RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" \
  -X POST \
  -H "Content-Type: application/json" \
  -d '{"query":"{ result }"}' \
  http://localhost:$PORT/graphql)

if [ $GRAPHQL_RESPONSE -eq 200 ]; then
    echo -e "${GREEN}✅ POST /graphql : OK (200)${NC}"
else
    echo -e "${RED}❌ POST /graphql : ÉCHEC ($GRAPHQL_RESPONSE)${NC}"
fi

# Affichage des logs (optionnel)
echo -e "${YELLOW}📋 Logs du conteneur (dernières 20 lignes):${NC}"
docker logs --tail 20 $CONTAINER_NAME

# Nettoyage
echo -e "${YELLOW}🧹 Nettoyage...${NC}"
docker stop $CONTAINER_NAME
docker rm $CONTAINER_NAME

echo -e "${GREEN}✅ Tests Docker terminés avec succès !${NC}"
echo -e "${YELLOW}💡 Pour déployer l'image : docker push your-registry/secure-docs:latest${NC}" 
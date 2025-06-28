# Étape 1: Build
FROM node:24.3.0-alpine AS builder

# Définir le répertoire de travail
WORKDIR /app

# Copier les fichiers de configuration des dépendances
COPY package*.json ./

# Installer les dépendances (y compris devDependencies pour le build)
RUN npm ci

# Copier le code source
COPY . .

# Construire l'application
RUN npm run build

# Étape 2: Production avec Redis intégré
FROM node:24.3.0-alpine AS production

# Installer Redis et curl (pour healthcheck)
RUN apk add --no-cache redis curl

# Créer un utilisateur non-root pour la sécurité
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nestjs -u 1001

# Définir le répertoire de travail
WORKDIR /app

# Copier les fichiers de configuration des dépendances
COPY package*.json ./

# Installer uniquement les dépendances de production
RUN npm ci --only=production && npm cache clean --force

# Copier l'application buildée depuis l'étape builder
COPY --from=builder /app/dist ./dist

# Créer le script de démarrage qui lance Redis + App
RUN echo '#!/bin/sh' > /app/start.sh && \
    echo 'echo "🚀 Démarrage de Redis..."' >> /app/start.sh && \
    echo 'redis-server --daemonize yes --appendonly yes --bind 127.0.0.1 --port 6379' >> /app/start.sh && \
    echo 'echo "⏳ Attente de Redis..."' >> /app/start.sh && \
    echo 'sleep 2' >> /app/start.sh && \
    echo 'echo "🎯 Démarrage de l'\''application NestJS..."' >> /app/start.sh && \
    echo 'node dist/main' >> /app/start.sh && \
    chmod +x /app/start.sh

# Changer le propriétaire des fichiers
RUN chown -R nestjs:nodejs /app
USER nestjs

# Exposer le port de l'application
EXPOSE 3000

# Définir les variables d'environnement
ENV NODE_ENV=production
ENV PORT=3000
ENV REDIS_HOST=localhost
ENV REDIS_PORT=6379

# Commande pour démarrer Redis + l'application
CMD ["/app/start.sh"] 
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

# Étape 2: Production
FROM node:24.3.0-alpine AS production

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

# Changer le propriétaire des fichiers
RUN chown -R nestjs:nodejs /app
USER nestjs

# Exposer le port de l'application
EXPOSE 3000

# Définir les variables d'environnement
ENV NODE_ENV=production

# Commande pour démarrer l'application
CMD ["node", "dist/main"] 
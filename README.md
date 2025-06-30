# Projet Web – Secure Docs

## Objectif

Développer, par groupe de 3 à 4 étudiants, une plateforme sécurisée de gestion documentaire. Cette plateforme permet à des utilisateurs authentifiés de créer, lire et organiser des documents numériques, tout en intégrant des outils de qualité logicielle et de déploiement continu. En fin de TD, une présentation du projet, des choix d'architecture et une démonstration technique sont attendues.

## Prérequis techniques

- Utilisation de **Nest.js**
- API construite en **GraphQL (Code First)**
- Intégration d'un système de **Message Queuing** (BullMQ + Redis)
- **Tests automatisés** (unitaires et intégration)
- **Intégration continue (CI)** avec GitHub Actions
- **Déploiement avec Docker** (option : Render / Heroku)

## Étapes de réalisation

### 1. Étude de faisabilité

- Étudier le fonctionnement de NestJS, son installation, son architecture modulaire.
- Analyser les avantages/inconvénients de GraphQL dans le contexte d'une API documentaire.
  - [Documentation NestJS](https://docs.nestjs.com/)
  - [Documentation GraphQL](https://graphql.org/)

### 2. Mise en place du projet

- Initialiser le projet avec Nest CLI
- Créer un contrôleur Health check répondant "OK"
- Installer Redis via `docker-compose.yml`
- Intégrer BullMQ pour la gestion asynchrone :
  - Créer une queue
  - Ajouter un job à partir du contrôleur health
  - Créer un consumer
  - Logger le traitement du job
  - [Queues NestJS](https://docs.nestjs.com/techniques/queues)
  - [Redis Docker](https://hub.docker.com/_/redis)

#### Tutoriel de test rapide

```bash
# 1. Lancer Redis (Docker)
docker compose up -d redis

# 2. Démarrer l'application NestJS en mode développement
npm run start:dev

# 3. Vérifier l'endpoint Health
curl http://localhost:3000/health   # → OK

# 4. (Optionnel) Inspecter les jobs dans Redis
docker exec -it secure-docs-redis redis-cli
redis> keys bull:health:*
redis> llen bull:health:completed

# 5. Arrêter les services
Ctrl+C   # pour arrêter NestJS
docker compose down  # pour arrêter Redis
```

### 3. Configuration GraphQL

- Installer `@nestjs/graphql`
- Configurer GraphQL en mode Code First
- Ajouter un premier résolveur retournant `{ result: "ok" }`
- Tester l'API avec Postman ou GraphQL Playground
  - [Quick Start GraphQL NestJS](https://docs.nestjs.com/graphql/quick-start)

#### Tester GraphQL

1. S'assurer que l'application tourne (`npm run start:dev`).
2. Ouvrir le Playground : http://localhost:3000/graphql
3. Lancer la requête suivante :

```graphql
query {
  result
}
```

Vous devriez obtenir :

```json
{
  "data": {
    "result": "ok"
  }
}
```

### 4. 🔐 Authentification et Sécurité

- **JWT Authentication** avec Passport.js
- **Protection des routes** GraphQL avec guards
- **Gestion des rôles** (ADMIN, USER)
- **Hachage sécurisé** des mots de passe avec bcrypt

#### Configuration rapide

```bash
# Les dépendances sont déjà installées
# Configurer la variable d'environnement
echo "JWT_SECRET=votre-clé-secrète-jwt-très-longue-et-complexe" >> .env
```

#### Tests d'authentification

1. **Script de test automatique :**

```bash
# Depuis la racine du projet
node src/auth/test-auth.script.js
```

2. **Test manuel dans GraphQL Playground :**

```graphql
# 1. Se connecter avec l'admin par défaut
mutation {
  login(loginInput: { email: "admin@example.com", password: "password" }) {
    access_token
    user {
      id
      email
      username
      role
    }
  }
}

# 2. Utiliser le token dans les headers pour les queries protégées
# Headers: { "Authorization": "Bearer <votre_token>" }
query {
  me {
    id
    email
    username
    role
  }
}

# 3. Tester l'inscription
mutation {
  register(
    registerInput: {
      email: "nouveau@example.com"
      username: "nouveau_user"
      password: "motdepasse123"
      role: USER
    }
  ) {
    access_token
    user {
      id
      email
      username
      role
    }
  }
}
```

#### Comptes par défaut

| Email             | Mot de passe | Rôle  |
| ----------------- | ------------ | ----- |
| admin@example.com | password     | ADMIN |
| user@example.com  | password     | USER  |

#### Routes protégées

- **USER** : `me`, `getDocumentsByUser`, `createDocument`, `updateDocument`, `deleteDocument`
- **ADMIN** : `users`, `documents`, `createUser`, `deleteUser`

📚 **Documentation complète :** [src/auth/README.md](src/auth/README.md)

### 5. Conception de l'architecture

- Modéliser les entités :
  - Utilisateur
  - Document
  - (optionnel) Historique ou Log
- Organiser le projet :
  - Modèles / DTO / services / résolveurs
  - Gestion des rôles : admin, user
  - [Exemple de projet](https://github.com/nestjs/nest/tree/master/sample/23-graphql-code-first)

#### Tests de vérification de l'étape 4

Après avoir implémenté l'architecture, vérifiez que tout fonctionne :

1. **Démarrer l'environnement :**

```bash
# Démarrer Redis
docker compose up -d redis

# Démarrer l'application
npm run start:dev
```

2. **Vérifier le schéma GraphQL :**

   - Le fichier `src/schema.gql` doit contenir les types `User`, `Document` et les enums `UserRole`
   - Ouvrir GraphQL Playground : http://localhost:3000/graphql

3. **Tests des queries de base :**

```graphql
# Test 1 : Ping original (étape 3)
query {
  result
}

# Test 2 : Lister tous les utilisateurs
query {
  users {
    id
    email
    username
    role
    createdAt
  }
}

# Test 3 : Récupérer un utilisateur par ID
query {
  user(id: "1") {
    id
    email
    username
    role
  }
}

# Test 4 : Lister tous les documents
query {
  documents {
    id
    title
    description
    fileUrl
    userId
  }
}

# Test 5 : Documents par utilisateur (API requise)
query {
  getDocumentsByUser(userId: "1") {
    id
    title
    description
    userId
  }
}

# Test 6 : Document par ID (API requise)
query {
  getDocumentById(id: "1") {
    id
    title
    description
    fileUrl
    userId
  }
}
```

4. **Tests des mutations :**

```graphql
# Test 7 : Créer un utilisateur
mutation {
  createUser(
    createUserInput: {
      email: "test@example.com"
      username: "testuser"
      role: USER
    }
  ) {
    id
    email
    username
    role
  }
}

# Test 8 : Créer un document (API requise)
mutation {
  createDocument(
    createDocumentInput: {
      title: "Document de test"
      description: "Ceci est un test"
      fileUrl: "https://example.com/test.pdf"
      userId: "1"
    }
  ) {
    id
    title
    description
    fileUrl
    userId
  }
}

# Test 9 : Supprimer un document (API requise)
mutation {
  deleteDocument(id: "2")
}

# Test 10 : Mettre à jour un document
mutation {
  updateDocument(id: "1", updateDocumentInput: { title: "Titre modifié" }) {
    id
    title
    description
  }
}
```

#### Tests automatisés e2e (End-to-End)

En plus des tests manuels dans GraphQL Playground, des **tests automatisés** ont été créés pour valider l'étape 4.

**Comment lancer les tests e2e :**

```bash
# Lancer tous les tests e2e
npm run test:e2e
```

**Ce qui est testé automatiquement :**

1. **`test/app.e2e-spec.ts`** : Test de base (GET /)
2. **`test/health.e2e-spec.ts`** : Endpoint Health + BullMQ (étape 2)
3. **`test/graphql.e2e-spec.ts`** : Toutes les APIs GraphQL (étape 4)
   - Ping original (étape 3)
   - CRUD Users complet
   - CRUD Documents avec APIs requises
   - Validation des enums UserRole
   - 11 tests couvrant tous les cas d'usage

**Résultats attendus :**

```
Test Suites: 3 passed, 3 total
Tests:       14 passed, 14 total
```

**Note :** Le warning "_worker process has failed to exit gracefully_" est normal avec NestJS + GraphQL + BullMQ et n'affecte pas le fonctionnement.

**✅ Si tous les tests passent, les étapes 2, 3 et 4 sont entièrement validées !**

### 5. Développement des APIs

- Résolveurs :
  - `getDocumentsByUser()` - Implémenté et testé
  - `getDocumentById()` - Implémenté et testé
- Mutations :
  - `createDocument(title, description, fileUrl)` - Implémenté et testé
  - `deleteDocument(id)` - Implémenté et testé
  - (bonus) `updateDocument()` - Implémenté et testé
- Données stockées en mémoire dans un premier temps

**Toutes les APIs sont fonctionnelles et testées automatiquement via les tests e2e.**

### 6. Intégration du Message Queuing

- Lors de la création ou suppression d'un document :
  - Envoyer un événement dans une queue
  - Le consumer loggue et traite l'événement (audit, analytics, etc.)

#### Tester le queuing BullMQ (documents et utilisateurs)

1. **Lancer l'environnement**

```bash
# Lancer Redis (Docker)
docker compose up -d redis

# Démarrer l'application NestJS en mode développement
npm run start:dev
```

2. **Créer ou supprimer un document OU un utilisateur**

- Ouvre GraphQL Playground : http://localhost:3000/graphql
- Utilise les mutations suivantes :

#### 🔹 **Mutations pour les UTILISATEURS** (queue: `user-events`)

**Créer un utilisateur :**

```graphql
mutation {
  createUser(
    createUserInput: {
      email: "test@example.com"
      username: "testuser"
      role: USER
    }
  ) {
    id
    email
    username
    role
    createdAt
  }
}
```

**Supprimer un utilisateur :**

```graphql
mutation {
  deleteUser(id: "3") # remplacez par l'ID de l'utilisateur créé
}
```

#### 🔹 **Mutations pour les DOCUMENTS** (queue: `document-events`)

**Créer un document :**

```graphql
mutation {
  createDocument(
    createDocumentInput: {
      title: "Document de test BullMQ"
      description: "Test de la queue document-events"
      fileUrl: "https://example.com/test.pdf"
      userId: "1"
    }
  ) {
    id
    title
    description
    fileUrl
    userId
    createdAt
  }
}
```

**Supprimer un document :**

```graphql
mutation {
  deleteDocument(id: "3") # remplacez par l'ID du document créé
}
```

3. **Observer la console du backend**

- Lors de la création/suppression d'un **document**, tu dois voir :
  - `Event reçu dans la queue document-events: { action: 'create', documentId: 'X', timestamp: ... }`
  - `Event reçu dans la queue document-events: { action: 'delete', documentId: 'X', timestamp: ... }`
- Lors de la création/suppression d'un **utilisateur**, tu dois voir :
  - `Event reçu dans la queue user-events: { action: 'create', userId: 'Y', timestamp: ... }`
  - `Event reçu dans la queue user-events: { action: 'delete', userId: 'Y', timestamp: ... }`

#### 🧪 **Séquence de test complète**

```graphql
# Test 1: Créer un utilisateur
mutation {
  createUser(
    createUserInput: {
      email: "bullmq@test.com"
      username: "bullmqtest"
      role: USER
    }
  ) {
    id
    email
  }
}

# Test 2: Créer un document
mutation {
  createDocument(
    createDocumentInput: {
      title: "Test BullMQ"
      description: "Queue test"
      userId: "1"
    }
  ) {
    id
    title
  }
}

# Test 3: Supprimer le document créé (remplacez l'ID)
mutation {
  deleteDocument(id: "3")
}

# Test 4: Supprimer l'utilisateur créé (remplacez l'ID)
mutation {
  deleteUser(id: "3")
}
```

#### 🔍 **Vérification avancée avec Redis CLI** (optionnel)

```bash
# Accéder à Redis CLI
docker exec -it secure-docs-redis redis-cli

# Vérifier les queues
redis> keys bull:*
redis> llen bull:user-events:completed
redis> llen bull:document-events:completed
```

**✅ Si vous voyez ces logs dans votre console, BullMQ est correctement configuré et fonctionne !**

### 7. Intégration continue

- Créer un dépôt GitHub
- Configurer une GitHub Action :
  - `npm install`
  - `npm run lint`
  - `npm run test`
  - `nest build`
- Créer une image Docker
- La tester localement
- Modifier l'action GitHub pour builder l'image
  - [GitHub Actions](https://github.com/features/actions)

#### 🐳 **Création et test de l'image Docker**

**1. Dockerfile créé** avec optimisations :

- Build multi-stage (réduction de la taille)
- Image Alpine (légère)
- Utilisateur non-root (sécurité)
- Cache optimisé

**2. Tester l'image localement :**

```bash
# Méthode 1: Construction manuelle
docker build -t secure-docs:latest .
docker run --name test-secure-docs -p 3001:3000 -d secure-docs:latest
curl http://localhost:3001  # → Hello World!
curl http://localhost:3001/health  # → OK
docker stop test-secure-docs && docker rm test-secure-docs

# Méthode 2: Script automatisé
./scripts/test-docker.sh

# Méthode 3: Docker Compose complet (avec Redis)
docker-compose -f docker-compose.test.yml up --build
```

#### 🔄 **GitHub Actions CI/CD Pipeline**

**Workflow créé** (`.github/workflows/ci.yml`) qui :

**Job 1 - Tests et Qualité :**

- ✅ Installation des dépendances (`npm ci`)
- ✅ Linter ESLint (`npm run lint`)
- ✅ Tests unitaires (`npm run test`)
- ✅ Tests e2e (`npm run test:e2e`)
- ✅ Build de l'application (`npm run build`)
- ✅ Service Redis pour les tests

**Job 2 - Docker Build & Push :**

- ✅ Build de l'image Docker
- ✅ Push vers DockerHub (sur `main` uniquement)
- ✅ Tagging automatique (latest, sha, branch)
- ✅ Cache optimisé GitHub Actions
- ✅ Scan de vulnérabilités avec Docker Scout

#### 🧪 **Tests d'intégration automatisés**

```bash
# Tester localement avec Docker Compose
docker-compose -f docker-compose.test.yml up --build

# Vérifier les endpoints
curl http://localhost:3000  # API de base
curl http://localhost:3000/health  # Health check
curl -X POST -H "Content-Type: application/json" \
  -d '{"query":"{ result }"}' \
  http://localhost:3000/graphql  # GraphQL
```

**✅ Pipeline complète :** Tests → Build → Push → Deploy ready!

### 8. Tests automatisés ✅ **COMPLÉTÉ**

#### 🧪 **Tests unitaires implémentés**

**Jest** était déjà installé et configuré. Nous avons créé des tests complets pour :

**Tests des services :**

- `src/user/user.service.spec.ts` (29 tests)
- `src/document/document.service.spec.ts` (16 tests)

**Tests des résolveurs :**

- `src/user/user.resolver.spec.ts` (13 tests)
- `src/document/document.resolver.spec.ts` (14 tests)

#### 📊 **Couverture de code**

```bash
# Lancer tous les tests
npm test

# Tests avec couverture
npm run test:cov
```

**Résultats :**

- **62 tests** unitaires passent tous
- **Couverture globale :** 65.94%
- **Services :** 100% de couverture
- **Résolveurs :** ~80% de couverture

#### 🔧 **Types de tests couverts**

- ✅ Tests unitaires des services (CRUD, validation)
- ✅ Tests unitaires des résolveurs (GraphQL)
- ✅ Tests avec mocks (BullMQ, services)
- ✅ Tests de gestion d'erreurs
- ✅ Tests de validation des données
- ✅ Tests d'intégration comportementale
- ✅ **Tests d'authentification** (JWT, passwords, sécurité)

#### 🔐 **Tests d'authentification**

**Tests d'intégration AuthService :**

```bash
# Tests Jest spécialisés pour l'authentification
npm test -- auth.integration.spec.ts
```

**Script de test manuel GraphQL :**

```bash
# Test complet du workflow d'authentification
node src/auth/test-auth.script.js
```

**Tests couverts :**

- ✅ Validation utilisateur (email/password)
- ✅ Login avec identifiants valides/invalides
- ✅ Inscription de nouveaux utilisateurs
- ✅ Hachage sécurisé des mots de passe
- ✅ Génération et validation de tokens JWT
- ✅ Sécurité (pas d'exposition des passwords)
- ✅ Routes protégées avec guards

**Documentation :** [Testing NestJS](https://docs.nestjs.com/fundamentals/testing) | [Tests Auth](src/auth/README.md#tests)

### 9. Déploiement continu ✅ **COMPLÉTÉ**

- Modifier la GitHub Action pour :
  - ✅ Pousser l'image Docker sur DockerHub [Lien DockerHub](https://hub.docker.com/r/troxydev/secure-docs)
  - ✅ Déployer automatiquement via Render ou Heroku à chaque push sur main [Déploiement Render](https://projetweb-efrei.onrender.com/)

### 10. Tests d'intégration ✅ **COMPLÉTÉ**

- ✅ Créer une collection Postman pour tester les APIs [Collection Postman](https://sofianefares.postman.co/workspace/e649fe57-d047-469c-840c-e02347de9ae9/collection/46300404-f9c3ead2-d286-44c8-a499-2a36fcf61213?action=share&source=copy-link&creator=46300404)
- Automatiser ces tests avec Newman
- Les intégrer dans la pipeline GitHub Actions

### 11. Interface utilisateur (bonus recommandé)

- Afficher la liste des documents de l'utilisateur
- Afficher les détails d'un document
- Créer et supprimer un document via l'UI
- Framework libre : React, Vue, Angular...

### 12. Authentification ✅ **COMPLÉTÉ**

- Utiliser une librairie comme Auth0 ou Passport.js avec JWT
- Protéger les routes sensibles
- Associer les documents à l'utilisateur authentifié
  - [Auth0](https://developer.auth0.com/)

### 13. Gestion de fichiers (bonus)

- Implémenter l'upload de fichier
- Stocker localement (dans `/uploads`) ou utiliser un cloud storage
- Lier chaque document à une URL de fichier

### 14. Base de données

- Intégrer Prisma et une base PostgreSQL
- Modifier les services pour stocker les documents et utilisateurs en base
- Déployer la base sur Render PostgreSQL
  - [Prisma](https://www.prisma.io/docs)

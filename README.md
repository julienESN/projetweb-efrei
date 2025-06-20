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

### 4. Conception de l'architecture

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

3. **Observer la console du backend**

- Lors de la création/suppression d'un document, tu dois voir :
  - `Ajout d'un job dans la queue document-events ...`
  - `Event reçu dans la queue: ...`
- Lors de la création/suppression d'un utilisateur, tu dois voir :
  - `Ajout d'un job dans la queue user-events ...`
  - `Event reçu dans la queue user-events: ...`

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

### 8. Tests automatisés

- Installer Jest
- Écrire des tests unitaires pour :
  - Les services
  - Les résolveurs
  - Bonus : tests d'intégration avec base en mémoire
  - [Testing NestJS](https://docs.nestjs.com/fundamentals/testing)

### 9. Déploiement continu

- Modifier la GitHub Action pour :
  - Pousser l'image Docker sur DockerHub
  - Déployer automatiquement via Render ou Heroku à chaque push sur main
  - [Déploiement Render](https://docs.render.com/web-services#deploy-from-a-container-registry)

### 10. Tests d'intégration

- Créer une collection Postman pour tester les APIs
- Automatiser ces tests avec Newman
- Les intégrer dans la pipeline GitHub Actions

### 11. Interface utilisateur (bonus recommandé)

- Afficher la liste des documents de l'utilisateur
- Afficher les détails d'un document
- Créer et supprimer un document via l'UI
- Framework libre : React, Vue, Angular...

### 12. Authentification

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

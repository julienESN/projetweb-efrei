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

### 3. Configuration GraphQL

- Installer `@nestjs/graphql`
- Configurer GraphQL en mode Code First
- Ajouter un premier résolveur retournant `{ result: "ok" }`
- Tester l'API avec Postman ou GraphQL Playground
  - [Quick Start GraphQL NestJS](https://docs.nestjs.com/graphql/quick-start)

### 4. Conception de l'architecture

- Modéliser les entités :
  - Utilisateur
  - Document
  - (optionnel) Historique ou Log
- Organiser le projet :
  - Modèles / DTO / services / résolveurs
  - Gestion des rôles : admin, user
  - [Exemple de projet](https://github.com/nestjs/nest/tree/master/sample/23-graphql-code-first)

### 5. Développement des APIs

- Résolveurs :
  - `getDocumentsByUser()`
  - `getDocumentById()`
- Mutations :
  - `createDocument(title, description, fileUrl)`
  - `deleteDocument(id)`
  - (bonus) `updateDocument()`
- Données stockées en mémoire dans un premier temps

### 6. Intégration du Message Queuing

- Lors de la création ou suppression d'un document :
  - Envoyer un événement dans une queue
  - Le consumer loggue et traite l'événement (audit, analytics, etc.)

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

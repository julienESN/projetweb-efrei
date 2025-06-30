# Configuration de l'Authentification

## Vue d'ensemble

L'authentification a été implémentée dans votre application NestJS avec les fonctionnalités suivantes :

- **Passport.js avec JWT** pour l'authentification
- **Bcrypt** pour le hachage des mots de passe
- **Protection des routes** avec des guards
- **Gestion des rôles** (ADMIN, USER)
- **GraphQL** pour les mutations de login/register

## Structure des fichiers créés

```
src/
├── auth/
│   ├── decorators/
│   │   ├── current-user.decorator.ts    # Décorateur pour récupérer l'utilisateur actuel
│   │   └── roles.decorator.ts           # Décorateur pour spécifier les rôles requis
│   ├── dto/
│   │   ├── auth-response.ts             # DTO de réponse d'authentification
│   │   ├── login.input.ts               # DTO d'entrée pour le login
│   │   └── register.input.ts            # DTO d'entrée pour l'inscription
│   ├── guards/
│   │   ├── jwt-auth.guard.ts            # Guard JWT pour protéger les routes
│   │   ├── local-auth.guard.ts          # Guard local pour le login
│   │   └── roles.guard.ts               # Guard pour vérifier les rôles
│   ├── strategies/
│   │   ├── jwt.strategy.ts              # Stratégie JWT de Passport
│   │   └── local.strategy.ts            # Stratégie locale de Passport
│   ├── auth.module.ts                   # Module d'authentification
│   ├── auth.resolver.ts                 # Resolver GraphQL pour l'auth
│   └── auth.service.ts                  # Service d'authentification
└── user/
    ├── user.entity.ts                   # Entité utilisateur avec password
    └── user.module.ts                   # Module utilisateur
```

## Mutations GraphQL disponibles

### Inscription

```graphql
mutation Register($registerInput: RegisterInput!) {
  register(registerInput: $registerInput) {
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

Variables :

```json
{
  "registerInput": {
    "email": "user@example.com",
    "username": "utilisateur",
    "password": "motdepasse123",
    "role": "USER"
  }
}
```

### Connexion

```graphql
mutation Login($loginInput: LoginInput!) {
  login(loginInput: $loginInput) {
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

Variables :

```json
{
  "loginInput": {
    "email": "user@example.com",
    "password": "motdepasse123"
  }
}
```

### Obtenir l'utilisateur actuel

```graphql
query Me {
  me {
    id
    email
    username
    role
  }
}
```

## Utilisation des headers d'authentification

Pour les requêtes protégées, ajoutez le header :

```
Authorization: Bearer <votre_jwt_token>
```

## Routes protégées

### Routes USER (authentification requise)

- `getDocumentsByUser` - Voir ses propres documents
- `getDocumentById` - Voir un document
- `createDocument` - Créer un document
- `updateDocument` - Modifier ses propres documents
- `deleteDocument` - Supprimer ses propres documents
- `updateUser` - Modifier son propre profil

### Routes ADMIN (rôle administrateur requis)

- `users` - Lister tous les utilisateurs
- `documents` - Lister tous les documents
- `createUser` - Créer un utilisateur
- `deleteUser` - Supprimer un utilisateur

## Utilisateurs par défaut

Deux utilisateurs sont créés par défaut avec le mot de passe "password" :

1. **Administrateur**

   - Email : admin@example.com
   - Mot de passe : password
   - Rôle : ADMIN

2. **Utilisateur standard**
   - Email : user@example.com
   - Mot de passe : password
   - Rôle : USER

## Configuration

### Variables d'environnement

Ajoutez ces variables à votre fichier `.env` :

```env
JWT_SECRET=votre-clé-secrète-jwt-très-longue-et-complexe
```

### En production

⚠️ **Important** : Changez absolument la clé JWT en production !

## Exemples d'utilisation

### 1. S'inscrire

```bash
curl -X POST http://localhost:3000/graphql \
  -H "Content-Type: application/json" \
  -d '{
    "query": "mutation Register($registerInput: RegisterInput!) { register(registerInput: $registerInput) { access_token user { id email username role } } }",
    "variables": {
      "registerInput": {
        "email": "nouveau@example.com",
        "username": "nouveau_user",
        "password": "monmotdepasse",
        "role": "USER"
      }
    }
  }'
```

### 2. Se connecter

```bash
curl -X POST http://localhost:3000/graphql \
  -H "Content-Type: application/json" \
  -d '{
    "query": "mutation Login($loginInput: LoginInput!) { login(loginInput: $loginInput) { access_token user { id email username role } } }",
    "variables": {
      "loginInput": {
        "email": "admin@example.com",
        "password": "password"
      }
    }
  }'
```

### 3. Accéder à une route protégée

```bash
curl -X POST http://localhost:3000/graphql \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <votre_token_jwt>" \
  -d '{
    "query": "query Me { me { id email username role } }"
  }'
```

## Sécurité implémentée

✅ **Mots de passe hachés** avec bcrypt (salt rounds = 10)
✅ **Tokens JWT** avec expiration (24h)
✅ **Validation des rôles** pour les routes sensibles
✅ **Protection des données** (passwords jamais exposés via GraphQL)
✅ **Contrôle d'accès** (utilisateurs ne peuvent modifier que leurs propres données)
✅ **Guards NestJS** pour automatiser la protection des routes

## Prochaines améliorations possibles

- Refresh tokens
- Logout avec blacklist des tokens
- Limitation du taux de requêtes (rate limiting)
- Authentification à deux facteurs (2FA)
- Réinitialisation de mot de passe par email
- Validation des mots de passe (complexité)
- Logs d'audit des connexions

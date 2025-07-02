# 🚀 Démarrage Rapide - Secure Docs

## 🏃‍♂️ Lancement en 30 secondes

### 1. **Démarrer l'environnement**

```bash
# Démarrer Redis et l'application
docker compose up -d

# OU si vous utilisez la version test
docker compose -f docker-compose.test.yml up -d
```

### 2. **Vérifier que tout fonctionne**

```bash
# Test santé de l'API
curl http://localhost:3000/health  # → OK

# GraphQL Playground
# Ouvrir: http://localhost:3000/graphql
```

## 🔐 Test d'Authentification

### ⚡ **Test automatique**

```bash
# Test complet en une commande
npm run test:auth:manual
```

### 📱 **Test manuel dans GraphQL Playground**

1. **Se connecter :**

```graphql
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
```

2. **Copier le token et l'ajouter dans les Headers :**

```json
{
  "Authorization": "Bearer VOTRE_TOKEN_ICI"
}
```

3. **Tester une route protégée :**

```graphql
query {
  me {
    id
    email
    username
    role
  }
}
```

## 📋 Comptes de Test

| Email               | Password   | Rôle  | Accès  |
| ------------------- | ---------- | ----- | ------ |
| `admin@example.com` | `password` | ADMIN | Tout   |
| `user@example.com`  | `password` | USER  | Limité |

## 🧪 Tests Disponibles

```bash
# Tests d'authentification Jest
npm run test:auth

# Test GraphQL manuel
npm run test:auth:manual

# Tous les tests
npm test

# Tests avec couverture
npm run test:cov
```

## 🏗️ Développement

```bash
# Mode développement avec reload
npm run start:dev

# Build de production
npm run build

# Linter
npm run lint
```

## 📊 Monitoring

```bash
# Logs des conteneurs
docker compose logs -f

# État des queues Redis
docker exec -it secure-docs-redis redis-cli
redis> keys bull:*
redis> llen bull:user-events:completed
```

## 🐛 Résolution de Problèmes

### Redis ne démarre pas

```bash
docker compose down
docker compose up -d redis
```

### Port 3000 occupé

```bash
# Trouver le processus
lsof -i :3000
# Ou modifier le port dans docker-compose.yml
```

### Tests d'authentification échouent

```bash
# Vérifier que l'app tourne
curl http://localhost:3000/health

# Vérifier Redis
docker ps | grep redis
```

## 📚 Documentation Complète

- 🔐 **Authentification :** [src/auth/README.md](src/auth/README.md)
- 📖 **Projet complet :** [README.md](README.md)
- 🏛️ **Architecture :** Voir section 5 du README

---

**✨ Prêt à développer !** L'authentification est complètement configurée et testée. 🎉

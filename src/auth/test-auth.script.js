// Script de test d'authentification GraphQL
// Usage depuis la racine du projet : node src/auth/test-auth.script.js [URL]
// Exemples:
//   node src/auth/test-auth.script.js                      (utilise http://localhost:3000)
//   node src/auth/test-auth.script.js http://localhost:8080

const axios = require('axios');

// URL configurable - peut être passée en argument ou via variable d'environnement
const BASE_URL =
  process.argv[2] || process.env.APP_URL || 'http://localhost:3000';
const GRAPHQL_ENDPOINT = `${BASE_URL}/graphql`;

async function testAuth() {
  console.log("🧪 Test d'authentification GraphQL");
  console.log('🌐 URL utilisée:', GRAPHQL_ENDPOINT);
  console.log('');

  try {
    // Test 1: Login avec l'utilisateur admin par défaut
    console.log('1️⃣ Test de connexion admin...');
    const loginResponse = await axios.post(GRAPHQL_ENDPOINT, {
      query: `
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
      `,
      variables: {
        loginInput: {
          email: 'admin@example.com',
          password: 'password',
        },
      },
    });

    if (loginResponse.data.errors) {
      console.error('❌ Erreur de connexion:', loginResponse.data.errors);
      return false;
    }

    const { access_token, user } = loginResponse.data.data.login;
    console.log(
      '✅ Connexion réussie pour:',
      user.email,
      '(rôle:',
      user.role + ')',
    );
    console.log('🔑 Token JWT reçu');

    // Test 2: Query protégée "me"
    console.log('\n2️⃣ Test query protégée "me"...');
    const meResponse = await axios.post(
      GRAPHQL_ENDPOINT,
      {
        query: `
        query Me {
          me {
            id
            email
            username
            role
          }
        }
      `,
      },
      {
        headers: {
          Authorization: `Bearer ${access_token}`,
        },
      },
    );

    if (meResponse.data.errors) {
      console.error('❌ Erreur query "me":', meResponse.data.errors);
      return false;
    }

    console.log('✅ Query "me" réussie:', meResponse.data.data.me.email);

    // Test 3: Route admin "users"
    console.log('\n3️⃣ Test route admin "users"...');
    const usersResponse = await axios.post(
      GRAPHQL_ENDPOINT,
      {
        query: `
        query Users {
          users {
            id
            email
            username
            role
          }
        }
      `,
      },
      {
        headers: {
          Authorization: `Bearer ${access_token}`,
        },
      },
    );

    if (usersResponse.data.errors) {
      console.error('❌ Erreur route admin:', usersResponse.data.errors);
      return false;
    }

    console.log(
      '✅ Route admin accessible, utilisateurs:',
      usersResponse.data.data.users.length,
    );

    // Test 4: Inscription nouvel utilisateur
    console.log('\n4️⃣ Test inscription nouvel utilisateur...');
    const timestamp = Date.now();
    const registerResponse = await axios.post(GRAPHQL_ENDPOINT, {
      query: `
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
      `,
      variables: {
        registerInput: {
          email: `test-${timestamp}@example.com`,
          username: `user-${timestamp}`,
          password: 'motdepasse123',
          role: 'USER',
        },
      },
    });

    if (registerResponse.data.errors) {
      console.error('❌ Erreur inscription:', registerResponse.data.errors);
      return false;
    }

    console.log(
      '✅ Inscription réussie:',
      registerResponse.data.data.register.user.email,
    );

    // Test 5: Login avec le nouvel utilisateur
    console.log('\n5️⃣ Test connexion nouvel utilisateur...');
    const newUserLoginResponse = await axios.post(GRAPHQL_ENDPOINT, {
      query: `
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
      `,
      variables: {
        loginInput: {
          email: `test-${timestamp}@example.com`,
          password: 'motdepasse123',
        },
      },
    });

    if (newUserLoginResponse.data.errors) {
      console.error(
        '❌ Erreur connexion nouvel utilisateur:',
        newUserLoginResponse.data.errors,
      );
      return false;
    }

    console.log('✅ Connexion nouvel utilisateur réussie');

    console.log(
      "\n🎉 Tous les tests d'authentification sont passés avec succès !",
    );
    console.log('📊 Résultats: 5/5 tests réussis');
    return true;
  } catch (error) {
    console.error('❌ Erreur critique:', error.message);
    if (error.response?.data) {
      console.error('Détails:', error.response.data);
    }
    if (error.code === 'ECONNREFUSED') {
      console.error(
        '💡 Assurez-vous que votre application est démarrée sur:',
        BASE_URL,
      );
    }
    return false;
  }
}

// Exécuter le test si appelé directement
if (require.main === module) {
  testAuth().then((success) => {
    process.exit(success ? 0 : 1);
  });
}

module.exports = { testAuth };

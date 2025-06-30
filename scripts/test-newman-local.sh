#!/bin/bash

set -e

echo "🚀 Test Newman en local pour Projet Web Efrei"
echo "=============================================="

# Créer le dossier de résultats s'il n'existe pas
mkdir -p test-results

# Vérifier si l'application tourne déjà
echo "🔍 Vérification si l'application est déjà en cours d'exécution..."
if curl -f http://localhost:3000/health > /dev/null 2>&1; then
    echo "✅ L'application est déjà en cours d'exécution"
    NEED_TO_START=false
else
    echo "🔄 Démarrage de l'application..."
    NEED_TO_START=true
    
    # Construire l'application
    echo "🏗️  Construction de l'application..."
    npm run build
    
    # Démarrer l'application en arrière-plan
    echo "▶️  Démarrage de l'application en arrière-plan..."
    npm run start:prod &
    APP_PID=$!
    
    # Attendre que l'application soit prête
    echo "⏳ Attente du démarrage de l'application..."
    timeout 60 bash -c 'until curl -f http://localhost:3000/health > /dev/null 2>&1; do echo "Attente..."; sleep 2; done'
    echo "✅ Application prête!"
fi

# Exécuter les tests Newman
echo "🧪 Exécution des tests Newman..."
npm run test:newman

echo "✅ Tests Newman terminés avec succès!"

# Arrêter l'application si nous l'avons démarrée
if [ "$NEED_TO_START" = true ] && [ ! -z "$APP_PID" ]; then
    echo "🛑 Arrêt de l'application..."
    kill $APP_PID
    wait $APP_PID 2>/dev/null || true
    echo "✅ Application arrêtée"
fi

echo "📊 Résultats disponibles dans: test-results/newman-results.xml"
echo "🎉 Test Newman local terminé!" 
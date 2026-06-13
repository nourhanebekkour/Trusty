#!/bin/sh

echo "Génération de la documentation Swagger..."
node src/swagger.js

if [ -f "src/swagger-output.json" ]; then
    echo "swagger-output.json généré avec succès"
else
    echo "ERREUR: swagger-output.json non généré"
    echo "Vérifiez src/swagger.js et relancez"
    exit 1
fi

echo "Démarrage du serveur en mode: $NODE_ENV"
exec npm run $1
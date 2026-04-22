# 🚀 Guide de démarrage Base de Données (Prisma)

Pour que tout le monde ait la même base de données sur son PC, suivez ces étapes :

### 1. Installation (A faire une seule fois)

npm install

### 2. Configuration locale
Copiez le fichier .env.example et renommez-le en .env.
Modifiez la ligne DATABASE_URL avec vos identifiants PostgreSQL locaux.


### 3. Synchroniser la base (Créer les tables)
npx prisma migrate dev


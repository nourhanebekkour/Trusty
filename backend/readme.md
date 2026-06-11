# 🚀 Backend - Plateforme de Portfolios GINF

Bienvenue sur le backend du projet.

## 🛠️ Stack Technique

- **Runtime**: Node.js (ES Modules)
- **Framework**: Express.js
- **ORM**: Prisma
- **Base de données**: PostgreSQL
- **Stockage**: MinIO (S3 Compatible)
- **Documentation**: Swagger / OpenAPI
- **Tests**: Jest & Supertest

---

## ⚙️ Configuration & Installation

### 1. Installation des dépendances
```bash
npm install
```

### 2. Configuration de l'environnement
Copiez le fichier d'exemple et configurez vos variables (Base de données, MinIO, JWT, SMTP) :
```bash
cp .env.example .env
```

### 3. Base de données (Prisma)
Synchronisez le schéma avec votre base locale et générez le client Prisma :
```bash
npx prisma migrate dev || npm run db:migrate:dev
npx prisma generate || npm run prisma:generate
```

*(Optionnel) Pour remplir la base avec des données de test :*
```bash
npm run db:seed
```

---

## 🏃 Scripts Disponibles

| Commande | Description |
| :--- | :--- |
| `npm run dev` | Lance le serveur en mode développement avec **nodemon** |
| `npm run start` | Lance le serveur en mode production |
| `npm run swagger` | Regénère la documentation Swagger (`swagger-output.json`) |
| `npm test` | Exécute les tests unitaires et d'intégration |
| `npm run prisma:generate` | Regénère le client Prisma |
| `npm run db:studio:dev` | Ouvre l'interface Prisma Studio pour visualiser les données |

---

## 📁 Gestion des Fichiers (MinIO)

Le système utilise deux buckets pour séparer les accès :

- **Public (`dev-public`)**: Accessible sans authentification. Utilisé pour :
  - Avatars (`/avatar`)
  - Badges (`/badge`)
  - Logos (`/logo`)
  - Icônes (`/icone`)
- **Privé (`dev-private`)**: Accessible via des URLs présignées temporaires (expirent après 1h). Utilisé pour :
  - Rapports de stage (`/stage`)
  - Attestations (`/activite`)
  - Justificatifs de compte (`/professionnel`)

---

## 📖 Documentation API

Une fois le serveur lancé (`npm run dev`), la documentation interactive est disponible à l'adresse suivante :
👉 [http://localhost:3000/api-docs](http://localhost:3000/api-docs)

---

## 🧪 Tests

Les tests sont configurés pour utiliser une base de données séparée via `.env.test`.
```bash
# Lancer tous les tests
npm test
```

---

## 🏗️ Structure du Projet

- `src/Config`: Configuration (Env, Prisma, MinIO, etc.)
- `src/modules`: Logique métier découpée par domaines (Identité, Cursus, Parcours, Système)
- `src/shared`: Middlewares, Services et Utilitaires partagés
- `prisma`: Schéma et migrations de la base de données
- `tests`: Tests unitaires et d'intégration

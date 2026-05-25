# Documentation des Tests Backend Trusty

## Structure des tests

```
backend/Tests/
├── unit/
│   ├── controllers/          # Tests des controllers (HTTP layer)
│   │   ├── authentification.controller.test.js
│   │   ├── competence.controller.test.js
│   │   ├── etudiant.controller.test.js
│   │   ├── formation.controller.test.js
│   │   ├── professeur.controller.test.js
│   │   ├── professionnel.controller.test.js
│   │   ├── stage.controller.test.js
│   │   └── utilisateur.controller.test.js
│   ├── services/             # Tests des services (business logic)
│   │   ├── authentification.service.test.js
│   │   ├── competence.service.test.js
│   │   ├── etudiant.service.test.js
│   │   ├── formation.service.test.js
│   │   ├── professeur.service.test.js
│   │   ├── professionnel.service.test.js
│   │   ├── stage.service.test.js
│   │   └── utilisateur.service.test.js
│   └── mocks/                # Mocks partagés (Prisma, MinIO...)
└── integration/              # Tests d'intégration API (base de données réelle)
    ├── auth.integration.test.js
    ├── competence.integration.test.js
    ├── etudiant.integration.test.js
    ├── formation.integration.test.js
    ├── professeur.integration.test.js
    ├── professionnel.integration.test.js
    ├── stage.integration.test.js
    └── utilisateur.integration.test.js
```

## Types de tests

### Tests unitaires (`unit/`)
- Testent chaque fonction de façon isolée
- Prisma et MinIO sont **mockés**, aucune base de données réelle requise
- Rapides à exécuter (< 30s)

### Tests d'intégration (`integration/`)
- Testent les routes HTTP de bout en bout avec `supertest`
- Requièrent une **base PostgreSQL** et **MinIO** actifs
- Vérifient que les modules fonctionnent ensemble correctement

## Lancer les tests

### Prérequis
- Copier `.env.test.example` en `.env.test` et renseigner les variables
- Avoir PostgreSQL et MinIO disponibles (pour les tests d'intégration)
- Appliquer les migrations : `npm run db:migrate:test`

### Commandes

| Commande | Description |
|---|---|
| `npm test` | Lance tous les tests + génère le rapport HTML en local |
| `npm run test:report` | Idem + envoie le rapport par email + crée un ticket Jira |

### Rapport HTML
Après `npm test`, le rapport est généré dans :
```
backend/test-reports/test-report.html
```
Ouvrir dans le navigateur : `open test-reports/test-report.html`

## Pipeline CI/CD (GitHub Actions)

Le workflow `.github/workflows/ci.yml` exécute automatiquement les tests sur chaque push et pull request vers `main`, `dev`.

```
backend-lint → backend-test → backend-run
                           ↘ backend-test-report  (push main/dev uniquement)
```

| Job | Ce qu'il fait |
|---|---|
| `backend-lint` | Vérifie la qualité du code avec ESLint |
| `backend-test` | Lance PostgreSQL + MinIO, applique les migrations et exécute `npm test` |
| `backend-run` | Vérifie que le serveur démarre sans erreur (smoke test) |
| `backend-test-report` | Relance les tests, envoie le rapport par email et crée un ticket Jira |

`backend-test-report` ne tourne que sur les **push** (pas les PR) vers `main` ou `dev`. Il nécessite les secrets GitHub suivants : `GMAIL_USER`, `GMAIL_APP_PASSWORD`, `JIRA_EMAIL`, `JIRA_API_TOKEN`, `JIRA_URL`, `JIRA_PROJECT_KEY`.

## Configuration Jest

Fichier : `jest.config.mjs`

- **Environnement** : Node.js
- **Reporter** : `jest-html-reporter`,génère `test-reports/test-report.html`
- **Variables d'environnement** : chargées depuis `.env.test`

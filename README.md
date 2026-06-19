# 🎓 Trusty — Plateforme de Portfolio Étudiant Certifié

![Node.js](https://img.shields.io/badge/Node.js-20+-339933?logo=node.js)
![Express](https://img.shields.io/badge/Express-5-000?logo=express)
![Vue 3](https://img.shields.io/badge/Vue_3-4FC08D?logo=vue.js)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-4169E1?logo=postgresql)
![Prisma](https://img.shields.io/badge/Prisma-6-2D3748?logo=prisma)
![Docker](https://img.shields.io/badge/Docker-2496ED?logo=docker)
![CI/CD](https://img.shields.io/badge/CI/CD-GitLab_%7C_GitHub_Actions-FC6D26?logo=gitlab)

---

## 📖 Description

**Trusty** est une **plateforme de portfolio étudiant certifié** destinée aux étudiants en formation. Elle permet aux étudiants de construire, publier et certifier un portfolio professionnel complet, validé par leurs professeurs et professionnels du secteur.

La plateforme repose sur un **système de validation à plusieurs niveaux** garantissant l'authenticité et la fiabilité des informations présentées par chaque étudiant. Chaque projet, stage, compétence ou activité est soumis à un flux de validation avant d'être certifié.

### 👥 Rôles utilisateurs

| Rôle | Description |
|------|-------------|
| **🎓 Étudiant** | Crée et gère son portfolio, soumet des entités pour validation, suit ses recommandations et badges |
| **👨‍🏫 Professeur** | Valide les projets, stages, formations et compétences académiques des étudiants |
| **💼 Professionnel** | Valide les expériences professionnelles et rédige des lettres de recommandation |
| **🔧 Administrateur** | Gère les utilisateurs, les rôles, les templates de portfolio et la configuration système |

---

## ✨ Fonctionnalités principales

### 📄 Portfolio certifié
- Création de portfolio personnalisé avec templates (`ModelePortfolio`)
- Publication de profil public avec informations certifiées
- Génération de portfolio au format **PDF** (via Puppeteer)
- Contrôle de visibilité public/privé

### 🏗️ Gestion de projets & stages
- Typologie complète : **Module**, **PFA**, **PFE**, **Stage**, **Projet personnel**
- Validation par les professeurs pour les entités académiques
- Validation par les professionnels pour les stages
- Association de technologies utilisées (avec niveaux de maîtrise)

### 🏆 Compétences & Badges
- **Compétences techniques** : langages, frameworks, outils (auto-évaluées)
- **Compétences comportementales** : travail d'équipe, communication, leadership
- Attribution de **badges** automatiques et manuels pour les accomplissements
- Score de crédibilité (`scoreCredibilite`) pour chaque étudiant

### 📬 Recommandations & Lettres
- Système de **recommandation** entre utilisateurs (pair à pair)
- Génération de **lettres de recommandation PDF** officielles (via Puppeteer)
- Workflow de validation des recommandations

### 🤖 Suggestions IA
- Suggestions automatiques générées par **Google Generative AI**
- Recommandations personnalisées pour améliorer le contenu du portfolio
- Conseils sur les compétences à développer

### 🔗 Intégration GitHub
- Connexion et import de **dépôts GitHub**
- Affichage des projets open-source directement sur le portfolio

### 📊 Notification & Suivi
- **Notifications** en temps réel (validations, recommandations, commentaires)
- **Historique** complet : connexions, actions, validations, consultations
- Commentaires sur les entités du portfolio

### 🛡️ Certification & Workflow de validation
- Authentification **JWT** (accès + refresh tokens)
- **Rôles et permissions** granulaires (RBAC)
- **Validation en cycle** : chaque entité passe par un workflow de certification
- Stockage sécurisé des fichiers via **MinIO** (S3-compatible)
- Stockage des mots de passe avec **bcryptjs**

---

## 🛠️ Technologies

### Backend
- **Runtime** : Node.js 20+ (ES Modules)
- **Framework** : Express 5
- **ORM** : Prisma 6 + PostgreSQL 16
- **Validation** : Zod 4
- **Auth** : JWT (jsonwebtoken)
- **IA** : Google Generative AI (`@google/genai`)
- **PDF** : Puppeteer
- **Emails** : Nodemailer (SMTP Brevo)
- **Stockage** : MinIO (S3-compatible)
- **Documentation** : Swagger (swagger-autogen + swagger-ui-express)

### Frontend
- **Framework** : Vue 3 (Composition API)
- **Build** : Vite 6
- **State** : Pinia 3
- **Router** : Vue Router 5
- **HTTP** : Axios
- **Validation** : Vuelidate 2
- **Icônes** : Lucide Vue Next

### Infrastructure & DevOps
- **Conteneurisation** : Docker & Docker Compose (multi-stage builds)
- **Proxy** : Nginx
- **CI/CD** : GitLab CI + GitHub Actions
- **Qualité** : SonarQube
- **Sécurité** : OWASP ZAP (DAST), Trivy (vulnérabilités)
- **Provisioning** : Terraform (VMware) + Ansible
- **Monitoring** : Prometheus + Grafana
- **IAM** : Keycloak

---

## 📁 Structure du projet

```
trusty/
├── backend/               # API Express (Node.js)
│   ├── src/
│   │   ├── modules/       # Modules métier (identité, cursus, parcours, portfolio, système)
│   │   ├── shared/        # Middlewares, services, utilitaires
│   │   ├── server.js      # Point d'entrée
│   │   └── app.js         # Configuration Express
│   ├── prisma/            # Schéma BDD, migrations, seed
│   └── tests/             # Tests unitaires, intégration, performance
├── frontend/              # SPA Vue 3
│   ├── src/
│   │   ├── views/         # Pages (Dashboard, Portfolio, Admin, etc.)
│   │   ├── components/    # Composants réutilisables
│   │   ├── stores/        # Stores Pinia
│   │   ├── services/      # Services API
│   │   └── router/        # Configuration des routes
│   └── cypress/           # Tests E2E
├── infrastructure/        # Terraform, Ansible, Monitoring, Nginx
├── docker-compose.yml     # Base (frontend + backend + postgres + minio)
├── docker-compose.dev.yml # Dev overrides
└── docker-compose.prod.yml# Production overrides
```

---

## 🚀 Installation & Démarrage rapide

### Prérequis
- Node.js 20+, npm
- Docker & Docker Compose
- PostgreSQL 16 (ou via Docker)

### 1. Cloner le dépôt
```bash
git clone <url-du-repo>
cd trusty
```

### 2. Configuration des variables d'environnement
```bash
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env
```

### 3. Lancer avec Docker (recommandé)
```bash
docker compose -f docker-compose.yml -f docker-compose.dev.yml up -d
```

### 4. Migrations & seed
```bash
docker compose exec backend npm run db:migrate:dev
docker compose exec backend npm run db:seed:dev
```

### 5. Accès
- **Frontend** : [http://localhost:5173](http://localhost:5173)
- **Backend API** : [http://localhost:3000](http://localhost:3000)
- **Documentation Swagger** : [http://localhost:3000/api-docs](http://localhost:3000/api-docs)

---

## 📜 Scripts principaux

### Backend (`backend/package.json`)
| Commande | Description |
|----------|-------------|
| `npm run dev` | Démarrage en développement (nodemon) |
| `npm run start` | Démarrage en production |
| `npm test` | Tests Jest |
| `npm run lint` | ESLint |
| `npm run swagger` | Génération de la doc Swagger |
| `npm run db:migrate:dev` | Migration Prisma |
| `npm run db:seed:dev` | Seed de la base de données |
| `npm run prisma:generate` | Génération du client Prisma |

### Frontend (`frontend/package.json`)
| Commande | Description |
|----------|-------------|
| `npm run dev` | Serveur de développement Vite |
| `npm run build` | Build production |
| `npm run preview` | Preview du build |
| `npm test` | Tests Vitest |
| `npm run test:e2e` | Tests Cypress (E2E) |
| `npm run lint` | ESLint |

---

## 🌐 Infrastructure & Déploiement

### Architecture VM (4 machines)
| VM | IP | Rôle |
|----|-----|------|
| **VM-Chef** | 192.168.20.10 | DevSecOps Staging |
| **VM-Adjoint** | 192.168.20.11 | DevSecOps Production |
| **VM-Chef-DB** | 192.168.20.12 | PostgreSQL Staging |
| **VM-Adjoint-DB** | 192.168.20.13 | PostgreSQL Production |

### Pipeline CI/CD (8 étapes)
1. **Lint** → ESLint (back + front)
2. **Test** → Jest + Vitest (avec PostgreSQL + MinIO)
3. **Run** → Smoke tests
4. **Security & E2E** → Trivy + Cypress
5. **Build** → Build frontend
6. **SonarQube + ZAP** → Qualité + DAST
7. **Docker** → Build & push des images (Docker Hub)
8. **Deploy** → Déploiement sur VM via SSH

---

## 📊 Monitoring
- **Prometheus** : Métriques backend (port 3000)
- **Grafana** : Tableaux de bord de visualisation

---

---

## 📄 Licence
Projet développé dans le cadre de projet d'intégration **GINF — Génie Informatique**.

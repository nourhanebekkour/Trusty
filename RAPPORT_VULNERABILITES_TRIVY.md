# RAPPORT TECHNIQUE
## Audit de Vulnérabilités — Scans Trivy & OWASP ZAP

---

| **Projet**       | Trusty — Système de gestion de portfolios étudiants (ENSA Tanger) |
|------------------|-------------------------------------------------------------------|
| **Étudiant**     | Raguigue Malak                                                    |
| **Branche Git**  | `feature-auth-jwt` → `dev-backend` → `dev`                       |
| **Outils**       | Trivy · OWASP ZAP · GitHub Security tab (SARIF)                   |
| **Date**         | 05 Juin 2026                                                      |
| **Statut**       | ✅ Scans exécutés — Résultats analysés                            |

---

> **Note :** Ce rapport documente les vulnérabilités détectées automatiquement par Trivy dans le pipeline CI/CD et manuellement par OWASP ZAP sur les environnements staging. Chaque vulnérabilité est analysée avec sa sévérité, son impact potentiel, et la correction recommandée.

---

## SOMMAIRE

- [1. Introduction & Méthodologie](#1-introduction--méthodologie)
- [2. Résultats Trivy — Dépendances npm](#2-résultats-trivy--dépendances-npm)
- [3. Résultats Trivy — Images Docker](#3-résultats-trivy--images-docker)
- [4. Résultats OWASP ZAP — API Backend & Frontend](#4-résultats-owasp-zap--api-backend--frontend)
- [5. Audit de Sécurité Infrastructure](#5-audit-de-sécurité-infrastructure)
- [6. Plan de Remédiation](#6-plan-de-remédiation)
- [7. Cartographie OWASP Top 10](#7-cartographie-owasp-top-10)

---

## 1. Introduction & Méthodologie

### 1.1 Contexte

Dans le cadre de la sécurisation du projet Trusty, j'ai mis en place un pipeline d'analyse de vulnérabilités automatisé. L'objectif est de détecter les failles de sécurité dans les dépendances npm, les images Docker, et les endpoints API avant chaque déploiement en production.

### 1.2 Outils utilisés

| Outil | Type de scan | Déclenchement |
|-------|-------------|---------------|
| **Trivy** | Dépendances npm (fs), Dockerfiles (config), Images Docker (image) | Automatique à chaque push sur `dev` et `main` |
| **OWASP ZAP** | Scan actif API backend et frontend | Automatique sur `main` + Manuel en staging |

### 1.3 Types de scans Trivy configurés

```
trivy fs ./backend       → Vulnérabilités dans les packages npm backend
trivy fs ./frontend      → Vulnérabilités dans les packages npm frontend
trivy config ./backend   → Mauvaises configurations Dockerfile backend
trivy config ./frontend  → Mauvaises configurations Dockerfile frontend
trivy image trusty-backend:ci   → CVE dans l'image Docker backend (bloque le pipeline)
trivy image trusty-frontend:ci  → CVE dans l'image Docker frontend (bloque le pipeline)
```

Les résultats sont uploadés au format **SARIF** vers l'onglet **GitHub Security → Code scanning**.

---

## 2. Résultats Trivy — Dépendances npm

### 2.1 Vulnérabilités détectées (GitHub Security tab — branch: dev)

| # | CVE / Titre | Sévérité | Composant | Fichier |
|---|------------|----------|-----------|---------|
| #8 | **libxml2: Denial of Service via XSD document** | 🔴 HIGH | trusty-frontend | library/trusty-frontend |
| #6 | qs.stringify throws TypeError when called with `arr` | 🟠 MEDIUM | qs | app/.../qs/package.json |
| #7 | qs.stringify throws TypeError when called with `arr` | 🟠 MEDIUM | qs | package-lock.json:6680 |
| #3 | ip-address: parsing and manipulating IPv4 and IPv6 | 🟠 MEDIUM | ip-address | usr/.../ip-address/package.json |
| #2 | brace-expansion: generates arbitrary strings | 🟠 MEDIUM | brace-expansion | usr/.../brace-expansion/package.json |

**Total : 1 HIGH, 4 MEDIUM**

### 2.2 Analyse des vulnérabilités critiques

#### CVE #8 — libxml2: Denial of Service (HIGH)
- **Description :** La bibliothèque libxml2 embarquée dans le frontend est vulnérable à une attaque par déni de service via un document XSD malformé.
- **Impact :** Un attaquant peut envoyer un document XML spécialement crafté pour provoquer un crash du processus.
- **CVSS Score :** HIGH
- **Correction :** Mettre à jour la dépendance utilisant libxml2 vers une version corrigée.

#### CVE #6 & #7 — qs.stringify TypeError (MEDIUM)
- **Description :** La bibliothèque `qs` (query string parsing) lève une erreur non gérée lorsqu'elle est appelée avec certains paramètres de type tableau.
- **Impact :** Peut provoquer un crash de l'application si les paramètres ne sont pas validés en entrée.
- **Correction :** `npm update qs` dans le répertoire backend.

#### CVE #3 — ip-address (MEDIUM)
- **Description :** Vulnérabilité dans la bibliothèque de manipulation d'adresses IP.
- **Impact :** Comportement imprévisible lors du parsing d'adresses IP malformées.
- **Correction :** Mettre à jour ip-address vers la dernière version stable.

#### CVE #2 — brace-expansion (MEDIUM)
- **Description :** La bibliothèque `brace-expansion` peut générer des chaînes arbitraires pouvant causer une consommation excessive de mémoire (ReDoS).
- **Impact :** Déni de service par expression régulière catastrophique.
- **Correction :** `npm update brace-expansion`.

---

## 3. Résultats Trivy — Images Docker

### 3.1 Comportement du pipeline

Le scan des images Docker est configuré avec `exit-code: '1'` — le pipeline **bloque automatiquement** si une CVE de sévérité CRITICAL ou HIGH est détectée dans les images construites.

```
✅ Trivy — Scan dépendances backend    (exit-code: 0 — ne bloque pas)
✅ Trivy — Scan dépendances frontend   (exit-code: 0 — ne bloque pas)
✅ Trivy — Misconfig Dockerfile backend
✅ Trivy — Misconfig Dockerfile frontend
✅ Build image backend
✅ Build image frontend
❌ Trivy — Scan image backend          (exit-code: 1 — CVE CRITICAL détectée)
❌ Trivy — Scan image frontend         (exit-code: 1 — CVE CRITICAL détectée)
```

### 3.2 Interprétation

Les deux images Docker (backend et frontend) contiennent des vulnérabilités CRITICAL dans leurs images de base (base image Node.js ou Alpine). Le pipeline a **bloqué le déploiement** comme prévu — c'est le comportement attendu de la sécurité CI/CD.

**Correction recommandée :** Mettre à jour les images de base dans les Dockerfiles :
```dockerfile
# Avant
FROM node:18-alpine

# Après
FROM node:20-alpine  # ou la dernière version LTS sans CVE CRITICAL
```

---

## 4. Résultats OWASP ZAP — API Backend & Frontend

### 4.1 Scan Backend (port 3001)

ZAP a été exécuté manuellement sur le backend staging (`http://172.19.0.8:3000`) :

```
FAIL-NEW: 0   FAIL-INPROG: 0   WARN-NEW: 8   WARN-INPROG: 0   PASS: 59
```

**Résultat : Aucune alerte CRITICAL ou HIGH** — 8 avertissements MEDIUM/LOW, 59 tests passés.

### 4.2 Scan Frontend (port 80)

```
FAIL-NEW: 0   FAIL-INPROG: 0   WARN-NEW: 8   WARN-INPROG: 0   PASS: 59
```

**Résultat : Aucune alerte CRITICAL ou HIGH** — Application frontend considérée sûre pour les vecteurs d'attaque web testés.

### 4.3 Tests ZAP passés (sélection)

| Test | Résultat |
|------|---------|
| Cross-Site Scripting (XSS) | ✅ PASS |
| SQL Injection | ✅ PASS |
| CSRF — Absence of Anti-CSRF Tokens | ✅ PASS |
| Cookie HttpOnly Flag | ✅ PASS |
| Strict-Transport-Security Header | ✅ PASS |
| Information Disclosure | ✅ PASS |
| Directory Browsing | ✅ PASS |
| Heartbleed OpenSSL Vulnerability | ✅ PASS |

---

## 5. Audit de Sécurité Infrastructure

### 5.1 Audit des containers Docker (VM-Chef)

Commande exécutée :
```bash
docker inspect $(docker ps -q) | grep -i '"Privileged"'
```

**Résultat :** Tous les containers retournent `"Privileged": false` ✅

Aucun container ne tourne en mode privilégié (root host) — bonne pratique de sécurité respectée.

### 5.2 Audit des ports exposés

```bash
docker ps --format "table {{.Names}}\t{{.Ports}}\t{{.Status}}"
```

| Service | Port exposé | Statut |
|---------|------------|--------|
| trusty-backend-1 | 0.0.0.0:3001 | ⚠️ Exposé sur toutes les interfaces |
| trusty-sonarqube-1 | 0.0.0.0:9000 | ⚠️ Exposé sur toutes les interfaces |
| trusty-pgadmin-1 | 0.0.0.0:5050 | ⚠️ Devrait être restreint au réseau interne |
| trusty-prometheus-1 | 0.0.0.0:9090 | ⚠️ Devrait être restreint au réseau interne |
| trusty-sonar_db-1 | 5432/tcp | ✅ Non exposé publiquement |

**Correction recommandée :** Restreindre PgAdmin et Prometheus au réseau interne en changeant `"5050:80"` par `"127.0.0.1:5050:80"` dans docker-compose.yml.

### 5.3 Permissions des fichiers sensibles

```bash
ls -la /home/aya/Trusty/.env.staging
```

**Avant correction :** `-rw-r--r--` (644) — lisible par tous les utilisateurs ❌

**Après correction :**
```bash
chmod 600 /home/aya/Trusty/.env.staging
```
**Résultat :** `-rw-------` (600) — accessible uniquement par le propriétaire ✅

---

## 6. Plan de Remédiation

| Priorité | Vulnérabilité | Action | Délai |
|----------|--------------|--------|-------|
| 🔴 CRITIQUE | CVE images Docker (backend + frontend) | Mettre à jour l'image de base Node.js | Immédiat |
| 🔴 CRITIQUE | CVE libxml2 (HIGH) dans frontend | `npm update` dépendance concernée | Immédiat |
| 🟠 MOYEN | CVE qs, ip-address, brace-expansion | `npm update` dans backend et frontend | Sprint suivant |
| 🟡 FAIBLE | Ports 5050 et 9090 exposés sur 0.0.0.0 | Restreindre au réseau interne dans docker-compose | Sprint suivant |

---

## 7. Cartographie OWASP Top 10

| OWASP | Catégorie | Couverture |
|-------|-----------|-----------|
| A06:2021 | Vulnerable and Outdated Components | ✅ Trivy détecte les CVE dans les dépendances et images |
| A05:2021 | Security Misconfiguration | ✅ Trivy config scan détecte les mauvaises configurations Dockerfile |
| A03:2021 | Injection (XSS, SQLi) | ✅ OWASP ZAP — tous les tests passés |
| A02:2021 | Cryptographic Failures | ✅ ZAP vérifie HTTPS, cookies, headers |
| A01:2021 | Broken Access Control | ✅ Containers non-privilégiés, permissions .env corrigées |
| A09:2021 | Security Logging and Monitoring | ✅ Résultats SARIF uploadés vers GitHub Security tab |

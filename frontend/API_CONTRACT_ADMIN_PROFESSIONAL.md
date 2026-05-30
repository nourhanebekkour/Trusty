# API Contract Admin / Professional

Ce fichier liste uniquement les APIs manquantes cote backend pour finaliser les ecrans admin et professionnel sans modifier le backend existant.

## 1. Registre admin des portfolios

- Nom fonctionnel: lister les portfolios pour l'administration
- Methode HTTP: `GET`
- Endpoint propose: `/api/portfolios`
- Parametres: `status_validation?`, `est_publie?`, `search?`, `page?`, `limit?`
- Body attendu: aucun
- Reponse attendue:

```json
{
  "success": true,
  "data": [
    {
      "id_portfolio": "string",
      "id_etudiant": "string",
      "id_modele": "string | null",
      "titre_personnalise": "string | null",
      "sous_titre": "string | null",
      "url_publique": "string | null",
      "nombre_vues": 0,
      "nombre_recommandations": 0,
      "est_publie": false,
      "date_creation": "DateTime",
      "date_derniere_maj": "DateTime | null",
      "date_publication": "DateTime | null",
      "etudiant": {
        "id_etudiant": "string",
        "utilisateur": {
          "id_utilisateur": "string",
          "nom": "string",
          "prenom": "string",
          "email": "string",
          "ecole": "Ecole | null"
        }
      },
      "modele": {
        "id_modele": "string",
        "nom": "string"
      }
    }
  ]
}
```

- Erreurs possibles: `401` non authentifie, `403` role non `ADMINISTRATEUR`, `500` erreur serveur
- Modeles Prisma concernes: `Portfolio`, `Etudiant`, `Utilisateur`, `ModelePortfolio`
- Attributs Prisma a utiliser: `id_portfolio`, `id_etudiant`, `id_modele`, `titre_personnalise`, `sous_titre`, `url_publique`, `nombre_vues`, `nombre_recommandations`, `est_publie`, `date_creation`, `date_derniere_maj`, `date_publication`, `nom`, `prenom`, `email`, `ecole`
- Pourquoi necessaire: l'espace admin possede un ecran "Registre global des portfolios", mais aucune route backend n'expose actuellement le modele `Portfolio`.

## 2. Certification admin d'un portfolio

- Nom fonctionnel: certifier ou rejeter un portfolio
- Methode HTTP: `POST`
- Endpoint propose: `/api/portfolios/:id_portfolio/certifier`
- Parametres: `id_portfolio` en path
- Body attendu:

```json
{
  "decision": "VALIDE | REJETE",
  "commentaire": "string | null"
}
```

- Reponse attendue: portfolio mis a jour et historique de validation cree
- Erreurs possibles: `400` decision invalide, `401`, `403`, `404` portfolio introuvable, `500`
- Modeles Prisma concernes: `Portfolio`, `HistoriqueValidation`, `Notification`, `Utilisateur`
- Attributs Prisma a utiliser: `id_portfolio`, `id_etudiant`, `est_publie`, `date_publication`, `type_entite`, `id_entite`, `status_validation`, `commentaires`, `id_validateur`
- Pourquoi necessaire: les projets/stages/activites ont des flux de validation, mais `Portfolio` n'a pas de route permettant a l'administrateur de certifier le portfolio complet.

## 3. Demande de corrections portfolio

- Nom fonctionnel: demander des corrections sur un portfolio
- Methode HTTP: `POST`
- Endpoint propose: `/api/portfolios/:id_portfolio/corrections`
- Parametres: `id_portfolio` en path
- Body attendu:

```json
{
  "commentaire": "string"
}
```

- Reponse attendue: notification envoyee a l'etudiant et trace historique
- Erreurs possibles: `400` commentaire manquant, `401`, `403`, `404`, `500`
- Modeles Prisma concernes: `Portfolio`, `Etudiant`, `Utilisateur`, `Notification`, `HistoriqueAction`
- Attributs Prisma a utiliser: `id_portfolio`, `id_etudiant`, `id_destinataire`, `type_notification`, `titre`, `message`, `lien_action`, `type_action`, `entite_concernee`, `id_entite`, `details`
- Pourquoi necessaire: l'interface admin peut afficher un etat de correction, mais il n'existe pas de route pour notifier proprement l'etudiant.

## 4. Statistiques admin portfolios

- Nom fonctionnel: statistiques de portefeuille admin
- Methode HTTP: `GET`
- Endpoint propose: `/api/portfolios/stats`
- Parametres: `ecole?`, `from?`, `to?`
- Body attendu: aucun
- Reponse attendue:

```json
{
  "success": true,
  "data": {
    "total": 0,
    "publies": 0,
    "brouillons": 0,
    "vues": 0,
    "recommandations": 0
  }
}
```

- Erreurs possibles: `401`, `403`, `500`
- Modeles Prisma concernes: `Portfolio`, `Consultation`, `Recommandation`
- Attributs Prisma a utiliser: `est_publie`, `nombre_vues`, `nombre_recommandations`, `date_creation`, `date_publication`
- Pourquoi necessaire: eviter de calculer les agregats cote frontend et afficher des chiffres fiables.

## 5. Recherche professionnelle de candidats

- Nom fonctionnel: lister les candidats visibles pour un professionnel
- Methode HTTP: `GET`
- Endpoint propose: `/api/professionnels/candidats`
- Parametres: `search?`, `filiere?`, `ecole?`, `competence?`, `page?`, `limit?`
- Body attendu: aucun
- Reponse attendue:

```json
{
  "success": true,
  "data": [
    {
      "id_etudiant": "string",
      "filiere": "string | null",
      "annee": 0,
      "ville": "string | null",
      "biographie": "string | null",
      "objectif_professionnel": "string | null",
      "score_credibilite": 0,
      "niveau_credibilite": "Niveau",
      "visibilite_profil": "VisibiliteProfil",
      "utilisateur": {
        "id_utilisateur": "string",
        "nom": "string",
        "prenom": "string",
        "photo": "string | null",
        "ecole": "Ecole | null"
      },
      "portfolio": {
        "id_portfolio": "string",
        "url_publique": "string | null",
        "est_publie": true
      },
      "competences": []
    }
  ]
}
```

- Erreurs possibles: `401`, `403` role non `PROFESSIONNEL`, `500`
- Modeles Prisma concernes: `Etudiant`, `Utilisateur`, `Portfolio`, `EtudiantCompetence`, `Competence`
- Attributs Prisma a utiliser: `id_etudiant`, `filiere`, `annee`, `ville`, `biographie`, `objectif_professionnel`, `score_credibilite`, `niveau_credibilite`, `visibilite_profil`, `nom`, `prenom`, `photo`, `ecole`, `id_portfolio`, `url_publique`, `est_publie`
- Pourquoi necessaire: le frontend utilise temporairement `/stages` et `/projets` pour deduire des candidats, mais ces routes ne fournissent pas un vrai annuaire professionnel.

## 6. Recommandations emises par le professionnel

- Nom fonctionnel: consulter mes recommandations envoyees
- Methode HTTP: `GET`
- Endpoint propose: `/api/recommandations/mes-recommandations-envoyees`
- Parametres: `status?`, `page?`, `limit?`
- Body attendu: aucun
- Reponse attendue: liste de `Recommandation` avec `cible.utilisateur`
- Erreurs possibles: `401`, `500`
- Modeles Prisma concernes: `Recommandation`, `Etudiant`, `Utilisateur`
- Attributs Prisma a utiliser: `id_recommandation`, `id_etudiant`, `id_recommandeur`, `message`, `status`, `date_creation`, `date_validation`
- Pourquoi necessaire: l'API permet de creer une recommandation, mais pas de recuperer l'historique du professionnel connecte.

## 7. Favoris professionnels

- Nom fonctionnel: sauvegarder des candidats favoris
- Methode HTTP: `GET`, `POST`, `DELETE`
- Endpoint propose: `/api/professionnels/favoris` et `/api/professionnels/favoris/:id_etudiant`
- Parametres: `id_etudiant` en path pour suppression
- Body attendu pour `POST`:

```json
{
  "id_etudiant": "string"
}
```

- Reponse attendue: liste ou favori cree/supprime
- Erreurs possibles: `400`, `401`, `403`, `404`, `409`, `500`
- Modeles Prisma concernes: nouveau modele recommande `ProfessionnelFavori` reliant `id_professionnel` et `id_etudiant`
- Attributs Prisma a utiliser: `id_professionnel`, `id_etudiant`, `date_creation`
- Pourquoi necessaire: l'espace professionnel possede un suivi de candidats, mais aucune persistence backend n'existe actuellement.

## 8. Notifications: suppression et lecture globale

- Nom fonctionnel: gerer les notifications en masse
- Methode HTTP: `PUT`, `DELETE`
- Endpoint propose: `/api/notifications/tout-lire`, `/api/notifications/:id`
- Parametres: `id` en path pour suppression
- Body attendu: aucun
- Reponse attendue: nombre de notifications mises a jour ou suppression confirmee
- Erreurs possibles: `401`, `403`, `404`, `500`
- Modeles Prisma concernes: `Notification`
- Attributs Prisma a utiliser: `id_notification`, `id_destinataire`, `est_lue`, `date_lecture`
- Pourquoi necessaire: le backend expose `GET /notifications` et `PUT /notifications/:id/lire`, mais pas l'action globale ni la suppression.

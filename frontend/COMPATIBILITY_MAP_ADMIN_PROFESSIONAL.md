# Carte de compatibilite admin / professionnel

Ce document aligne les ecrans admin et professionnel avec le backend existant. Le backend et Prisma restent la source de verite.

## Fonctionnalites compatibles avec le backend existant

| Fonctionnalite | Entite backend | Endpoint | Methode | Champs backend attendus | Champs frontend utilises | Incompatibilites trouvees | Correction frontend |
|---|---|---:|---|---|---|---|---|
| Connexion et session | `Utilisateur` | `/api/auth/login`, `/api/auth/me`, `/api/auth/logout` | `POST`, `GET`, `POST` | `email`, `password`; reponse `data` utilisateur | `email`, `password`, `role` | aucune pour les routes protegees | conserver le guard par roles Prisma |
| Validation email | `Utilisateur` | `/api/auth/verify-email` | `POST` | `token` | `token` query string envoye au service | route frontend apportee par `origin/dev` absente du routeur de la branche | ajouter `/verify-email` en route publique |
| Liste utilisateurs admin | `Utilisateur` | `/api/utilisateurs` | `GET` | aucun body | `id_utilisateur`, `nom`, `prenom`, `email`, `role`, `status_compte`, `date_creation` | les maquettes affichent telephone/avatar/ecole, mais l'endpoint liste ne renvoie pas tout | afficher uniquement les champs disponibles, fallback visuel neutre |
| Statut utilisateur | `Utilisateur` | `/api/utilisateurs/:id/statut` | `PATCH` | `status` (`ACTIF`, `INACTIF`, `SUSPENDU`) | `status` | aucune | garder actions activer/suspendre |
| Role utilisateur | `Utilisateur` | `/api/utilisateurs/:id/role` | `PATCH` | `role` (`ETUDIANT`, `PROFESSEUR`, `ADMINISTRATEUR`, `PROFESSIONNEL`) | `role` | action sensible, pas exposee partout dans l'UI | garder dans store, ne pas forcer dans la page si non necessaire |
| Creation administrateur | `Utilisateur`, `Administrateur` | `/api/auth/admin/create-user` | `POST` | `nom`, `prenom`, `email`, `niveau_acces`, `ecole` selon niveau | `firstName`, `lastName`, `email`, `niveau_acces`, `ecole` | endpoint reserve `SUPER_ADMIN`; UI peut etre vue par un admin simple | message d'erreur explicite si `403`, payload strict backend |
| Creation compte non-admin | `Utilisateur`, profils role | `/api/auth/register` | `POST` | `email`, `password`, `nom`, `prenom`, `role`, `ecole?` | formulaire admin de creation | backend accepte seulement `ETUDIANT`, `PROFESSEUR`, `PROFESSIONNEL`; telephone ignore | supprimer champs hors schema du payload |
| File activites admin | `ActiviteParascolaire` | `/api/activites/a-valider` | `GET` | aucun body | `id_activite`, `nom_activite`, `description`, `status_validation`, `date_soumission`, `etudiant` | noms maquette generiques | normaliser en `verificationQueue` |
| Decision activite | `ActiviteParascolaire` | `/api/activites/:id/valider` | `POST` | `decision`, `commentaire?` | `decision`, `commentaire` | aucune | garder `VALIDE`/`REJETE` |
| File professionnels admin | `Professionnel` | `/api/professionnels/en-attente` | `GET` | aucun body | `id_professionnel`, `entreprise`, `poste`, `status_validation`, `date_demande`, `utilisateur` | aucune bloquante | normaliser avec `Professionnel` |
| Decision professionnel | `Professionnel` | `/api/professionnels/:id/valider` | `PATCH` | `action` (`VALIDE`, `REJETE`) | `decision` convertie en `action` | commentaire ignore cote backend | ne pas promettre la persistance du commentaire |
| Notifications | `Notification` | `/api/notifications`, `/api/notifications/:id/lire` | `GET`, `PUT` | `id_notification` en path | `id_notification`, `titre`, `message`, `type_notification`, `est_lue` | pas de suppression ni lecture globale native | lecture globale faite cote frontend par appels individuels |
| Historique admin | `HistoriqueAction` | `/api/historique-actions` | `GET` | aucun body | `id_historique`, `type_action`, `entite_concernee`, `details`, `date_action` | les validations `HistoriqueValidation` ne sont pas exposees ici | afficher l'historique disponible uniquement |
| Creation recommandation pro | `Recommandation` | `/api/recommandations` | `POST` | `id_etudiant`, `message?` | candidat selectionne + texte | pas d'historique des recommandations envoyees | ajouter localement la recommandation envoyee apres succes API |
| Notifications pro | `Notification` | `/api/notifications`, `/api/notifications/:id/lire` | `GET`, `PUT` | `id_notification` | memes champs notification | aucune pour la lecture | reutiliser service notification |
| Candidats pro partiels | `Stage`, `Projet`, `Etudiant` | `/api/stages`, `/api/projets` | `GET` | aucun body | `stage.etudiant`, `project.participations[].etudiant` | ces includes n'exposent pas `utilisateur`; pas de nom/email/photo fiables | afficher des candidats partiels sans donnees demo hardcodees |

## APIs backend manquantes a creer

| Fonctionnalite | Page / maquette | Action frontend | Endpoint manquant | Methode | Payload suggere | Reponse suggeree | Raison | Priorite |
|---|---|---|---:|---|---|---|---|---|
| Registre portfolios admin | Admin - Registre Global des Portfolios | lister, filtrer, paginer les portfolios | `/api/portfolios` | `GET` | query `status_validation?`, `est_publie?`, `search?`, `page?`, `limit?` | `Portfolio[]` avec `etudiant.utilisateur` et `modele` | aucune route portfolio n'est exposee | obligatoire |
| Certification portfolio admin | Admin - Portfolios | certifier/rejeter un portfolio | `/api/portfolios/:id_portfolio/certifier` | `POST` | `{ "decision": "VALIDE|REJETE", "commentaire": "string|null" }` | portfolio mis a jour + historique | necessaire pour action visible dans maquette | obligatoire |
| Corrections portfolio admin | Admin - Portfolios / Validations | demander des corrections | `/api/portfolios/:id_portfolio/corrections` | `POST` | `{ "commentaire": "string" }` | notification creee | feedback et cycle de correction non expose | optionnelle |
| Statistiques portfolios | Admin - Dashboard / Portfolios | afficher agregats fiables | `/api/portfolios/stats` | `GET` | query `ecole?`, `from?`, `to?` | `{ total, publies, brouillons, vues, recommandations }` | eviter calculs approximatifs cote client | amelioration |
| Annuaire candidats pro | Professionnel - candidats a recommander | chercher profils visibles | `/api/professionnels/candidats` | `GET` | query `search?`, `filiere?`, `ecole?`, `competence?`, `page?`, `limit?` | `Etudiant[]` avec `utilisateur`, `portfolio`, `competences` | `/stages` et `/projets` ne renvoient pas les identites utilisateur | obligatoire |
| Recommandations envoyees pro | Professionnel - recommandations emises | consulter historique emis | `/api/recommandations/mes-recommandations-envoyees` | `GET` | query `status?`, `page?`, `limit?` | `Recommandation[]` avec `cible.utilisateur` | l'API actuelle permet de creer mais pas de relire mes envois | obligatoire |
| Favoris professionnels | Professionnel - candidats suivis | sauvegarder/supprimer favoris | `/api/professionnels/favoris` | `GET`, `POST`, `DELETE` | `{ "id_etudiant": "string" }` pour `POST` | favori ou liste de favoris | aucune persistence de favoris cote backend | optionnelle |
| Suppression notification | Admin / Pro notifications | supprimer/archiver une notification | `/api/notifications/:id` | `DELETE` | aucun body | confirmation | maquettes montrent archivage/suppression | optionnelle |
| Lecture globale notifications | Admin / Pro notifications | tout marquer comme lu | `/api/notifications/tout-lire` | `PUT` | aucun body | `{ updated: number }` | aujourd'hui le frontend boucle sur chaque notification | amelioration |


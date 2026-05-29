<template>
  <transition name="modal-fade">
    <div v-if="modelValue" class="modal-overlay" @click.self="$emit('update:modelValue', false)">
      <div class="modal">

        <!-- Header -->
        <div class="modal-header">
          <div class="modal-header-left">
            <span class="modal-icon">{{ editMode ? '✏️' : '🚀' }}</span>
            <h3 class="modal-title">{{ editMode ? 'Modifier le projet' : 'Nouveau Projet' }}</h3>
          </div>
          <button class="modal-close" @click="$emit('update:modelValue', false)">×</button>
        </div>

        <!-- Steps nav -->
        <div class="steps-nav">
          <button
            v-for="(step, i) in steps"
            :key="i"
            class="step-btn"
            :class="{ active: currentStep === i, done: currentStep > i }"
            @click="goToStep(i)"
          >
            <span class="step-num">
              <span v-if="currentStep > i" class="step-check">✓</span>
              <span v-else class="step-icon">{{ stepIcon(i) }}</span>
            </span>
            <span class="step-label">
              <span class="step-label-text">{{ step }}</span>
              <span v-if="i === 2 || i === 3" class="step-optional">opt</span>
            </span>
          </button>
        </div>

        <div class="modal-body">
          <div v-if="modalError" class="modal-error">{{ modalError }}</div>

          <!-- STEP 0: Informations de base -->
          <div v-show="currentStep === 0" class="step-content">
            <div class="form-group">
              <label class="form-label">Titre <span class="required">*</span></label>
                <input v-model="localForm.titre" type="text" class="form-input"
                       :class="fieldClass('titre')"
                       placeholder="Ex: Système de gestion des étudiants…"
                       @blur="touchField('titre')" />
            </div>

            <div class="form-row">
              <div class="form-group">
                <label class="form-label">Type <span class="required">*</span></label>
                <select v-model="localForm.type_projet" class="form-input"
                        :class="fieldClass('type_projet')"
                        @blur="touchField('type_projet')">
                  <option value="">Sélectionner…</option>
                  <option v-for="opt in typeOptions" :key="opt.value" :value="opt.value">
                    {{ opt.label }}
                  </option>
                </select>
              </div>
              <div class="form-group">
                <label class="form-label">Nb. collaborateurs</label>
                <input v-model.number="localForm.nombre_collaborateurs" type="number"
                       min="1" class="form-input" />
              </div>
            </div>

            <div class="form-row">
              <div class="form-group">
                <label class="form-label">Date de début <span class="required">*</span></label>
                <input v-model="localForm.date_debut" type="date" class="form-input"
                       :class="fieldClass('date_debut')"
                       @blur="touchField('date_debut')" />
              </div>
              <div class="form-group">
                <label class="form-label">Date de fin</label>
                <input v-model="localForm.date_fin" type="date" class="form-input" />
              </div>
            </div>

            <div class="form-group">
              <label class="form-label">Description <span class="required">*</span></label>
              <textarea v-model="localForm.description" class="form-input form-textarea"
                        :class="fieldClass('description')"
                        rows="3" placeholder="Décrivez votre projet…"
                        @blur="touchField('description')"></textarea>
            </div>

            <div class="form-group">
              <label class="form-label">Résultats obtenus</label>
              <textarea v-model="localForm.resultats_obtenus" class="form-input form-textarea"
                        rows="2" placeholder="Résultats, métriques, impact…"></textarea>
            </div>

            <div class="form-group">
              <label class="form-label form-label-inline">
                <input v-model="localForm.est_public" type="checkbox" class="form-checkbox" />
                Rendre ce projet public
              </label>
            </div>

            <div class="form-group">
              <label class="form-label">École</label>
              <div class="ecole-display">
                <span v-if="ecoleUtilisateur" class="ecole-badge">{{ ecoleUtilisateur }}</span>
                <span v-else-if="loadingMe" class="ecole-loading">Chargement…</span>
                <span v-else class="ecole-missing">Non détectée</span>
              </div>
            </div>
          </div>

          <!-- STEP 1: Liens -->
          <div v-show="currentStep === 1" class="step-content">
            <div class="section-hint">Optionnel — ajoutez des ressources externes pour ce projet.</div>
            <div class="form-group">
              <label class="form-label"><span class="link-icon">⬡</span> Lien GitHub</label>
              <input v-model="localForm.lien_github" type="url" class="form-input"
                     placeholder="https://github.com/…" />
            </div>
            <div class="form-group">
              <label class="form-label"><span class="link-icon">▶</span> Lien YouTube</label>
              <input v-model="localForm.lien_youtube" type="url" class="form-input"
                     placeholder="https://youtube.com/…" />
            </div>
            <div class="form-group">
              <label class="form-label"><span class="link-icon">◎</span> Lien Démo</label>
              <input v-model="localForm.lien_demo" type="url" class="form-input"
                     placeholder="https://…" />
            </div>
          </div>

          <!-- STEP 4: Création du projet (invisible / auto, création only) -->
          <div v-show="currentStep === 4 && !editMode" class="step-content">
            <div v-if="creatingProject" class="creating-project-overlay">
              <span class="dot-loader big"></span>
              <p class="creating-label">Création du projet en cours…</p>
            </div>
            <div v-else-if="projectCreated" class="created-success">
              <span class="success-icon">✅</span>
              <p>Projet créé avec succès ! Vous pouvez maintenant ajouter des technologies et des fichiers.</p>
            </div>
            <div v-else-if="createError" class="modal-error">
              {{ createError }}
              <button class="btn-retry-inline" @click="createProject">Réessayer</button>
            </div>
          </div>

          <!-- STEP 2: Validateur (optionnel) -->
          <div v-show="currentStep === 2" class="step-content">
            <div class="section-hint">
              <strong>Optionnel</strong> — Sélectionnez le professeur responsable de la validation de ce projet.
              <span v-if="loadingMe" class="hint-loading"> Détection de votre école…</span>
            </div>

            <div v-if="loadingProfesseurs" class="loading-hint">
              <span class="dot-loader"></span> Chargement des professeurs…
            </div>

            <div v-else-if="!loadingProfesseurs && !professeurs.length && selectedEcole" class="empty-hint">
              Aucun professeur trouvé pour <strong>{{ selectedEcole }}</strong>.
            </div>

            <div v-else-if="professeurs.length" class="form-group">
              <label class="form-label">Rechercher</label>
              <div class="search-box" @click.stop>
                <span class="search-icon">🔍</span>
                <input
                  v-model="professeurSearch"
                  type="text"
                  class="form-input search-input"
                  placeholder="Nom ou prénom…"
                  @focus="showProfDropdown = true"
                  @input="showProfDropdown = true"
                />
              </div>

              <div v-if="showProfDropdown" class="dropdown-list" @click.stop>
                <div
                  v-for="prof in filteredProfesseurs"
                  :key="prof.id_professeur"
                  class="dropdown-item"
                  :class="{ selected: localForm.id_validateur === prof.id_professeur }"
                  @click="selectValidateur(prof)"
                >
                  <div class="person-avatar">{{ initials(prof.utilisateur) }}</div>
                  <div class="person-info">
                    <span class="person-name">{{ prof.utilisateur.prenom }} {{ prof.utilisateur.nom }}</span>
                    <span class="person-sub">{{ prof.utilisateur.email }}</span>
                  </div>
                  <span v-if="localForm.id_validateur === prof.id_professeur" class="check-icon">✓</span>
                </div>
              </div>
            </div>

            <transition name="slide-down">
              <div v-if="selectedValidateur" class="selected-card">
                <div class="person-avatar large">{{ initials(selectedValidateur.utilisateur) }}</div>
                <div class="person-info">
                  <span class="person-name">{{ selectedValidateur.utilisateur.prenom }} {{ selectedValidateur.utilisateur.nom }}</span>
                  <span class="person-sub">{{ selectedValidateur.utilisateur.email }} · Validateur</span>
                </div>
                <button class="remove-btn" @click="clearValidateur">×</button>
              </div>
            </transition>

            <!-- Poster le validateur si sélectionné -->
            <div v-if="validateurPosting" class="loading-hint" style="margin-top:12px">
              <span class="dot-loader"></span> Enregistrement du validateur…
            </div>
          </div>

          <!-- STEP 3: Collaborateurs (optionnel) -->
          <div v-show="currentStep === 3" class="step-content">
            <div class="section-hint">
              <strong>Optionnel</strong> — Ajoutez les étudiants participant à ce projet avec leur rôle.
              <span v-if="loadingMe" class="hint-loading"> Détection de votre école…</span>
            </div>

            <!-- Endpoint non disponible : bannière d'avertissement -->
            <div v-if="etudiantsEndpointUnavailable" class="unavailable-hint">
              <span class="unavailable-icon">🔧</span>
              <div>
                <strong>Fonctionnalité en cours de déploiement</strong>
                <p>L'endpoint de recherche des étudiants par école est en cours d'ajout par l'équipe backend. Vous pourrez ajouter des collaborateurs une fois qu'il sera disponible. <button class="btn-retry" @click.prevent="fetchEtudiants">Réessayer</button></p>
              </div>
            </div>

            <div v-else-if="loadingEtudiants" class="loading-hint">
              <span class="dot-loader"></span> Chargement des étudiants…
            </div>

            <div v-if="!loadingEtudiants && !etudiantsEndpointUnavailable && etudiants.length" class="form-group">
              <label class="form-label">Rechercher un étudiant</label>
              <div class="search-box" @click.stop>
                <span class="search-icon">🔍</span>
                <input
                  v-model="etudiantSearch"
                  type="text"
                  class="form-input search-input"
                  placeholder="Nom, prénom, filière…"
                  @focus="showEtudiantDropdown = true"
                  @input="showEtudiantDropdown = true"
                />
              </div>

              <div v-if="showEtudiantDropdown && filteredEtudiants.length" class="dropdown-list" @click.stop>
                <div
                  v-for="et in filteredEtudiants"
                  :key="et.id_etudiant"
                  class="dropdown-item"
                  :class="{ disabled: isCollaborateurAdded(et.id_etudiant) }"
                  @click="openAddCollaborateur(et)"
                >
                  <div class="person-avatar">{{ initials(et.utilisateur) }}</div>
                  <div class="person-info">
                    <span class="person-name">{{ et.utilisateur.prenom }} {{ et.utilisateur.nom }}</span>
                    <span class="person-sub">{{ et.filiere || et.utilisateur.email }}</span>
                  </div>
                  <span v-if="isCollaborateurAdded(et.id_etudiant)" class="badge-already">Ajouté</span>
                </div>
              </div>
            </div>

            <!-- Inline role form -->
            <transition name="slide-down">
              <div v-if="pendingCollaborateur" class="inline-role-form">
                <div class="inline-role-header">
                  <div class="person-avatar">{{ initials(pendingCollaborateur.utilisateur) }}</div>
                  <span>{{ pendingCollaborateur.utilisateur.prenom }} {{ pendingCollaborateur.utilisateur.nom }}</span>
                </div>
                <div class="form-row">
                  <div class="form-group">
                    <label class="form-label">Rôle dans le projet</label>
                    <input v-model="pendingRole" type="text" class="form-input"
                           placeholder="Ex: Développeur Backend…" />
                  </div>
                  <div class="form-group" style="padding-top:22px">
                    <label class="form-label form-label-inline">
                      <input v-model="pendingEstCreateur" type="checkbox" class="form-checkbox" />
                      Créateur
                    </label>
                    <label class="form-label form-label-inline" style="margin-top:6px">
                      <input v-model="pendingEstVisiblePortfolio" type="checkbox" class="form-checkbox" />
                      Visible portfolio
                    </label>
                  </div>
                </div>
                <div class="inline-role-actions">
                  <button class="btn-cancel small" @click="pendingCollaborateur = null">Annuler</button>
                  <button class="btn-submit small" @click="confirmAddCollaborateur">Ajouter</button>
                </div>
              </div>
            </transition>

            <!-- Collaborateurs list -->
            <TransitionGroup v-if="localForm.collaborateurs.length" name="list" tag="div" class="collab-list">
              <div v-for="(c, idx) in localForm.collaborateurs" :key="c.id_etudiant" class="collab-card">
                <div class="person-avatar">{{ initials(c.utilisateur) }}</div>
                <div class="person-info">
                  <span class="person-name">{{ c.utilisateur.prenom }} {{ c.utilisateur.nom }}</span>
                  <span class="person-sub">{{ c.role_joue || 'Rôle non défini' }}</span>
                </div>
                <span v-if="c.est_createur" class="badge-creator">Créateur</span>
                <span v-if="c.est_visible_portfolio" class="badge-portfolio">Portfolio</span>
                <span v-if="c.posting" class="badge-posting">⏳</span>
                <span v-if="c.posted" class="badge-posted">✓</span>
                <button class="remove-btn" @click="removeCollaborateur(idx)">×</button>
              </div>
            </TransitionGroup>
            <div v-else-if="!pendingCollaborateur && !etudiantsEndpointUnavailable" class="empty-hint">
              Aucun collaborateur ajouté.
            </div>
          </div>

          <!-- STEP 5: Technologies (step 4 en mode édition) -->
          <div v-show="currentStep === 5 || (editMode && currentStep === 4)" class="step-content">
            <div class="form-group">
              <label class="form-label">Rechercher une technologie</label>
              <div class="search-box">
                <span class="search-icon">🔍</span>
                <input
                  v-model="techSearch"
                  type="text"
                  class="form-input search-input"
                  placeholder="React, Node.js, PostgreSQL…"
                  @focus="showTechDropdown = true"
                />
              </div>
              <div v-if="loadingTechs" class="loading-hint">
                <span class="dot-loader"></span> Chargement des technologies…
              </div>

              <div v-if="techError" class="modal-error" style="margin-top:8px">
                {{ techError }}
              </div>

              <div v-if="showTechDropdown && filteredTechs.length" class="dropdown-list">
                <div
                  v-for="tech in filteredTechs"
                  :key="tech.id_technologie"
                  class="dropdown-item"
                  :class="{ disabled: isTechAdded(tech.id_technologie) }"
                  @click="openAddTech(tech)"
                >
                  <div class="tech-icon-cell">{{ techEmoji(tech.categorie) }}</div>
                  <div class="person-info">
                    <span class="person-name">{{ tech.nom }}</span>
                    <span class="person-sub">
                      {{ tech.categorie }}{{ tech.sous_categorie ? ' · ' + tech.sous_categorie : '' }}
                    </span>
                  </div>
                  <span v-if="isTechAdded(tech.id_technologie)" class="badge-already">Ajoutée</span>
                </div>
              </div>
            </div>

            <transition name="slide-down">
              <div v-if="pendingTech" class="inline-role-form">
                <div class="inline-role-header">
                  <span class="tech-icon-lg">{{ techEmoji(pendingTech.categorie) }}</span>
                  <span>{{ pendingTech.nom }}</span>
                  <span class="tech-cat-badge">{{ pendingTech.categorie }}</span>
                </div>
                <div class="form-row">
                  <div class="form-group">
                    <label class="form-label">Version <span class="optional">(optionnel)</span></label>
                    <input v-model="pendingTechVersion" type="text" class="form-input"
                           placeholder="Ex: 18.2.0" />
                  </div>
                  <div class="form-group">
                    <label class="form-label">Niveau d'utilisation</label>
                    <select v-model="pendingTechNiveau" class="form-input">
                      <option value="DEBUTANT">🟢 Débutant</option>
                      <option value="INTERMEDIAIRE">🟡 Intermédiaire</option>
                      <option value="AVANCE">🟠 Avancé</option>
                      <option value="EXPERT">🔴 Expert</option>
                    </select>
                  </div>
                </div>
                <div class="inline-role-actions">
                  <button class="btn-cancel small" @click="pendingTech = null">Annuler</button>
                  <button class="btn-submit small" @click="confirmAddTech">Ajouter</button>
                </div>
              </div>
            </transition>

            <TransitionGroup v-if="localForm.technologies.length" name="list" tag="div" class="tech-tags">
              <div v-for="(t, idx) in localForm.technologies" :key="t.id_technologie" class="tech-tag">
                <span class="tech-emoji">{{ techEmoji(t.categorie) }}</span>
                <span class="tech-name">{{ t.nom }}</span>
                <span v-if="t.version" class="tech-version">v{{ t.version }}</span>
                <span class="tech-level" :class="niveauClass(t.niveau_utilisation)">
                  {{ niveauLabel(t.niveau_utilisation) }}
                </span>
                <button class="remove-btn small" @click="removeTech(idx)">×</button>
              </div>
            </TransitionGroup>
            <div v-else-if="!pendingTech" class="empty-hint">Aucune technologie ajoutée.</div>
          </div>

          <!-- STEP 6: Fichiers (step 5 en mode édition) -->
          <div v-show="currentStep === 6 || (editMode && currentStep === 5)" class="step-content">
            <div class="section-hint">
              Ajoutez des fichiers à votre projet (PDF, images, archives…).
            </div>

            <div
              class="upload-zone"
              :class="{ 'drag-over': isDragOver }"
              @dragover.prevent="isDragOver = true"
              @dragleave.prevent="isDragOver = false"
              @drop.prevent="onFileDrop"
              @click="$refs.fileInput.click()"
            >
              <input
                ref="fileInput"
                type="file"
                multiple
                class="file-input-hidden"
                @change="onFileInputChange"
              />
              <div class="upload-zone-inner">
                <span class="upload-icon">📁</span>
                <p class="upload-label">Glissez vos fichiers ici ou <span class="upload-link">cliquez pour parcourir</span></p>
                <p class="upload-hint">Tous types de fichiers acceptés</p>
              </div>
            </div>

            <div v-if="pendingFiles.length" class="files-section">
              <div class="files-section-title">En attente d'upload ({{ pendingFiles.length }})</div>
              <TransitionGroup name="list" tag="div" class="file-list">
                <div v-for="(f, idx) in pendingFiles" :key="'pending-' + idx" class="file-card">
                  <span class="file-type-icon">{{ fileEmoji(f.name) }}</span>
                  <div class="person-info">
                    <span class="person-name">{{ f.name }}</span>
                    <span class="person-sub">{{ formatSize(f.size) }}</span>
                  </div>
                  <button class="remove-btn" @click="removePendingFile(idx)">×</button>
                </div>
              </TransitionGroup>
            </div>

            <div v-if="uploadedFiles.length" class="files-section">
              <div class="files-section-title">Fichiers du projet ({{ uploadedFiles.length }})</div>
              <TransitionGroup name="list" tag="div" class="file-list">
                <div v-for="f in uploadedFiles" :key="f.id_fichier" class="file-card">
                  <span class="file-type-icon">{{ fileEmoji(f.nom_fichier || f.url) }}</span>
                  <div class="person-info">
                    <span class="person-name">{{ f.nom_fichier || 'Fichier' }}</span>
                    <span class="person-sub">{{ f.taille ? formatSize(f.taille) : '' }}</span>
                  </div>
                  <a v-if="f.url" :href="f.url" target="_blank" class="file-link-btn" title="Ouvrir">↗</a>
                  <button
                    class="remove-btn"
                    :class="{ spinning: deletingFileId === f.id_fichier }"
                    @click="deleteUploadedFile(f)"
                    title="Supprimer"
                  >{{ deletingFileId === f.id_fichier ? '…' : '×' }}</button>
                </div>
              </TransitionGroup>
            </div>

            <div v-if="uploadingFiles.length" class="upload-progress-list">
              <div v-for="(uf, idx) in uploadingFiles" :key="idx" class="upload-progress-item">
                <span class="file-type-icon">{{ fileEmoji(uf.name) }}</span>
                <div class="person-info">
                  <span class="person-name">{{ uf.name }}</span>
                  <div class="progress-bar-wrap">
                    <div class="progress-bar" :style="{ width: uf.progress + '%' }"></div>
                  </div>
                </div>
                <span class="progress-pct">{{ uf.progress }}%</span>
              </div>
            </div>

            <div v-if="!pendingFiles.length && !uploadedFiles.length && !uploadingFiles.length" class="empty-hint">
              Aucun fichier ajouté.
            </div>
          </div>

        </div>

        <!-- Footer -->
        <div class="modal-footer">
          <!-- Bouton gauche -->
          <template v-if="currentStep === 0">
            <button class="btn-cancel" @click="$emit('update:modelValue', false)">Annuler</button>
          </template>
          <template v-else-if="currentStep === 4 && !editMode">
            <!-- Pendant la création automatique, pas de retour -->
            <div></div>
          </template>
          <template v-else>
            <button class="btn-cancel" @click="prevStep">← Précédent</button>
          </template>

          <div class="footer-right">
            <span class="step-counter">{{ currentStep + 1 }} / {{ steps.length }}</span>

            <!-- Étape 0 : Suivant (valider infos de base) -->
            <button
              v-if="currentStep === 0"
              class="btn-submit"
              :disabled="!isStep0Valid"
              @click="currentStep++"
            >
              Suivant →
            </button>

            <!-- Étape 1 (Liens) : Suivant → va à Validateur -->
            <button
              v-else-if="currentStep === 1"
              class="btn-submit"
              @click="currentStep++"
            >
              Suivant →
            </button>

            <!-- Étape 2 (Validateur) : optionnelle -->
            <button
              v-else-if="currentStep === 2"
              class="btn-submit"
              @click="currentStep++"
            >
              Suivant →
            </button>

            <!-- Étape 3 (Collaborateurs) : optionnelle → déclenche la création -->
            <button
              v-else-if="currentStep === 3"
              class="btn-submit"
              @click="goToCreateStep"
            >
              Suivant →
            </button>

            <!-- Étape 4 : Création auto (création) ou Technologies (édition) -->
            <template v-else-if="currentStep === 4">
              <template v-if="!editMode">
                <button
                  v-if="createError"
                  class="btn-submit"
                  @click="createProject"
                >
                  Réessayer
                </button>
              </template>
              <button v-else class="btn-submit" @click="goToFichiers">
                Suivant →
              </button>
            </template>

            <!-- Étape 5 : Technologies (création) ou Fichiers (édition) -->
            <template v-else-if="currentStep === 5">
              <button v-if="!editMode" class="btn-submit" @click="goToFichiers">
                Suivant →
              </button>
              <button v-else class="btn-submit btn-finish"
                      :disabled="uploadingFiles.length > 0"
                      @click="finishWithFiles">
                ✓ Terminer
              </button>
            </template>

            <!-- Étape 6 (Fichiers) : Terminer (création only) -->
            <button
              v-else-if="currentStep === 6"
              class="btn-submit btn-finish"
              :disabled="uploadingFiles.length > 0"
              @click="finishWithFiles"
            >
              ✓ Terminer
            </button>
          </div>
        </div>

      </div>
    </div>
  </transition>
</template>

<script>
import { emptyForm } from './projetHelpers'
import api from '@/api'

const ECOLES = ['ENSATanger', 'ENSIAS', 'ENSEM', 'ENSA Marrakech', 'ENSA Agadir', 'ENSA Fès', 'ENSA Oujda']

export default {
  name: 'ProjetFormModal',

  props: {
    modelValue:  { type: Boolean, default: false },
    editMode:    { type: Boolean, default: false },
    initialForm: { type: Object,  default: () => emptyForm() },
    submitting:  { type: Boolean, default: false },
    modalError:  { type: String,  default: null },
    // En mode édition, projetId est fourni dès l'ouverture.
    // En mode création, il sera peuplé ici après l'appel API.
    projetId:    { type: String,  default: null },
  },

  emits: ['update:modelValue', 'submit', 'created'],

  data() {
    return {
      // Steps: 0=Infos, 1=Liens, 2=Création(auto), 3=Validateur, 4=Collaborateurs, 5=Technologies, 6=Fichiers
      currentStep: 0,
      steps: ['Informations', 'Liens', 'Validateur', 'Collaborateurs', 'Création', 'Technologies', 'Fichiers'],

      localForm: {
        ...this.initialForm,
        collaborateurs: this.initialForm?.collaborateurs ?? [],
        technologies:   this.initialForm?.technologies   ?? [],
        id_validateur:  this.initialForm?.id_validateur  ?? null,
      },

      // ID du projet créé (interne, pas forcément fourni par le parent en mode création)
      internalProjetId: this.projetId ?? null,

      // État création
      creatingProject: false,
      projectCreated:  false,
      createError:     null,

      // Validation inline
      touched: {},

      typeOptions: [
        { value: 'MODULE',      label: 'Module' },
        { value: 'INTEGRATION', label: 'Intégration' },
        { value: 'PFA',         label: 'PFA' },
        { value: 'PFE',         label: 'PFE' },
        { value: 'HACKATHON',   label: 'Hackathon' },
        { value: 'PERSONNEL',   label: 'Personnel' },
        { value: 'STAGE',       label: 'Stage' },
        { value: 'AUTRE',       label: 'Autre' },
      ],

      ecoles: ECOLES,

      // ── Utilisateur connecté ──────────────────────────────
      ecoleUtilisateur: '',
      loadingMe: false,

      // ── Professeurs ──────────────────────────────────────
      professeurs: [],
      loadingProfesseurs: false,
      selectedEcole: '',
      professeurSearch: '',
      showProfDropdown: false,
      selectedValidateur: null,
      validateurPosting: false,
      _lastEcoleProfesseurs: '',

      // ── Étudiants ─────────────────────────────────────────
      etudiants: [],
      loadingEtudiants: false,
      // true = endpoint 404/non-dispo (backend pas encore implémenté)
      etudiantsEndpointUnavailable: false,
      selectedEcoleEtudiants: '',
      etudiantSearch: '',
      showEtudiantDropdown: false,
      pendingCollaborateur: null,
      pendingRole: '',
      pendingEstCreateur: false,
      pendingEstVisiblePortfolio: true,
      _lastEcoleEtudiants: '',

      // ── Technologies ──────────────────────────────────────
      technologies: [],
      loadingTechs: false,
      techSearch: '',
      showTechDropdown: false,
      pendingTech: null,
      pendingTechVersion: '',
      pendingTechNiveau: 'INTERMEDIAIRE',

      // ── Fichiers ──────────────────────────────────────────
      pendingFiles: [],
      uploadedFiles: [],
      uploadingFiles: [],
      isDragOver: false,
      deletingFileId: null,
      techError: null,
    }
  },

  computed: {
    isStep0Valid() {
      return !!(this.localForm.titre && this.localForm.type_projet
        && this.localForm.date_debut && this.localForm.description)
    },
    isFormValid() { return this.isStep0Valid },

    activeProjetId() {
      // Préférer le prop (mode édition) puis l'id créé ici
      return this.projetId ?? this.internalProjetId
    },

    filteredProfesseurs() {
      if (!this.professeurSearch) return this.professeurs
      const q = this.professeurSearch.toLowerCase()
      return this.professeurs.filter(p =>
        `${p.utilisateur.nom} ${p.utilisateur.prenom} ${p.utilisateur.email}`.toLowerCase().includes(q)
      )
    },

    filteredEtudiants() {
      if (!this.etudiantSearch) return this.etudiants
      const q = this.etudiantSearch.toLowerCase()
      return this.etudiants.filter(e =>
        `${e.utilisateur?.nom || ''} ${e.utilisateur?.prenom || ''} ${e.filiere || ''} ${e.utilisateur?.email || ''}`.toLowerCase().includes(q)
      )
    },

    filteredTechs() {
      if (!this.techSearch) return this.technologies
      const q = this.techSearch.toLowerCase()
      return this.technologies.filter(t =>
        `${t.nom} ${t.categorie || ''} ${t.sous_categorie || ''}`.toLowerCase().includes(q)
      )
    },
  },

  watch: {
    initialForm(val) {
      this.localForm = {
        ...val,
        collaborateurs: val?.collaborateurs ?? [],
        technologies:   val?.technologies   ?? [],
        id_validateur:  val?.id_validateur  ?? null,
      }
    },

    projetId(id) {
      if (id) this.internalProjetId = id
    },

    currentStep(step) {
      // Étape 2 : Validateur (both modes)
      if (step === 2) {
        if (this.selectedEcole && this.professeurs.length) {
          this.showProfDropdown = true
        } else if (this.selectedEcole && !this.professeurs.length) {
          this.fetchProfesseurs()
        } else if (!this.selectedEcole) {
          this.fetchCurrentUser().then(() => {
            if (this.selectedEcole) this.fetchProfesseurs()
          })
        }
      }
      // Étape 3 : Collaborateurs (both modes)
      if (step === 3) {
        if (!this.etudiantsEndpointUnavailable) {
          if (this.selectedEcoleEtudiants && !this.etudiants.length) {
            this.fetchEtudiants()
          } else if (!this.selectedEcoleEtudiants) {
            this.fetchCurrentUser().then(() => {
              if (this.selectedEcoleEtudiants) this.fetchEtudiants()
            })
          }
        }
      }
      // Technologies: step 5 (création) ou step 4 (édition)
      const techStep = this.editMode ? 4 : 5
      if (step === techStep && !this.technologies.length) {
        this.fetchTechnologies()
      }
      // Fichiers: step 6 (création) ou step 5 (édition)
      const fichierStep = this.editMode ? 5 : 6
      if (step === fichierStep && this.activeProjetId) {
        this.fetchUploadedFiles()
      }
    },
  },

  mounted() {
    document.addEventListener('click', this.handleOutsideClick)
    this.fetchCurrentUser()
    // En mode édition : le projet existe déjà, step 2 (création) peut être sautée
    if (this.editMode && this.projetId) {
      this.projectCreated = true
      // Ajuster les steps pour sauter l'étape "Création"
      this.steps = ['Informations', 'Liens', 'Validateur', 'Collaborateurs', 'Technologies', 'Fichiers']
    }
  },
  beforeUnmount() {
    document.removeEventListener('click', this.handleOutsideClick)
  },

  methods: {
    handleOutsideClick(e) {
      if (
        !e.target.closest('.search-box') &&
        !e.target.closest('.dropdown-list') &&
        !e.target.closest('.inline-role-form') &&
        !e.target.closest('.ecole-row')
      ) {
        if (this.currentStep !== 2 || this.selectedValidateur) {
          this.showProfDropdown = false
        }
        this.showEtudiantDropdown = false
        this.showTechDropdown = false
      }
    },

    touchField(field) {
      this.touched[field] = true
    },
    fieldClass(field) {
      if (!this.touched[field]) return ''
      const val = this.localForm[field]
      return val && (typeof val === 'string' ? val.trim() : val) ? 'is-valid' : 'is-invalid'
    },

    goToStep(i) {
      if (this.editMode) {
        if (i <= this.currentStep || this.isStep0Valid) this.currentStep = i
        return
      }
      // Ne pas aller au-delà de l'étape de création si le projet n'est pas encore créé
      if (i > 4 && !this.activeProjetId) return
      if (i <= this.currentStep || this.isStep0Valid) this.currentStep = i
    },

    prevStep() {
      if (this.editMode) {
        if (this.currentStep > 0) this.currentStep--
        return
      }
      // Sauter l'étape de création quand on revient en arrière
      if ((this.currentStep === 5 || this.currentStep === 6) && this.projectCreated) {
        this.currentStep = 3
        return
      }
      if (this.currentStep > 0) this.currentStep--
    },

    // ─── Passage de l'étape 1 → étape 2 (création) ───────────
    async goToCreateStep() {
      if (this.editMode) {
        // En mode édition, pas de création → juste Suivant
        this.currentStep++
        return
      }
      this.currentStep = 4
      await this.createProject()
    },

    // ─── Création du projet via API ────────────────────────────
    async createProject() {
      this.creatingProject = true
      this.createError = null
      this.projectCreated = false

      const payload = {
        titre:                 this.localForm.titre,
        description:           this.localForm.description,
        type_projet:           this.localForm.type_projet,
        date_debut:            this.localForm.date_debut,
        date_fin:              this.localForm.date_fin        || null,
        lien_github:           this.localForm.lien_github     || null,
        lien_youtube:          this.localForm.lien_youtube    || null,
        lien_demo:             this.localForm.lien_demo       || null,
        resultats_obtenus:     this.localForm.resultats_obtenus || null,
        nombre_collaborateurs: this.localForm.nombre_collaborateurs || null,
        est_public:            this.localForm.est_public      ?? false,
        id_validateur:         this.localForm.id_validateur   || null,
      }

      try {
        const { data } = await api.post('/projets/', payload)
        const projetId = data?.data?.id_projet ?? data?.data?.id
        if (!projetId) throw new Error('ID projet non retourné par l\'API')
        this.internalProjetId = projetId
        this.projectCreated = true
        this.$emit('created', projetId)

        // Poster les collaborateurs collectés avant la création
        if (this.localForm.collaborateurs.length) {
          await Promise.all(this.localForm.collaborateurs.map(c => {
            c.posting = true
            return api.post(`/projets/${projetId}/participants/${c.id_etudiant}`, {
              role_joue:             c.role_joue             || '',
              est_createur:          c.est_createur          ?? false,
              est_visible_portfolio: c.est_visible_portfolio ?? true,
            }).then(() => { c.posted = true })
              .catch(e => { console.error(`Erreur ajout participant ${c.id_etudiant}`, e) })
              .finally(() => { c.posting = false })
          }))
        }

        // Avancer automatiquement vers Technologies après création
        setTimeout(() => { this.currentStep = 5 }, 800)
      } catch (e) {
        console.error('Erreur création projet', e)
        this.createError = e?.response?.data?.message || 'Impossible de créer le projet. Vérifiez votre connexion.'
      } finally {
        this.creatingProject = false
      }
    },

    // ─── Auth/Me ──────────────────────────────────────────────────
    async fetchCurrentUser() {
      if (this.ecoleUtilisateur || this.loadingMe) return Promise.resolve()
      this.loadingMe = true
      try {
        const { data } = await api.get('/auth/me')
        const user = data?.data?.user ?? data?.data
        if (user?.ecole) {
          this.ecoleUtilisateur = user.ecole
          if (!this.selectedEcole) this.selectedEcole = user.ecole
          if (!this.selectedEcoleEtudiants) this.selectedEcoleEtudiants = user.ecole
        }
      } catch (e) {
        console.error('Erreur récupération utilisateur', e)
      } finally {
        this.loadingMe = false
      }
    },

    // ─── Fetch: Professeurs par école ─────────────────────────────
    async fetchProfesseurs() {
      if (!this.selectedEcole) return
      this.loadingProfesseurs = true
      this.professeurs = []
      if (this._lastEcoleProfesseurs !== this.selectedEcole) {
        this.selectedValidateur = null
        this.localForm.id_validateur = null
      }
      this._lastEcoleProfesseurs = this.selectedEcole
      try {
        const { data } = await api.get(`/professeurs/ecole/${encodeURIComponent(this.selectedEcole)}`)
        this.professeurs = Array.isArray(data.data) ? data.data : []
        this.showProfDropdown = true
        if (this.localForm.id_validateur) {
          this.selectedValidateur = this.professeurs.find(
            p => p.id_professeur === this.localForm.id_validateur
          ) ?? null
        }
      } catch (e) {
        console.error('Erreur chargement professeurs', e)
      } finally {
        this.loadingProfesseurs = false
      }
    },

    // ─── Fetch: Étudiants par école ───────────────────────────────
    // NOTE: L'endpoint /api/etudiants/ecole/{ecole} n'est pas encore implémenté.
    // On détecte le 404/500 et on affiche un message explicatif à la place.
    async fetchEtudiants() {
      if (!this.selectedEcoleEtudiants) return
      this.loadingEtudiants = true
      this.etudiantsEndpointUnavailable = false
      if (this._lastEcoleEtudiants !== this.selectedEcoleEtudiants) {
        this.etudiants = []
      }
      this._lastEcoleEtudiants = this.selectedEcoleEtudiants
      try {
        const { data } = await api.get(`/etudiants/ecole/${encodeURIComponent(this.selectedEcoleEtudiants)}`)
        this.etudiants = Array.isArray(data.data) ? data.data : []
        this.etudiantsEndpointUnavailable = false
        this.showEtudiantDropdown = true
      } catch (e) {
        const status = e?.response?.status
        // 404 = endpoint pas encore dispo, 500 = erreur serveur → même traitement
        if (status === 404 || status === 500 || !status) {
          console.warn(`Endpoint /etudiants/ecole non disponible (${status}) — fonctionnalité en attente backend`)
          this.etudiantsEndpointUnavailable = true
        } else {
          console.warn('Étudiants: erreur', status, e?.message)
          this.etudiantsEndpointUnavailable = true
        }
        this.etudiants = []
      } finally {
        this.loadingEtudiants = false
      }
    },

    // ─── Fetch: Technologies ──────────────────────────────────────
    async fetchTechnologies() {
      this.loadingTechs = true
      this.techError = null
      try {
        const { data } = await api.get('/technologies/')
        this.technologies = Array.isArray(data.data) ? data.data : []
        this.showTechDropdown = true
        if (!this.technologies.length) {
          this.techError = 'Aucune technologie trouvée.'
        }
      } catch (e) {
        console.error('Erreur chargement technologies', e)
        this.techError = 'Impossible de charger les technologies. Vérifiez votre connexion.'
      } finally {
        this.loadingTechs = false
      }
    },

    // ─── Validateur ───────────────────────────────────────────────
    selectValidateur(prof) {
      this.localForm.id_validateur = prof.id_professeur
      this.selectedValidateur = prof
      this.showProfDropdown = false
      this.professeurSearch = ''
      // En mode édition, poster immédiatement
      // En création, l'id_validateur est envoyé dans le POST /projets/
      if (this.editMode && this.activeProjetId) {
        this.postValidateur(prof.id_professeur)
      }
    },
    clearValidateur() {
      this.localForm.id_validateur = null
      this.selectedValidateur = null
    },

    async postValidateur(id_validateur) {
      if (!this.activeProjetId) return
      this.validateurPosting = true
      try {
        // Le validateur est envoyé via PUT sur le projet (champ id_validateur)
        await api.put(`/projets/${this.activeProjetId}`, { id_validateur })
      } catch (e) {
        console.error('Erreur enregistrement validateur', e)
      } finally {
        this.validateurPosting = false
      }
    },

    // ─── Collaborateurs ───────────────────────────────────────────
    isCollaborateurAdded(id) {
      return this.localForm.collaborateurs.some(c => c.id_etudiant === id)
    },
    openAddCollaborateur(et) {
      if (this.isCollaborateurAdded(et.id_etudiant)) return
      this.pendingCollaborateur = et
      this.pendingRole = ''
      this.pendingEstCreateur = false
      this.pendingEstVisiblePortfolio = true
      this.showEtudiantDropdown = false
      this.etudiantSearch = ''
    },
    async confirmAddCollaborateur() {
      const collab = {
        id_etudiant:           this.pendingCollaborateur.id_etudiant,
        utilisateur:           this.pendingCollaborateur.utilisateur,
        role_joue:             this.pendingRole,
        est_createur:          this.pendingEstCreateur,
        est_visible_portfolio: this.pendingEstVisiblePortfolio,
        posting: false,
        posted:  false,
      }
      this.localForm.collaborateurs.push(collab)
      this.pendingCollaborateur = null

      // En mode édition (projet déjà existant), poster immédiatement
      // En création, le post sera fait dans createProject()
      if (this.editMode && this.activeProjetId) {
        collab.posting = true
        try {
          await api.post(
            `/projets/${this.activeProjetId}/participants/${collab.id_etudiant}`,
            {
              role_joue:             collab.role_joue             || '',
              est_createur:          collab.est_createur          ?? false,
              est_visible_portfolio: collab.est_visible_portfolio ?? true,
            }
          )
          collab.posted = true
        } catch (e) {
          console.error(`Erreur ajout participant ${collab.id_etudiant}`, e)
        } finally {
          collab.posting = false
        }
      }
    },
    async removeCollaborateur(idx) {
      const c = this.localForm.collaborateurs[idx]
      if (this.activeProjetId && c.posted) {
        try {
          await api.delete(`/projets/${this.activeProjetId}/participants/${c.id_etudiant}`)
        } catch (e) {
          console.error('Erreur suppression participant', e)
        }
      }
      this.localForm.collaborateurs.splice(idx, 1)
    },

    // ─── Technologies ─────────────────────────────────────────────
    isTechAdded(id) {
      return this.localForm.technologies.some(t => t.id_technologie === id)
    },
    openAddTech(tech) {
      if (this.isTechAdded(tech.id_technologie)) return
      this.pendingTech = tech
      this.pendingTechVersion = ''
      this.pendingTechNiveau = 'INTERMEDIAIRE'
      this.showTechDropdown = false
      this.techSearch = ''
    },
    async confirmAddTech() {
      const entry = {
        id_technologie:     this.pendingTech.id_technologie,
        nom:                this.pendingTech.nom,
        categorie:          this.pendingTech.categorie,
        sous_categorie:     this.pendingTech.sous_categorie,
        version:            this.pendingTechVersion || null,
        niveau_utilisation: this.pendingTechNiveau,
      }
      this.localForm.technologies.push(entry)
      this.pendingTech = null
      this.showTechDropdown = true

      // Poster immédiatement (le projet est forcément créé à l'étape 5)
      if (this.activeProjetId) {
        await this.addTechToProjet(entry)
      }
    },
    async removeTech(idx) {
      const tech = this.localForm.technologies[idx]
      if (this.activeProjetId) {
        await this.removeTechFromProjet(tech)
      }
      this.localForm.technologies.splice(idx, 1)
    },

    // ─── Navigation vers fichiers ─────────────────────────────────
    goToFichiers() {
      this.currentStep = this.editMode ? 5 : 6
      if (this.activeProjetId) this.fetchUploadedFiles()
    },

    async finishWithFiles() {
      if (this.pendingFiles.length && this.activeProjetId) {
        await this.uploadPendingFiles()
      }
      if (this.editMode) {
        this.$emit('submit', { ...this.localForm })
      } else {
        this.$emit('update:modelValue', false)
      }
    },

    // ─── Fichiers : fetch liste ───────────────────────────────────
    async fetchUploadedFiles() {
      if (!this.activeProjetId) return
      try {
        const { data } = await api.get(`/projets/${this.activeProjetId}/fichiers`)
        this.uploadedFiles = Array.isArray(data.data) ? data.data : []
      } catch (e) {
        console.error('Erreur chargement fichiers', e)
      }
    },

    onFileDrop(e) {
      this.isDragOver = false
      const files = Array.from(e.dataTransfer.files)
      this.addFiles(files)
    },
    onFileInputChange(e) {
      const files = Array.from(e.target.files)
      this.addFiles(files)
      e.target.value = ''
    },
    addFiles(files) {
      if (this.activeProjetId) {
        this.uploadFiles(files)
      } else {
        this.pendingFiles.push(...files)
      }
    },
    removePendingFile(idx) {
      this.pendingFiles.splice(idx, 1)
    },

    async uploadFiles(files) {
      for (const file of files) {
        const entry = { name: file.name, progress: 0 }
        this.uploadingFiles.push(entry)
        const formData = new FormData()
        formData.append('fichier', file)
        try {
          await api.post(`/projets/${this.activeProjetId}/fichiers`, formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
            onUploadProgress: (e) => {
              entry.progress = Math.round((e.loaded / e.total) * 100)
            },
          })
          await this.fetchUploadedFiles()
        } catch (e) {
          console.error('Erreur upload fichier', e)
        } finally {
          const idx = this.uploadingFiles.indexOf(entry)
          if (idx !== -1) this.uploadingFiles.splice(idx, 1)
        }
      }
    },

    async uploadPendingFiles() {
      const files = [...this.pendingFiles]
      this.pendingFiles = []
      await this.uploadFiles(files)
    },

    async deleteUploadedFile(f) {
      if (!this.activeProjetId) return
      this.deletingFileId = f.id_fichier
      try {
        await api.delete(`/projets/${this.activeProjetId}/fichiers/${f.id_fichier}`)
        this.uploadedFiles = this.uploadedFiles.filter(x => x.id_fichier !== f.id_fichier)
      } catch (e) {
        console.error('Erreur suppression fichier', e)
      } finally {
        this.deletingFileId = null
      }
    },

    // ─── Technologies API ─────────────────────────────────────────
    async addTechToProjet(tech) {
      if (!this.activeProjetId) return
      try {
        await api.post(`/projets/${this.activeProjetId}/technologies/${tech.id_technologie}`, {
          version:            tech.version            || null,
          niveau_utilisation: tech.niveau_utilisation || 'INTERMEDIAIRE',
        })
      } catch (e) {
        console.error('Erreur ajout technologie', e)
      }
    },
    async removeTechFromProjet(tech) {
      if (!this.activeProjetId) return
      try {
        await api.delete(`/projets/${this.activeProjetId}/technologies/${tech.id_technologie}`)
      } catch (e) {
        console.error('Erreur suppression technologie', e)
      }
    },

    // ─── Helpers ──────────────────────────────────────────────────
    stepIcon(i) {
      const icons = ['📋', '🔗', '👤', '👥', '⚡', '🛠️', '📁']
      return icons[i] ?? '○'
    },
    initials(user) {
      if (!user) return '?'
      return `${(user.prenom || '?')[0]}${(user.nom || '?')[0]}`.toUpperCase()
    },

    techEmoji(categorie) {
      const map = {
        FRONTEND: '🎨', BACKEND: '⚙️', DATABASE: '🗄️',
        DEVOPS: '🚀', MOBILE: '📱', IA: '🤖', AI: '🤖',
        SECURITE: '🔒', CLOUD: '☁️', TESTING: '🧪',
        DESIGN: '✏️', AUTRE: '🔧',
      }
      return map[(categorie || '').toUpperCase()] ?? '🔧'
    },

    niveauLabel(n) {
      return { DEBUTANT: 'Débutant', INTERMEDIAIRE: 'Intermédiaire', AVANCE: 'Avancé', EXPERT: 'Expert' }[n] ?? n
    },

    niveauClass(n) {
      return { DEBUTANT: 'lvl-green', INTERMEDIAIRE: 'lvl-yellow', AVANCE: 'lvl-orange', EXPERT: 'lvl-red' }[n] ?? ''
    },

    fileEmoji(name = '') {
      const ext = (name.split('.').pop() || '').toLowerCase()
      const map = {
        pdf: '📄', png: '🖼️', jpg: '🖼️', jpeg: '🖼️', gif: '🖼️', svg: '🖼️',
        zip: '🗜️', rar: '🗜️', '7z': '🗜️',
        mp4: '🎬', mov: '🎬', avi: '🎬',
        mp3: '🎵', wav: '🎵',
        doc: '📝', docx: '📝', txt: '📝',
        xls: '📊', xlsx: '📊', csv: '📊',
        ppt: '📑', pptx: '📑',
      }
      return map[ext] ?? '📎'
    },

    formatSize(bytes) {
      if (!bytes) return ''
      if (bytes < 1024) return bytes + ' B'
      if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
      return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
    },
  },
}
</script>

<style scoped>
/* ════════════════════════════════════════════════════════════
   MODAL — Design moderne, flexible, dynamique
   ════════════════════════════════════════════════════════════ */

/* ── CSS custom properties (design tokens locaux) ────────── */
.modal {
  --accent-weak:   rgba(92, 140, 106, 0.06);
  --accent-light:  rgba(92, 140, 106, 0.10);
  --accent-mid:    rgba(92, 140, 106, 0.15);
  --accent-strong: rgba(92, 140, 106, 0.25);
  --danger-weak:   rgba(239, 68, 68, 0.08);
  --danger-mid:    rgba(239, 68, 68, 0.15);
  --surface-dark:  rgba(13, 43, 43, 0.4);
}

/* ── Overlay ─────────────────────────────────────────────── */
.modal-overlay {
  position: fixed; inset: 0;
  background: rgba(0, 10, 10, 0.55);
  backdrop-filter: blur(8px);
  display: flex; align-items: center; justify-content: center;
  z-index: 1000; padding: 16px;
}

/* ── Modal shell (glassmorphism) ─────────────────────────── */
.modal {
  background: linear-gradient(145deg, var(--color-surface), color-mix(in srgb, var(--color-surface) 95%, #000));
  border-radius: 20px;
  width: 100%; max-width: 640px; max-height: 92vh;
  display: flex; flex-direction: column;
  box-shadow:
    0 0 0 1px rgba(92, 140, 106, 0.08),
    0 8px 32px rgba(0, 0, 0, 0.4),
    0 1px 3px rgba(0, 0, 0, 0.2);
  overflow: hidden;
  border: 1px solid rgba(92, 140, 106, 0.12);
}

/* ── Header ──────────────────────────────────────────────── */
.modal-header {
  position: relative;
  display: flex; align-items: center; justify-content: space-between;
  padding: 20px 24px 16px;
  background: linear-gradient(180deg, rgba(92,140,106,0.08) 0%, transparent 100%);
  border-bottom: 1px solid rgba(92, 140, 106, 0.1);
}
.modal-header::before {
  content: '';
  position: absolute; top: 0; left: 24px; right: 24px;
  height: 3px;
  background: linear-gradient(90deg, var(--color-accent), var(--color-accent-hover), var(--color-accent));
  border-radius: 0 0 3px 3px;
  opacity: .6;
}
.modal-header-left { display: flex; align-items: center; gap: 10px; }
.modal-icon { font-size: 18px; }
.modal-title {
  font-size: 17px; font-weight: 700;
  background: linear-gradient(135deg, var(--color-heading), var(--color-accent-hover));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin: 0; letter-spacing: -.02em;
}
.modal-close {
  background: none; border: none; font-size: 20px; cursor: pointer;
  color: var(--color-text-muted); line-height: 1; padding: 6px 10px;
  border-radius: 8px; transition: all .2s;
}
.modal-close:hover {
  background: rgba(92,140,106,0.12);
  color: var(--color-heading);
  transform: rotate(90deg);
}

/* ── Steps nav (modern animated progress bar) ────────────── */
.steps-nav {
  display: flex; gap: 0; padding: 14px 20px 10px;
  background: linear-gradient(180deg, var(--color-background-mute), rgba(15,36,36,0.6));
  border-bottom: 1px solid rgba(92, 140, 106, 0.08);
  overflow-x: auto; scrollbar-width: none;
  position: relative;
}
.steps-nav::-webkit-scrollbar { display: none; }
.step-btn {
  position: relative;
  display: flex; align-items: center; gap: 0;
  background: none; border: none; cursor: pointer;
  padding: 4px 0 6px; flex: 1; min-width: 0;
  font-size: 11px; color: var(--color-text-subtle);
  white-space: nowrap; transition: all .35s cubic-bezier(.4,0,.2,1);
  flex-direction: column;
}
.step-btn:not(:last-child)::after {
  content: '';
  position: absolute; top: 14px; left: calc(50% + 14px);
  right: calc(-50% + 14px); height: 3px;
  background: linear-gradient(90deg, var(--color-border) 0%, var(--color-border) 100%);
  background-size: 200% 100%;
  background-position: 100% 0;
  transition: all .5s cubic-bezier(.4,0,.2,1);
  border-radius: 2px;
}
.step-btn.active:not(:last-child)::after {
  background: linear-gradient(90deg, var(--color-accent) 0%, var(--color-border) 100%);
  background-position: 0 0;
}
.step-btn.done:not(:last-child)::after {
  background: linear-gradient(90deg, var(--color-accent) 0%, var(--color-accent) 100%);
  background-position: 0 0;
}
.step-num {
  width: 28px; height: 28px; border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  font-size: 12px; font-weight: 700; margin-bottom: 5px;
  background: var(--color-surface-raised); color: var(--color-text-muted);
  border: 2px solid var(--color-border);
  transition: all .4s cubic-bezier(.4,0,.2,1);
  position: relative; z-index: 1;
  overflow: hidden;
}
.step-num::before {
  content: '';
  position: absolute; inset: 0;
  border-radius: 50%;
  background: radial-gradient(circle at center, rgba(92,140,106,.2), transparent 70%);
  opacity: 0;
  transition: opacity .4s;
}
.step-btn .step-check {
  font-size: 14px; font-weight: 700;
  animation: checkPop .35s cubic-bezier(.68,-.55,.27,1.55);
}
@keyframes checkPop {
  0% { transform: scale(0); }
  60% { transform: scale(1.3); }
  100% { transform: scale(1); }
}
.step-btn .step-icon { font-size: 13px; line-height: 1; }
.step-btn.active .step-num {
  background: linear-gradient(135deg, var(--color-accent), var(--color-accent-hover));
  color: #fff;
  border-color: var(--color-accent);
  box-shadow: 0 0 0 4px rgba(92,140,106,.15), 0 2px 8px rgba(92,140,106,.25);
  transform: scale(1.12);
}
.step-btn.active .step-num::before { opacity: 1; }
.step-btn.done .step-num {
  background: var(--color-accent); color: #fff;
  border-color: var(--color-accent);
  box-shadow: 0 0 0 3px rgba(92,140,106,.1);
}
.step-btn:hover:not(.active):not(.done) .step-num {
  border-color: var(--color-accent-hover);
  color: var(--color-accent);
  transform: scale(1.05);
}
.step-label {
  display: flex; align-items: center; gap: 4px;
  max-width: 100%; padding: 0 2px;
}
.step-label-text {
  overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
  font-size: 10px; font-weight: 500; color: var(--color-text-subtle);
  transition: color .3s; letter-spacing: .02em;
}
.step-optional {
  font-size: 7px; font-weight: 700; color: var(--color-text-subtle);
  background: rgba(92,140,106,.1);
  padding: 1px 5px; border-radius: 4px;
  text-transform: uppercase; letter-spacing: .03em;
  flex-shrink: 0;
  line-height: 1.2;
}
.step-btn.active .step-label-text { color: var(--color-accent); font-weight: 600; }
.step-btn.done .step-label-text   { color: var(--color-text-muted); }

/* ── Body ────────────────────────────────────────────────── */
.modal-body {
  flex: 1; overflow-y: auto; padding: 24px 28px;
  background: var(--color-surface);
}
.step-content {
  animation: stepSlideIn .35s cubic-bezier(.4,0,.2,1);
}
@keyframes stepSlideIn {
  from { opacity: 0; transform: translateX(18px); }
  to   { opacity: 1; transform: translateX(0); }
}

.modal-error {
  background: rgba(239,68,68,0.08);
  border: 1px solid rgba(239,68,68,0.2);
  color: #f87171; border-radius: 10px; padding: 12px 16px;
  font-size: 13px; margin-bottom: 16px;
  display: flex; align-items: center; gap: 10px; flex-wrap: wrap;
}
.btn-retry-inline {
  background: rgba(239,68,68,0.12);
  border: 1px solid rgba(239,68,68,0.3);
  color: #f87171; border-radius: 8px; padding: 5px 12px;
  font-size: 12px; cursor: pointer; font-weight: 600;
  transition: background .15s;
}
.btn-retry-inline:hover { background: rgba(239,68,68,0.22); }

.section-hint {
  color: var(--color-text-muted); font-size: 13px; margin-bottom: 16px;
  padding: 12px 16px;
  background: linear-gradient(135deg, rgba(92,140,106,0.06), transparent);
  border-radius: 10px;
  border: 1px solid rgba(92, 140, 106, 0.1);
  line-height: 1.5;
}
.hint-loading { color: var(--color-accent); font-style: italic; font-size: 12px; }

/* ── Étape de création automatique ───────────────────────── */
.creating-project-overlay {
  display: flex; flex-direction: column; align-items: center; justify-content: center;
  gap: 20px; padding: 56px 0; text-align: center;
}
.dot-loader.big {
  width: 40px; height: 40px;
  border: 3px solid rgba(92,140,106,.15);
  border-top-color: var(--color-accent);
  border-right-color: var(--color-accent-hover);
}
.creating-label {
  font-size: 15px; color: var(--color-text-muted); font-weight: 500; margin: 0;
}
.created-success {
  display: flex; flex-direction: column; align-items: center; gap: 16px;
  padding: 40px 0; text-align: center;
  color: var(--color-text-muted); font-size: 14px;
}
.success-icon {
  font-size: 48px;
  animation: successPop .4s cubic-bezier(.68,-.55,.27,1.55);
}
@keyframes successPop {
  0% { transform: scale(0); opacity: 0; }
  60% { transform: scale(1.2); }
  100% { transform: scale(1); opacity: 1; }
}

/* ── Forms ───────────────────────────────────────────────── */
.form-group { margin-bottom: 14px; }
.form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
.form-label {
  display: flex; align-items: center; gap: 4px;
  font-size: 11px; font-weight: 600; text-transform: uppercase;
  letter-spacing: .04em;
  color: var(--color-text-muted); margin-bottom: 5px;
}
.form-label-inline {
  display: flex; align-items: center; gap: 8px; cursor: pointer;
  text-transform: none; letter-spacing: 0; font-size: 13px;
}
.required { color: var(--color-danger); }
.optional { font-weight: 400; color: var(--color-text-subtle); font-size: 10px; text-transform: none; }
.form-input {
  width: 100%; padding: 10px 14px;
  border: 1.5px solid rgba(92, 140, 106, 0.15);
  border-radius: 10px; font-size: 14px; color: var(--color-text);
  background: rgba(13, 43, 43, 0.4);
  transition: all .2s ease;
  box-sizing: border-box;
  backdrop-filter: blur(4px);
}
.form-input::placeholder {
  color: var(--color-text-subtle);
  opacity: .6;
}
.form-input:hover {
  border-color: rgba(92, 140, 106, 0.3);
}
.form-input:focus {
  outline: none; border-color: var(--color-accent);
  background: rgba(13, 43, 43, 0.6);
  box-shadow: 0 0 0 3px rgba(92,140,106,.12), 0 0 20px rgba(92,140,106,.05);
}
.form-input.is-invalid {
  border-color: rgba(239,68,68,.4);
  background: rgba(239,68,68,.04);
  box-shadow: 0 0 0 3px rgba(239,68,68,.08);
}
.form-input.is-valid {
  border-color: rgba(92,140,106,.35);
  background: rgba(92,140,106,.04);
}
.form-textarea { resize: vertical; min-height: 80px; }
.form-checkbox {
  width: 16px; height: 16px;
  accent-color: var(--color-accent); cursor: pointer;
  border-radius: 4px;
}
.link-icon { margin-right: 4px; opacity: .6; }

/* ── Search + Dropdown ───────────────────────────────────── */
.search-box { position: relative; }
.search-icon {
  position: absolute; left: 12px; top: 50%; transform: translateY(-50%);
  font-size: 14px; pointer-events: none; color: var(--color-text-subtle);
}
.search-input { padding-left: 38px !important; }

.dropdown-list {
  border: 1px solid rgba(92, 140, 106, 0.12); border-radius: 12px;
  margin-top: 6px; max-height: 220px; overflow-y: auto;
  background: var(--color-surface-raised);
  box-shadow: 0 8px 30px rgba(0,0,0,.3), 0 0 0 1px rgba(92,140,106,.06);
  position: relative; z-index: 20;
}
.dropdown-item {
  display: flex; align-items: center; gap: 10px;
  padding: 10px 14px; cursor: pointer; transition: all .15s;
  border-bottom: 1px solid rgba(92, 140, 106, 0.06);
}
.dropdown-item:last-child { border-bottom: none; }
.dropdown-item:hover:not(.disabled) {
  background: rgba(92,140,106,0.08);
  transform: translateX(3px);
}
.dropdown-item.selected { background: rgba(92,140,106,0.12); }
.dropdown-item.disabled { opacity: .35; cursor: default; }

/* ── Loading ─────────────────────────────────────────────── */
.loading-hint {
  font-size: 12px; color: var(--color-text-muted); text-align: center; padding: 16px;
  display: flex; align-items: center; justify-content: center; gap: 10px;
}
.dot-loader {
  width: 14px; height: 14px; border-radius: 50%;
  border: 2px solid rgba(92, 140, 106, 0.15);
  border-top-color: var(--color-accent);
  display: inline-block; animation: spin .7s linear infinite;
}
@keyframes spin { to { transform: rotate(360deg) } }

/* ── Person cards ────────────────────────────────────────── */
.person-avatar {
  width: 36px; height: 36px; border-radius: 50%;
  background: linear-gradient(135deg, var(--color-accent), #3a6b4a);
  color: #fff; font-size: 12px; font-weight: 700;
  display: flex; align-items: center; justify-content: center;
  flex-shrink: 0;
  box-shadow: 0 0 0 2px rgba(92,140,106,.15);
}
.person-avatar.large { width: 42px; height: 42px; font-size: 14px; }
.person-info { flex: 1; min-width: 0; }
.person-name {
  display: block; font-size: 13px; font-weight: 600;
  color: var(--color-heading);
}
.person-sub  {
  display: block; font-size: 11px; color: var(--color-text-muted);
  margin-top: 2px; overflow: hidden;
  text-overflow: ellipsis; white-space: nowrap;
}

.selected-card {
  display: flex; align-items: center; gap: 12px;
  padding: 12px 16px;
  background: linear-gradient(135deg, rgba(92,140,106,0.1), rgba(92,140,106,0.04));
  border-radius: 12px; margin-top: 12px;
  border: 1px solid rgba(92, 140, 106, 0.25);
}
.check-icon { color: var(--color-accent); font-size: 16px; font-weight: 700; }
.remove-btn {
  background: none; border: none; cursor: pointer;
  font-size: 18px; color: var(--color-text-muted); padding: 4px 8px;
  border-radius: 6px; line-height: 1; flex-shrink: 0;
  transition: all .15s;
}
.remove-btn:hover {
  color: var(--color-danger);
  background: rgba(239,68,68,0.08);
  transform: scale(1.1);
}

/* ── Inline form ─────────────────────────────────────────── */
.inline-role-form {
  background: linear-gradient(135deg, rgba(92,140,106,0.06), transparent);
  border: 1px solid rgba(92, 140, 106, 0.1);
  border-radius: 12px; padding: 16px; margin: 12px 0;
}
.inline-role-header {
  display: flex; align-items: center; gap: 10px;
  font-size: 14px; font-weight: 600; margin-bottom: 14px;
  color: var(--color-heading);
}
.inline-role-actions { display: flex; justify-content: flex-end; gap: 10px; margin-top: 10px; }

/* ── Collab list ─────────────────────────────────────────── */
.collab-list { display: flex; flex-direction: column; gap: 8px; margin-top: 12px; }
.collab-card {
  display: flex; align-items: center; gap: 10px;
  padding: 10px 14px;
  border: 1px solid rgba(92, 140, 106, 0.1);
  border-radius: 12px;
  background: rgba(13, 43, 43, 0.3);
  transition: all .15s;
}
.collab-card:hover {
  border-color: rgba(92, 140, 106, 0.2);
  transform: translateX(3px);
}
.badge-creator {
  font-size: 10px; font-weight: 700; padding: 3px 8px;
  background: rgba(186,117,23,0.15); color: #f5a623;
  border-radius: 20px; flex-shrink: 0;
}
.badge-portfolio {
  font-size: 10px; font-weight: 700; padding: 3px 8px;
  background: rgba(92,140,106,0.15); color: var(--color-accent-hover);
  border-radius: 20px; flex-shrink: 0;
}
.badge-already {
  font-size: 10px; font-weight: 700; padding: 3px 8px;
  background: rgba(92,140,106,0.08); color: var(--color-text-subtle);
  border-radius: 20px; flex-shrink: 0;
}
.badge-posting {
  font-size: 12px; flex-shrink: 0; animation: spin .7s linear infinite;
}
.badge-posted {
  font-size: 12px; flex-shrink: 0; color: var(--color-accent);
}

/* ── Technologies ────────────────────────────────────────── */
.tech-icon-cell { font-size: 18px; width: 28px; text-align: center; flex-shrink: 0; }
.tech-icon-lg   { font-size: 22px; }
.tech-cat-badge {
  font-size: 10px; padding: 2px 8px; border-radius: 20px;
  background: rgba(92,140,106,0.08); color: var(--color-text-muted); font-weight: 600;
  border: 1px solid rgba(92,140,106,0.1);
}
.tech-tags { display: flex; flex-wrap: wrap; gap: 6px; margin-top: 12px; }
.tech-tag {
  display: flex; align-items: center; gap: 6px;
  padding: 6px 12px;
  background: rgba(92,140,106,0.06);
  border-radius: 20px;
  border: 1px solid rgba(92, 140, 106, 0.1);
  font-size: 13px;
  transition: all .15s;
}
.tech-tag:hover {
  border-color: rgba(92, 140, 106, 0.2);
  background: rgba(92,140,106,0.1);
}
.tech-emoji  { font-size: 14px; }
.tech-name   { font-weight: 600; color: var(--color-heading); }
.tech-version { font-size: 10px; color: var(--color-text-subtle); }
.tech-level {
  font-size: 10px; font-weight: 700; padding: 2px 7px;
  border-radius: 20px; text-transform: uppercase; letter-spacing: .3px;
}
.lvl-green  { background: rgba(92,140,106,0.15); color: var(--color-accent-hover); }
.lvl-yellow { background: rgba(186,117,23,0.15); color: #f5a623; }
.lvl-orange { background: rgba(217,72,31,0.15); color: #f07a4a; }
.lvl-red    { background: rgba(239,68,68,0.12); color: #f87171; }

/* ── Fichiers ────────────────────────────────────────────── */
.file-input-hidden { display: none; }

.upload-zone {
  border: 2px dashed rgba(92, 140, 106, 0.15);
  border-radius: 14px; padding: 32px 20px;
  text-align: center; cursor: pointer;
  background: rgba(92, 140, 106, 0.03);
  transition: all .3s ease;
  margin-bottom: 16px;
  position: relative; overflow: hidden;
}
.upload-zone::before {
  content: '';
  position: absolute; inset: 0;
  background: radial-gradient(circle at center, rgba(92,140,106,.04), transparent 70%);
  opacity: 0; transition: opacity .3s;
}
.upload-zone:hover::before, .upload-zone.drag-over::before { opacity: 1; }
.upload-zone:hover, .upload-zone.drag-over {
  border-color: var(--color-accent);
  background: rgba(92,140,106,0.06);
  transform: translateY(-1px);
}
@keyframes borderPulse {
  0%, 100% { border-color: rgba(92, 140, 106, 0.15); }
  50%      { border-color: rgba(92, 140, 106, 0.35); }
}
.upload-zone.drag-over { animation: borderPulse 1.2s ease infinite; }
.upload-zone-inner { pointer-events: none; position: relative; z-index: 1; }
.upload-icon { font-size: 32px; display: block; margin-bottom: 10px; }
.upload-label { font-size: 13px; color: var(--color-text-muted); margin: 0 0 4px; }
.upload-link { color: var(--color-accent); font-weight: 600; }
.upload-hint { font-size: 11px; color: var(--color-text-subtle); margin: 0; }

.files-section { margin-bottom: 16px; }
.files-section-title {
  font-size: 11px; font-weight: 600; color: var(--color-text-muted);
  margin-bottom: 8px; text-transform: uppercase; letter-spacing: .06em;
}
.file-list { display: flex; flex-direction: column; gap: 6px; }
.file-card {
  display: flex; align-items: center; gap: 10px;
  padding: 10px 14px;
  border: 1px solid rgba(92, 140, 106, 0.1);
  border-radius: 12px;
  background: rgba(13, 43, 43, 0.3);
  transition: all .15s;
}
.file-card:hover {
  border-color: rgba(92, 140, 106, 0.2);
  transform: translateX(3px);
}
.file-type-icon { font-size: 18px; flex-shrink: 0; }
.file-link-btn {
  background: none; border: 1px solid rgba(92,140,106,.15);
  color: var(--color-text-muted); border-radius: 8px;
  padding: 4px 10px; font-size: 13px; cursor: pointer;
  text-decoration: none; flex-shrink: 0;
  transition: all .15s;
}
.file-link-btn:hover {
  border-color: var(--color-accent);
  color: var(--color-accent);
  background: rgba(92,140,106,.06);
}

.upload-progress-list { display: flex; flex-direction: column; gap: 8px; margin-top: 8px; }
.upload-progress-item {
  display: flex; align-items: center; gap: 10px;
  padding: 10px 14px; border: 1px solid rgba(92,140,106,.1);
  border-radius: 12px; background: rgba(13, 43, 43, 0.3);
}
.progress-bar-wrap {
  height: 4px; background: rgba(92,140,106,.1);
  border-radius: 4px; margin-top: 4px; overflow: hidden;
}
.progress-bar {
  height: 100%;
  background: linear-gradient(90deg, var(--color-accent), var(--color-accent-hover));
  border-radius: 4px; transition: width .3s ease;
}
.progress-pct { font-size: 11px; color: var(--color-text-muted); flex-shrink: 0; min-width: 32px; text-align: right; }

/* ── Unavailable hint ────────────────────────────────────── */
.unavailable-hint {
  display: flex; align-items: flex-start; gap: 12px;
  padding: 14px 16px;
  background: rgba(92,140,106,0.04);
  border: 1px solid rgba(92, 140, 106, 0.15);
  border-radius: 12px; margin-bottom: 12px;
}
.unavailable-icon { font-size: 20px; flex-shrink: 0; margin-top: 1px; }
.unavailable-hint strong { display: block; font-size: 13px; color: var(--color-accent); margin-bottom: 3px; }
.btn-retry {
  background: none; border: none; color: var(--color-accent);
  font-size: 12px; font-weight: 600; cursor: pointer;
  text-decoration: underline; padding: 0;
}
.btn-retry:hover { color: var(--color-accent-hover); }
.unavailable-hint p { margin: 0; font-size: 12px; color: var(--color-text-muted); line-height: 1.5; }

/* ── École display ───────────────────────────────────────── */
.ecole-display { display: flex; align-items: center; gap: 10px; }
.ecole-badge {
  font-size: 12px; font-weight: 600; padding: 5px 14px;
  background: linear-gradient(135deg, rgba(92,140,106,0.12), rgba(92,140,106,0.04));
  color: var(--color-accent-hover);
  border-radius: 20px;
  border: 1px solid rgba(92,140,106,0.2);
  letter-spacing: .02em;
}
.ecole-loading { font-size: 12px; color: var(--color-text-muted); font-style: italic; }
.ecole-missing { font-size: 12px; color: var(--color-text-subtle); }

/* ── Empty ───────────────────────────────────────────────── */
.empty-hint {
  font-size: 13px; color: var(--color-text-subtle); text-align: center;
  padding: 24px; border: 1.5px dashed rgba(92,140,106,.15);
  border-radius: 12px; margin-top: 12px;
}

/* ── Footer ──────────────────────────────────────────────── */
.modal-footer {
  display: flex; align-items: center; justify-content: space-between;
  padding: 16px 24px;
  border-top: 1px solid rgba(92, 140, 106, 0.08);
  background: linear-gradient(0deg, rgba(92,140,106,0.04) 0%, transparent 100%);
}
.footer-right { display: flex; align-items: center; gap: 12px; }
.step-counter  {
  font-size: 11px; color: var(--color-text-subtle);
  font-variant-numeric: tabular-nums;
}

.btn-cancel {
  padding: 10px 20px; border-radius: 10px;
  border: 1px solid rgba(92, 140, 106, 0.12);
  background: rgba(92, 140, 106, 0.04);
  color: var(--color-text-muted);
  font-size: 14px; font-weight: 500; cursor: pointer;
  transition: all .2s;
}
.btn-cancel:hover {
  background: rgba(92, 140, 106, 0.1);
  border-color: rgba(92, 140, 106, 0.25);
  color: var(--color-heading);
  transform: translateY(-1px);
}
.btn-cancel.small { padding: 7px 14px; font-size: 13px; }

.btn-submit {
  padding: 10px 22px; border-radius: 10px; border: none;
  background: linear-gradient(135deg, var(--color-accent), var(--color-accent-hover));
  color: #fff; font-size: 14px; font-weight: 600;
  cursor: pointer; display: flex; align-items: center; gap: 8px;
  transition: all .2s;
  box-shadow: 0 2px 8px rgba(92,140,106,.2);
}
.btn-submit:hover:not(:disabled) {
  background: linear-gradient(135deg, var(--color-accent-hover), var(--color-accent));
  box-shadow: 0 4px 16px rgba(92,140,106,.3);
  transform: translateY(-1px);
}
.btn-submit:disabled {
  opacity: .35; cursor: not-allowed;
  box-shadow: none;
}
.btn-submit.small { padding: 7px 16px; font-size: 13px; }
.btn-finish {
  background: linear-gradient(135deg, var(--color-accent), #3a6b4a);
}
.btn-finish:hover:not(:disabled) {
  background: linear-gradient(135deg, #3a6b4a, var(--color-accent));
}

.btn-spinner {
  width: 14px; height: 14px; border-radius: 50%;
  border: 2px solid rgba(255,255,255,.3);
  border-top-color: #fff;
  border-right-color: rgba(255,255,255,.6);
  animation: spin .6s linear infinite;
}

/* ── TransitionGroup list animations ─────────────────────── */
.list-enter-active,
.list-leave-active {
  transition: all .35s cubic-bezier(.4,0,.2,1);
}
.list-enter-from {
  opacity: 0; transform: translateX(-16px) scale(.95);
}
.list-leave-to {
  opacity: 0; transform: translateX(16px) scale(.95);
}
.list-move {
  transition: transform .35s cubic-bezier(.4,0,.2,1);
}

/* ── Transitions ─────────────────────────────────────────── */
.slide-down-enter-active, .slide-down-leave-active {
  transition: all .25s cubic-bezier(.4,0,.2,1);
}
.slide-down-enter-from, .slide-down-leave-to {
  opacity: 0; transform: translateY(-8px);
}

.modal-fade-enter-active, .modal-fade-leave-active {
  transition: all .3s cubic-bezier(.4,0,.2,1);
}
.modal-fade-enter-from, .modal-fade-leave-to { opacity: 0; }
.modal-fade-enter-from .modal, .modal-fade-leave-to .modal {
  transform: scale(.94) translateY(16px);
}

/* ── Responsive ──────────────────────────────────────────── */
@media (max-width: 640px) {
  .modal { max-width: 100%; border-radius: 16px; margin: 8px; max-height: 94vh; }
  .modal-body { padding: 18px 16px; }
  .modal-header { padding: 16px 16px 12px; }
  .modal-footer { padding: 14px 16px; }
  .form-row { grid-template-columns: 1fr; gap: 8px; }
  .steps-nav { padding: 10px 12px 8px; gap: 0; }
  .step-btn { font-size: 10px; }
  .step-num { width: 24px; height: 24px; font-size: 11px; }
  .step-label { font-size: 9px; }
  .step-optional { display: none; }
  .btn-cancel, .btn-submit { padding: 8px 16px; font-size: 13px; }
  .upload-zone { padding: 24px 16px; }
  .inline-role-form { padding: 12px; }
  .dropdown-list { max-height: 180px; }
}

/* ── Micro-interactions ──────────────────────────────────── */
.btn-submit:active:not(:disabled) { transform: translateY(0) scale(.98); }
.btn-cancel:active { transform: translateY(0) scale(.98); }

.tech-tag, .collab-card, .file-card {
  transition: all .2s cubic-bezier(.4,0,.2,1);
}
.tech-tag:hover, .collab-card:hover, .file-card:hover {
  transform: translateX(4px);
  box-shadow: 0 2px 8px rgba(0,0,0,.15);
}

.dropdown-item {
  transition: all .15s cubic-bezier(.4,0,.2,1);
}
.dropdown-item:hover:not(.disabled) {
  background: rgba(92,140,106,0.08);
  transform: translateX(4px);
  padding-left: 18px;
}

.form-input { transition: all .25s cubic-bezier(.4,0,.2,1); }
</style>
<template>
  <transition name="modal-fade">
    <div v-if="modelValue" class="modal-overlay" @click.self="$emit('update:modelValue', false)">
      <div class="modal">

        <!-- Header -->
        <div class="modal-header">
          <div class="modal-header-left">
            <span class="modal-icon">{{ editMode ? '✏️' : '💼' }}</span>
            <h3 class="modal-title">{{ editMode ? 'Modifier le stage' : 'Nouveau Stage' }}</h3>
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
            :disabled="viewMode"
          >
            <span class="step-num">
              <span v-if="currentStep > i" class="step-check">✓</span>
              <span v-else class="step-icon">{{ stepIcon(i) }}</span>
            </span>
            <span class="step-label">
              <span class="step-label-text">{{ step }}</span>
            </span>
          </button>
        </div>

        <div class="modal-body">
          <div v-if="modalError" class="modal-error">{{ modalError }}</div>

          <div :key="'step-' + currentStep" class="step-content">

            <!-- STEP 0: Informations -->
            <div v-if="currentStep === 0">
              <div class="form-row">
                <div class="form-group">
                  <label class="form-label">Entreprise <span class="required">*</span></label>
                  <input v-model="localForm.entreprise" type="text" class="form-input" :readonly="viewMode"
                         :class="fieldClass('entreprise')"
                         placeholder="Ex: TechFlow Solutions"
                         @blur="touchField('entreprise')" />
                </div>
                <div class="form-group">
                  <label class="form-label">Poste <span class="required">*</span></label>
                  <input v-model="localForm.poste" type="text" class="form-input" :readonly="viewMode"
                         :class="fieldClass('poste')"
                         placeholder="Ex: Développeur Full Stack"
                         @blur="touchField('poste')" />
                </div>
              </div>

              <div class="form-group">
                <label class="form-label">Adresse entreprise</label>
                <input v-model="localForm.adresse_entreprise" type="text" class="form-input" :readonly="viewMode"
                       placeholder="Ex: Casablanca, Maroc" />
              </div>

              <div class="form-row">
                <div class="form-group">
                  <label class="form-label">Date de début <span class="required">*</span></label>
                  <input v-model="localForm.date_debut" type="date" class="form-input" :readonly="viewMode"
                         :class="fieldClass('date_debut')"
                         @blur="touchField('date_debut')" />
                </div>
                <div class="form-group">
                  <label class="form-label">Date de fin</label>
                  <input v-model="localForm.date_fin" type="date" class="form-input" :readonly="viewMode" />
                </div>
              </div>

              <div class="form-row">
                <div class="form-group">
                  <label class="form-label">Durée (semaines)</label>
                  <input v-model.number="localForm.duree_semaines" type="number" min="1" class="form-input" :readonly="viewMode"
                         placeholder="Ex: 8" />
                </div>
                <div class="form-group">
                  <label class="form-label">Visibilité</label>
                  <select v-model="localForm.est_public" class="form-input" :disabled="viewMode">
                    <option :value="true">Public</option>
                    <option :value="false">Privé</option>
                  </select>
                </div>
              </div>

              <div class="form-group">
                <label class="form-label">Encadrant professionnel</label>
                <input v-model="localForm.encadrant_professionnel" type="text" class="form-input" :readonly="viewMode"
                       placeholder="Nom de l'encadrant en entreprise" />
              </div>

              <div class="form-group">
                <label class="form-label">Encadrant académique <span class="optional">(optionnel)</span></label>
                <input v-model="localForm.encadrant_academique" type="text" class="form-input" :readonly="viewMode"
                       placeholder="Nom du professeur tuteur (ou sélectionnez à l'étape suivante)" />
              </div>

              <div class="form-group">
                <label class="form-label">Missions <span class="required">*</span></label>
                <textarea v-model="localForm.missions" class="form-input form-textarea" :readonly="viewMode"
                          :class="fieldClass('missions')"
                          rows="4" placeholder="Décrivez vos missions…"
                          @blur="touchField('missions')"></textarea>
              </div>
            </div>

            <!-- STEP 1: Validateur -->
            <div v-if="currentStep === 1">
              <div class="section-hint">
                Sélectionnez le professeur qui validera ce stage.
                <span v-if="ecoleLoading" class="hint-loading"> Détection de votre école…</span>
              </div>

              <div v-if="loadingProfesseurs" class="loading-hint">
                <span class="dot-loader"></span> Chargement des professeurs…
              </div>

              <div v-else-if="!loadingProfesseurs && !professeurs.length && selectedEcole" class="empty-hint">
                Aucun professeur trouvé pour <strong>{{ selectedEcole }}</strong>.
              </div>

              <div v-else-if="professeurs.length" class="form-group">
                <label class="form-label">Rechercher un professeur</label>
                <div class="search-box" @click.stop>
                  <span class="search-icon">🔍</span>
                  <input
                    v-model="profSearch"
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
                    @click="viewMode ? null : selectValidateur(prof)"
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
                  <button class="remove-btn" :disabled="viewMode" @click="clearValidateur">×</button>
                </div>
              </transition>

              <div v-if="stageCreating" class="loading-hint" style="margin-top:12px">
                <span class="dot-loader"></span> Création du stage en cours…
              </div>
            </div>

            <!-- STEP 2: Technologies -->
            <div v-if="currentStep === 2">
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
                    @click="viewMode ? null : openAddTech(tech)"
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
                      <input v-model="pendingTechVersion" type="text" class="form-input" :readonly="viewMode"
                             placeholder="Ex: 18.2.0" />
                    </div>
                    <div class="form-group">
                      <label class="form-label">Niveau d'utilisation</label>
                      <select v-model="pendingTechNiveau" class="form-input" :disabled="viewMode">
                        <option value="DEBUTANT">🟢 Débutant</option>
                        <option value="INTERMEDIAIRE">🟡 Intermédiaire</option>
                        <option value="AVANCE">🟠 Avancé</option>
                        <option value="EXPERT">🔴 Expert</option>
                      </select>
                    </div>
                  </div>
                  <div class="inline-role-actions">
                    <button class="btn-cancel small" @click="pendingTech = null" :disabled="viewMode">Annuler</button>
                    <button class="btn-submit small" @click="confirmAddTech" :disabled="viewMode">Ajouter</button>
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

            <!-- STEP 3: Rapport -->
            <div v-if="currentStep === 3">
              <div class="section-hint">
                Ajoutez votre rapport de stage (format PDF uniquement).
              </div>

              <div
                class="upload-zone"
                :class="{ 'drag-over': isDragOver }"
                @dragover.prevent="isDragOver = true"
                @dragleave.prevent="isDragOver = false"
                @drop.prevent="onRapportDrop"
                @click="viewMode ? null : $refs.rapportInput.click()"
              >
                <input
                  ref="rapportInput"
                  type="file"
                  accept=".pdf,application/pdf"
                  class="file-input-hidden"
                  @change="onRapportInputChange"
                />
                <div class="upload-zone-inner">
                  <span class="upload-icon">📄</span>
                  <p class="upload-label">Glissez votre rapport ici ou <span class="upload-link">cliquez pour parcourir</span></p>
                  <p class="upload-hint">PDF uniquement</p>
                </div>
              </div>

              <div v-if="rapportUploading" class="upload-progress-list">
                <div class="upload-progress-item">
                  <span class="file-type-icon">📄</span>
                  <div class="person-info">
                    <span class="person-name">{{ rapportFileName }}</span>
                    <div class="progress-bar-wrap">
                      <div class="progress-bar" :style="{ width: rapportProgress + '%' }"></div>
                    </div>
                  </div>
                  <span class="progress-pct">{{ rapportProgress }}%</span>
                </div>
              </div>

              <div v-if="rapportUrl" class="file-card">
                <span class="file-type-icon">📄</span>
                <div class="person-info">
                  <span class="person-name">Rapport de stage</span>
                  <span class="person-sub">PDF · Déposé</span>
                </div>
                <a v-if="rapportUrl" :href="rapportUrl" target="_blank" class="file-link-btn" title="Voir">👁</a>
                <button class="remove-btn" :disabled="viewMode" @click="deleteExistingRapport" title="Supprimer">×</button>
              </div>

              <div v-if="!rapportUrl && !rapportUploading" class="empty-hint">
                Aucun rapport déposé.
              </div>
            </div>

          </div>
        </div>

        <!-- Footer -->
        <div class="modal-footer">
          <template v-if="viewMode">
            <button class="btn-cancel" @click="closeModal">Fermer</button>
          </template>
          <template v-else>
            <template v-if="currentStep === 0">
              <button class="btn-cancel" @click="closeModal">Annuler</button>
            </template>
            <template v-else>
              <button class="btn-cancel" @click="prevStep">← Précédent</button>
            </template>

            <div class="footer-right">
              <span class="step-counter">{{ currentStep + 1 }} / {{ steps.length }}</span>

              <button
                v-if="currentStep === 0"
                class="btn-submit"
                :disabled="!isStep0Valid"
                @click="currentStep++"
              >
                Suivant →
              </button>

              <button
                v-else-if="currentStep === 1"
                class="btn-submit"
                :disabled="stageCreating"
                @click="goToTechStep"
              >
                {{ stageCreating ? 'Création…' : 'Suivant →' }}
              </button>

              <button
                v-else-if="currentStep === 2"
                class="btn-submit"
                @click="currentStep++"
              >
                Suivant →
              </button>

              <button
                v-else-if="currentStep === 3"
                class="btn-submit btn-finish"
                @click="finish"
              >
                ✓ Terminer
              </button>
            </div>
          </template>
        </div>

      </div>
    </div>
  </transition>
</template>

<script>
import api from '@/api'
import {
  emptyForm, buildPayload,
  niveauLabel, niveauClass,
} from './stageHelpers'

export default {
  name: 'StageModal',

  props: {
    modelValue:  { type: Boolean, default: false },
    editMode:    { type: Boolean, default: false },
    viewMode:    { type: Boolean, default: false },
    initialForm: { type: Object,  default: () => emptyForm() },
    submitting:  { type: Boolean, default: false },
    modalError:  { type: String,  default: null },
    etudiantId:  { type: String,  default: null },
    stageId:     { type: String,  default: null },
  },

  emits: ['update:modelValue', 'created', 'updated'],

  data() {
    return {
      currentStep: 0,
      steps: ['Informations', 'Validateur', 'Technologies', 'Rapport'],

      localForm: {
        ...this.initialForm,
        technologies: this.initialForm?.technologies ?? [],
        id_validateur: this.initialForm?.id_validateur ?? null,
      },

      internalStageId: this.stageId ?? null,

      // Validation inline
      touched: {},

      // État création
      stageCreating: false,
      createError: null,

      // Utilisateur connecté
      ecoleUtilisateur: '',
      ecoleLoading: false,

      // Professeurs
      professeurs: [],
      loadingProfesseurs: false,
      selectedEcole: '',
      profSearch: '',
      showProfDropdown: false,
      selectedValidateur: null,
      _lastEcoleProfesseurs: '',

      // Technologies
      technologies: [],
      loadingTechs: false,
      techSearch: '',
      showTechDropdown: false,
      pendingTech: null,
      pendingTechVersion: '',
      pendingTechNiveau: 'INTERMEDIAIRE',
      techError: null,

      // Rapport
      rapportUrl: null,
      rapportUploading: false,
      rapportProgress: 0,
      rapportFileName: '',
      isDragOver: false,
      pendingRapportFile: null,
    }
  },

  computed: {
    isStep0Valid() {
      return !!(this.localForm.entreprise && this.localForm.poste
        && this.localForm.date_debut && this.localForm.missions)
    },

    activeStageId() {
      return this.stageId ?? this.internalStageId
    },

    filteredProfesseurs() {
      if (!this.profSearch) return this.professeurs
      const q = this.profSearch.toLowerCase()
      return this.professeurs.filter(p =>
        `${p.utilisateur.nom} ${p.utilisateur.prenom} ${p.utilisateur.email}`.toLowerCase().includes(q)
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
        technologies: val?.technologies ?? [],
        id_validateur: val?.id_validateur ?? null,
      }
    },

    stageId(id) {
      if (id) {
        this.internalStageId = id
        this.fetchStageDetails(id)
      }
    },

    currentStep(step) {
      if (step === 1) {
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

      const techStep = 2
      if (step === techStep && !this.technologies.length && !this.loadingTechs) {
        this.fetchTechnologies()
      }

      if (step === 3 && this.activeStageId) {
        this.refreshRapportUrl()
      }
    },
  },

  mounted() {
    document.addEventListener('click', this.handleOutsideClick)
    this.fetchCurrentUser()

    if (this.editMode && this.stageId) {
      this.fetchStageDetails(this.stageId)
    }
  },

  beforeUnmount() {
    document.removeEventListener('click', this.handleOutsideClick)
  },

  methods: {
    stepIcon(i) {
      const icons = ['📋', '👤', '🛠️', '📄']
      return icons[i] ?? '○'
    },

    touchField(field) {
      this.touched[field] = true
    },

    fieldClass(field) {
      if (!this.touched[field]) return ''
      const val = this.localForm[field]
      return val && (typeof val === 'string' ? val.trim() : val) ? 'is-valid' : 'is-invalid'
    },

    niveauLabel,
    niveauClass,

    handleOutsideClick(e) {
      if (
        !e.target.closest('.search-box') &&
        !e.target.closest('.dropdown-list') &&
        !e.target.closest('.inline-role-form')
      ) {
        this.showProfDropdown = false
        this.showTechDropdown = false
      }
    },

    closeModal() {
      this.$emit('update:modelValue', false)
    },

    goToStep(i) {
      if (this.editMode) {
        if (i <= this.currentStep || this.isStep0Valid) this.currentStep = i
        return
      }
      if (i > 2 && !this.activeStageId) return
      if (i <= this.currentStep || this.isStep0Valid) this.currentStep = i
    },

    prevStep() {
      if (this.currentStep > 0) this.currentStep--
    },

    async goToTechStep() {
      if (this.editMode) {
        this.currentStep++
        return
      }
      await this.createStage()
      if (this.activeStageId) {
        this.currentStep++
        this.fetchTechnologies()
      }
    },

    // ─── Création du stage ────────────────────────────────────
    async createStage() {
      if (!this.etudiantId) {
        this.createError = 'ID étudiant manquant'
        return
      }
      if (this.stageCreating) return
      this.stageCreating = true
      this.createError = null

      const payload = buildPayload({
        ...this.localForm,
        technologies: undefined,
      })

      try {
        const { data } = await api.post(`/stages/etudiant/${this.etudiantId}`, payload)
        const id = data?.data?.id_stage ?? data?.data?.id ?? data?.id_stage ?? data?.id
        if (!id) throw new Error('ID stage non retourné par l\'API')
        this.internalStageId = id
        this.$emit('created', id)
      } catch (e) {
        console.error('Erreur création stage', e)
        this.createError = e?.response?.data?.message || 'Impossible de créer le stage.'
        this.modalError = this.createError
      } finally {
        this.stageCreating = false
      }
    },

    // ─── Fetch stage details (mode édition) ───────────────────
    async fetchStageDetails(id) {
      try {
        const { data } = await api.get(`/stages/${id}`)
        const stage = data?.data ?? data
        if (stage) {
          this.localForm = {
            entreprise:              stage.entreprise ?? '',
            poste:                   stage.poste ?? '',
            adresse_entreprise:      stage.adresse_entreprise ?? '',
            date_debut:              stage.date_debut?.slice(0, 10) ?? '',
            date_fin:                stage.date_fin?.slice(0, 10) ?? '',
            duree_semaines:          stage.duree_semaines ?? null,
            missions:                stage.missions ?? '',
            encadrant_professionnel: stage.encadrant_professionnel ?? '',
            encadrant_academique:    stage.encadrant_academique ?? '',
            id_validateur:           stage.id_validateur ?? null,
            est_public:              stage.est_public ?? true,
            technologies:            stage.technologies?.map(t => ({
              id_technologie:     t.id_technologie,
              nom:                t.nom ?? t.technologie?.nom ?? '',
              categorie:          t.categorie ?? t.technologie?.categorie ?? '',
              sous_categorie:     t.sous_categorie ?? t.technologie?.sous_categorie ?? '',
              version:            t.version ?? '',
              niveau_utilisation: t.niveau_utilisation ?? 'INTERMEDIAIRE',
            })) ?? [],
          }

          // Rapport URL
          if (stage.rapport?.url) {
            this.rapportUrl = stage.rapport.url
          } else if (stage.rapport_url) {
            this.rapportUrl = stage.rapport_url
          }

          // Validateur
          if (stage.id_validateur && stage.validateur) {
            this.selectedValidateur = stage.validateur
          } else if (stage.id_validateur) {
            this.selectedValidateur = { id_professeur: stage.id_validateur }
          }
        }
      } catch (e) {
        console.error('Erreur chargement stage', e)
      }
    },

    // ─── Auth/Me ──────────────────────────────────────────────
    async fetchCurrentUser() {
      if (this.ecoleUtilisateur || this.ecoleLoading) return Promise.resolve()
      this.ecoleLoading = true
      try {
        const { data } = await api.get('/auth/me')
        const user = data?.data?.user ?? data?.data
        if (user?.ecole) {
          this.ecoleUtilisateur = user.ecole
          if (!this.selectedEcole) this.selectedEcole = user.ecole
        }
      } catch (e) {
        console.error('Erreur récupération utilisateur', e)
      } finally {
        this.ecoleLoading = false
      }
    },

    // ─── Professeurs ──────────────────────────────────────────
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

    selectValidateur(prof) {
      this.localForm.id_validateur = prof.id_professeur
      this.localForm.encadrant_academique = `${prof.utilisateur.prenom} ${prof.utilisateur.nom}`
      this.selectedValidateur = prof
      this.showProfDropdown = false
      this.profSearch = ''
    },

    clearValidateur() {
      this.localForm.id_validateur = null
      this.localForm.encadrant_academique = ''
      this.selectedValidateur = null
    },

    // ─── Technologies ─────────────────────────────────────────
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
        this.techError = 'Impossible de charger les technologies.'
      } finally {
        this.loadingTechs = false
      }
    },

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

      if (this.activeStageId) {
        await this.addTechToStage(entry)
      }
    },

    async removeTech(idx) {
      const tech = this.localForm.technologies[idx]
      if (this.activeStageId) {
        await this.removeTechFromStage(tech)
      }
      this.localForm.technologies.splice(idx, 1)
    },

    async addTechToStage(tech) {
      if (!this.activeStageId) return
      try {
        await api.post(`/stages/${this.activeStageId}/technologies/${tech.id_technologie}`, {
          version:            tech.version || null,
          niveau_utilisation: tech.niveau_utilisation || 'INTERMEDIAIRE',
        })
      } catch (e) {
        console.error('Erreur ajout technologie', e)
      }
    },

    async removeTechFromStage(tech) {
      if (!this.activeStageId) return
      try {
        await api.delete(`/stages/${this.activeStageId}/technologies/${tech.id_technologie}`)
      } catch (e) {
        console.error('Erreur suppression technologie', e)
      }
    },

    // ─── Rapport ──────────────────────────────────────────────
    onRapportDrop(e) {
      if (this.viewMode) return
      this.isDragOver = false
      const files = Array.from(e.dataTransfer.files)
      if (files.length) this.uploadRapportFile(files[0])
    },

    onRapportInputChange(e) {
      if (this.viewMode) return
      const files = Array.from(e.target.files)
      if (files.length) this.uploadRapportFile(files[0])
      e.target.value = ''
    },

    async uploadRapportFile(file) {
      if (!this.activeStageId) {
        this.pendingRapportFile = file
        this.rapportFileName = file.name
        return
      }
      this.rapportUploading = true
      this.rapportProgress = 0
      this.rapportFileName = file.name
      try {
        const formData = new FormData()
        formData.append('fichier', file)
        const res = await api.post(`/stages/${this.activeStageId}/rapport`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
          onUploadProgress: (e) => {
            this.rapportProgress = Math.round((e.loaded / e.total) * 100)
          },
        })
        const fileData = res.data?.data ?? res.data
        if (fileData?.url) {
          this.rapportUrl = fileData.url
        } else {
          await this.refreshRapportUrl()
        }
      } catch (e) {
        console.error('Erreur upload rapport', e)
      } finally {
        this.rapportUploading = false
      }
    },

    async deleteExistingRapport() {
      if (!this.activeStageId) return
      try {
        await api.delete(`/stages/${this.activeStageId}/rapport`)
        this.rapportUrl = null
      } catch (e) {
        console.error('Erreur suppression rapport', e)
      }
    },

    async refreshRapportUrl() {
      try {
        const { data } = await api.get(`/stages/${this.activeStageId}`)
        const stage = data?.data ?? data
        if (stage?.rapport?.url) {
          this.rapportUrl = stage.rapport.url
        }
      } catch (e) {
        console.error('Erreur rafraîchissement rapport', e)
      }
    },

    // ─── Finish ───────────────────────────────────────────────
    async finish() {
      if (this.editMode && this.activeStageId) {
        const payload = buildPayload({
          ...this.localForm,
          technologies: undefined,
        })
        try {
          await api.put(`/stages/${this.activeStageId}`, payload)
          this.$emit('updated', this.activeStageId)
        } catch (e) {
          console.error('Erreur mise à jour stage', e)
          this.modalError = e?.response?.data?.message || 'Erreur lors de la modification.'
          return
        }
      }
      if (this.pendingRapportFile && this.activeStageId) {
        await this.uploadRapportFile(this.pendingRapportFile)
        this.pendingRapportFile = null
      }
      this.$emit('update:modelValue', false)
    },

    // ─── Helpers ──────────────────────────────────────────────
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
  },
}
</script>

<style scoped>
/* ════════════════════════════════════════════════════════════
   STAGE MODAL — Design moderne
   ════════════════════════════════════════════════════════════ */

.modal {
  --accent-weak:   rgba(61, 107, 94, 0.06);
  --accent-light:  rgba(61, 107, 94, 0.10);
  --accent-mid:    rgba(61, 107, 94, 0.15);
  --accent-strong: rgba(61, 107, 94, 0.25);
}

/* ── Overlay ─────────────────────────────────────────────── */
.modal-overlay {
  position: fixed; inset: 0;
  background: rgba(15, 27, 45, 0.55);
  backdrop-filter: blur(8px);
  display: flex; align-items: center; justify-content: center;
  z-index: 1000; padding: 16px;
}

/* ── Modal shell ─────────────────────────────────────────── */
.modal {
  background: linear-gradient(145deg, var(--color-surface), color-mix(in srgb, var(--color-surface) 95%, #000));
  border-radius: 20px;
  width: 100%; max-width: 620px; max-height: 92vh;
  display: flex; flex-direction: column;
  box-shadow:
    0 0 0 1px rgba(61, 107, 94, 0.08),
    0 8px 32px rgba(0, 0, 0, 0.4),
    0 1px 3px rgba(0, 0, 0, 0.2);
  overflow: hidden;
  border: 1px solid rgba(61, 107, 94, 0.12);
}

/* ── Header ──────────────────────────────────────────────── */
.modal-header {
  position: relative;
  display: flex; align-items: center; justify-content: space-between;
  padding: 20px 24px 16px;
  background: linear-gradient(180deg, rgba(61,107,94,0.08) 0%, transparent 100%);
  border-bottom: 1px solid rgba(61, 107, 94, 0.1);
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
  background: rgba(61,107,94,0.12);
  color: var(--color-heading);
  transform: rotate(90deg);
}

/* ── Steps nav ───────────────────────────────────────────── */
.steps-nav {
  display: flex; gap: 0; padding: 14px 20px 10px;
  background: linear-gradient(180deg, var(--color-background-mute), rgba(15,36,36,0.6));
  border-bottom: 1px solid rgba(61, 107, 94, 0.08);
  overflow-x: auto; scrollbar-width: none;
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
  background: var(--color-border);
  transition: all .5s cubic-bezier(.4,0,.2,1);
  border-radius: 2px;
}
.step-btn.active:not(:last-child)::after {
  background: linear-gradient(90deg, var(--color-accent) 0%, var(--color-border) 100%);
}
.step-btn.done:not(:last-child)::after {
  background: linear-gradient(90deg, var(--color-accent) 0%, var(--color-accent) 100%);
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
  position: absolute; inset: 0; border-radius: 50%;
  background: radial-gradient(circle at center, rgba(61,107,94,.2), transparent 70%);
  opacity: 0; transition: opacity .4s;
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
  color: #fff; border-color: var(--color-accent);
  box-shadow: 0 0 0 4px rgba(61,107,94,.15), 0 2px 8px rgba(61,107,94,.25);
  transform: scale(1.12);
}
.step-btn.active .step-num::before { opacity: 1; }
.step-btn.done .step-num {
  background: var(--color-accent); color: #fff; border-color: var(--color-accent);
  box-shadow: 0 0 0 3px rgba(61,107,94,.1);
}
.step-btn:hover:not(.active):not(.done) .step-num {
  border-color: var(--color-accent-hover);
  color: var(--color-accent); transform: scale(1.05);
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

.section-hint {
  color: var(--color-text-muted); font-size: 13px; margin-bottom: 16px;
  padding: 12px 16px;
  background: linear-gradient(135deg, rgba(61,107,94,0.06), transparent);
  border-radius: 10px;
  border: 1px solid rgba(61, 107, 94, 0.1);
  line-height: 1.5;
}
.hint-loading { color: var(--color-accent); font-style: italic; font-size: 12px; }

/* ── Forms ───────────────────────────────────────────────── */
.form-group { margin-bottom: 14px; }
.form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
.form-label {
  display: flex; align-items: center; gap: 4px;
  font-size: 11px; font-weight: 600; text-transform: uppercase;
  letter-spacing: .04em;
  color: var(--color-text-muted); margin-bottom: 5px;
}
.required { color: var(--color-danger); }
.optional { font-weight: 400; color: var(--color-text-subtle); font-size: 10px; text-transform: none; }
.form-input {
  width: 100%; padding: 10px 14px;
  border: 1.5px solid rgba(61, 107, 94, 0.15);
  border-radius: 10px; font-size: 14px; color: var(--color-text);
  background: var(--color-surface-alt);
  transition: all .25s cubic-bezier(.4,0,.2,1);
  box-sizing: border-box;
  backdrop-filter: blur(4px);
}
.form-input::placeholder { color: var(--color-text-subtle); opacity: .6; }
.form-input:hover { border-color: rgba(61, 107, 94, 0.3); }
.form-input:focus {
  outline: none; border-color: var(--color-accent);
  background: var(--color-surface-hover);
  box-shadow: 0 0 0 3px rgba(61,107,94,.12), 0 0 20px rgba(61,107,94,.05);
}
.form-input.is-invalid {
  border-color: rgba(239,68,68,.4);
  background: rgba(239,68,68,.04);
  box-shadow: 0 0 0 3px rgba(239,68,68,.08);
}
.form-input.is-valid {
  border-color: rgba(61,107,94,.35);
  background: rgba(61,107,94,.04);
}
.form-textarea { resize: vertical; min-height: 80px; }

/* ── Search + Dropdown ───────────────────────────────────── */
.search-box { position: relative; }
.search-icon {
  position: absolute; left: 12px; top: 50%; transform: translateY(-50%);
  font-size: 14px; pointer-events: none; color: var(--color-text-subtle);
}
.search-input { padding-left: 38px !important; }

.dropdown-list {
  border: 1px solid rgba(61, 107, 94, 0.12); border-radius: 12px;
  margin-top: 6px; max-height: 220px; overflow-y: auto;
  background: var(--color-surface-raised);
  box-shadow: 0 8px 30px rgba(0,0,0,.3), 0 0 0 1px rgba(61,107,94,.06);
  position: relative; z-index: 20;
}
.dropdown-item {
  display: flex; align-items: center; gap: 10px;
  padding: 10px 14px; cursor: pointer; transition: all .15s cubic-bezier(.4,0,.2,1);
  border-bottom: 1px solid rgba(61, 107, 94, 0.06);
}
.dropdown-item:last-child { border-bottom: none; }
.dropdown-item:hover:not(.disabled) {
  background: rgba(61,107,94,0.08);
  transform: translateX(4px);
  padding-left: 18px;
}
.dropdown-item.selected { background: rgba(61,107,94,0.12); }
.dropdown-item.disabled { opacity: .35; cursor: default; }

/* ── Loading ─────────────────────────────────────────────── */
.loading-hint {
  font-size: 12px; color: var(--color-text-muted); text-align: center; padding: 16px;
  display: flex; align-items: center; justify-content: center; gap: 10px;
}
.dot-loader {
  width: 14px; height: 14px; border-radius: 50%;
  border: 2px solid rgba(61, 107, 94, 0.15);
  border-top-color: var(--color-accent);
  display: inline-block; animation: spin .7s linear infinite;
}
@keyframes spin { to { transform: rotate(360deg) } }

/* ── Person cards ────────────────────────────────────────── */
.person-avatar {
  width: 36px; height: 36px; border-radius: 50%;
  background: linear-gradient(135deg, var(--color-accent), var(--color-accent-hover));
  color: #fff; font-size: 12px; font-weight: 700;
  display: flex; align-items: center; justify-content: center;
  flex-shrink: 0;
  box-shadow: 0 0 0 2px rgba(61,107,94,.15);
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
  background: linear-gradient(135deg, rgba(61,107,94,0.1), rgba(61,107,94,0.04));
  border-radius: 12px; margin-top: 12px;
  border: 1px solid rgba(61, 107, 94, 0.25);
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
  background: linear-gradient(135deg, rgba(61,107,94,0.06), transparent);
  border: 1px solid rgba(61, 107, 94, 0.1);
  border-radius: 12px; padding: 16px; margin: 12px 0;
}
.inline-role-header {
  display: flex; align-items: center; gap: 10px;
  font-size: 14px; font-weight: 600; margin-bottom: 14px;
  color: var(--color-heading);
}
.inline-role-actions { display: flex; justify-content: flex-end; gap: 10px; margin-top: 10px; }

/* ── Technologies ────────────────────────────────────────── */
.tech-icon-cell { font-size: 18px; width: 28px; text-align: center; flex-shrink: 0; }
.tech-icon-lg   { font-size: 22px; }
.tech-cat-badge {
  font-size: 10px; padding: 2px 8px; border-radius: 20px;
  background: rgba(61,107,94,0.08); color: var(--color-text-muted); font-weight: 600;
  border: 1px solid rgba(61,107,94,0.1);
}
.tech-tags { display: flex; flex-wrap: wrap; gap: 6px; margin-top: 12px; }
.tech-tag {
  display: flex; align-items: center; gap: 6px;
  padding: 6px 12px;
  background: rgba(61,107,94,0.06);
  border-radius: 20px;
  border: 1px solid rgba(61, 107, 94, 0.1);
  font-size: 13px;
  transition: all .2s cubic-bezier(.4,0,.2,1);
}
.tech-tag:hover {
  border-color: rgba(61, 107, 94, 0.2);
  background: rgba(61,107,94,0.1);
  transform: translateX(4px);
  box-shadow: 0 2px 8px rgba(0,0,0,.15);
}
.tech-emoji  { font-size: 14px; }
.tech-name   { font-weight: 600; color: var(--color-heading); }
.tech-version { font-size: 10px; color: var(--color-text-subtle); }
.tech-level {
  font-size: 10px; font-weight: 700; padding: 2px 7px;
  border-radius: 20px; text-transform: uppercase; letter-spacing: .3px;
}
.lvl-green  { background: rgba(61,107,94,0.15); color: var(--color-accent-hover); }
.lvl-yellow { background: rgba(186,117,23,0.15); color: #f5a623; }
.lvl-orange { background: rgba(217,72,31,0.15); color: #f07a4a; }
.lvl-red    { background: rgba(239,68,68,0.12); color: #f87171; }

.badge-already {
  font-size: 10px; font-weight: 700; padding: 3px 8px;
  background: rgba(61,107,94,0.08); color: var(--color-text-subtle);
  border-radius: 20px; flex-shrink: 0;
}

/* ── Empty ───────────────────────────────────────────────── */
.empty-hint {
  font-size: 13px; color: var(--color-text-subtle); text-align: center;
  padding: 24px; border: 1.5px dashed rgba(61,107,94,.15);
  border-radius: 12px; margin-top: 12px;
}

/* ── Rapport ─────────────────────────────────────────────── */
.file-input-hidden { display: none; }

.upload-zone {
  border: 2px dashed rgba(61, 107, 94, 0.15);
  border-radius: 14px; padding: 32px 20px;
  text-align: center; cursor: pointer;
  background: rgba(61, 107, 94, 0.03);
  transition: all .3s ease;
  margin-bottom: 16px;
  position: relative; overflow: hidden;
}
.upload-zone::before {
  content: '';
  position: absolute; inset: 0;
  background: radial-gradient(circle at center, rgba(61,107,94,.04), transparent 70%);
  opacity: 0; transition: opacity .3s;
}
.upload-zone:hover::before, .upload-zone.drag-over::before { opacity: 1; }
.upload-zone:hover, .upload-zone.drag-over {
  border-color: var(--color-accent);
  background: rgba(61,107,94,0.06);
  transform: translateY(-1px);
}
@keyframes borderPulse {
  0%, 100% { border-color: rgba(61, 107, 94, 0.15); }
  50%      { border-color: rgba(61, 107, 94, 0.35); }
}
.upload-zone.drag-over { animation: borderPulse 1.2s ease infinite; }
.upload-zone-inner { pointer-events: none; position: relative; z-index: 1; }
.upload-icon { font-size: 32px; display: block; margin-bottom: 10px; }
.upload-label { font-size: 13px; color: var(--color-text-muted); margin: 0 0 4px; }
.upload-link { color: var(--color-accent); font-weight: 600; }
.upload-hint { font-size: 11px; color: var(--color-text-subtle); margin: 0; }

.file-card {
  display: flex; align-items: center; gap: 10px;
  padding: 10px 14px;
  border: 1px solid rgba(61, 107, 94, 0.1);
  border-radius: 12px;
  background: var(--color-surface-alt);
  transition: all .2s cubic-bezier(.4,0,.2,1);
}
.file-card:hover {
  border-color: rgba(61, 107, 94, 0.2);
  transform: translateX(4px);
  box-shadow: 0 2px 8px rgba(0,0,0,.15);
}
.file-type-icon { font-size: 18px; flex-shrink: 0; }
.file-link-btn {
  background: none; border: 1px solid rgba(61,107,94,.15);
  color: var(--color-text-muted); border-radius: 8px;
  padding: 4px 10px; font-size: 13px; cursor: pointer;
  text-decoration: none; flex-shrink: 0;
  transition: all .15s;
}
.file-link-btn:hover {
  border-color: var(--color-accent);
  color: var(--color-accent);
  background: rgba(61,107,94,.06);
}

.upload-progress-list { display: flex; flex-direction: column; gap: 8px; margin-top: 8px; }
.upload-progress-item {
  display: flex; align-items: center; gap: 10px;
  padding: 10px 14px; border: 1px solid rgba(61,107,94,.1);
  border-radius: 12px; background: var(--color-surface-alt);
}
.progress-bar-wrap {
  height: 4px; background: rgba(61,107,94,.1);
  border-radius: 4px; margin-top: 4px; overflow: hidden;
}
.progress-bar {
  height: 100%;
  background: linear-gradient(90deg, var(--color-accent), var(--color-accent-hover));
  border-radius: 4px; transition: width .3s ease;
}
.progress-pct { font-size: 11px; color: var(--color-text-muted); flex-shrink: 0; min-width: 32px; text-align: right; }

/* ── Footer ──────────────────────────────────────────────── */
.modal-footer {
  display: flex; align-items: center; justify-content: space-between;
  padding: 16px 24px;
  border-top: 1px solid rgba(61, 107, 94, 0.08);
  background: linear-gradient(0deg, rgba(61,107,94,0.04) 0%, transparent 100%);
}
.footer-right { display: flex; align-items: center; gap: 12px; }
.step-counter  {
  font-size: 11px; color: var(--color-text-subtle);
  font-variant-numeric: tabular-nums;
}

.btn-cancel {
  padding: 10px 20px; border-radius: 10px;
  border: 1px solid rgba(61, 107, 94, 0.12);
  background: rgba(61, 107, 94, 0.04);
  color: var(--color-text-muted);
  font-size: 14px; font-weight: 500; cursor: pointer;
  transition: all .2s;
}
.btn-cancel:hover {
  background: rgba(61, 107, 94, 0.1);
  border-color: rgba(61, 107, 94, 0.25);
  color: var(--color-heading);
  transform: translateY(-1px);
}
.btn-cancel:active { transform: translateY(0) scale(.98); }
.btn-cancel.small { padding: 7px 14px; font-size: 13px; }

.btn-submit {
  padding: 10px 22px; border-radius: 10px; border: none;
  background: linear-gradient(135deg, var(--color-accent), var(--color-accent-hover));
  color: #fff; font-size: 14px; font-weight: 600;
  cursor: pointer; display: flex; align-items: center; gap: 8px;
  transition: all .2s;
  box-shadow: 0 2px 8px rgba(61,107,94,.2);
}
.btn-submit:hover:not(:disabled) {
  background: linear-gradient(135deg, var(--color-accent-hover), var(--color-accent));
  box-shadow: 0 4px 16px rgba(61,107,94,.3);
  transform: translateY(-1px);
}
.btn-submit:active:not(:disabled) { transform: translateY(0) scale(.98); }
.btn-submit:disabled { opacity: .35; cursor: not-allowed; box-shadow: none; }
.btn-submit.small { padding: 7px 16px; font-size: 13px; }
.btn-finish {
  background: linear-gradient(135deg, var(--color-accent), var(--color-accent-hover));
}
.btn-finish:hover:not(:disabled) {
  background: linear-gradient(135deg, var(--color-accent-hover), var(--color-accent));
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
  .steps-nav { padding: 10px 12px 8px; }
  .step-btn { font-size: 10px; }
  .step-num { width: 24px; height: 24px; font-size: 11px; }
  .step-label-text { font-size: 9px; }
  .btn-cancel, .btn-submit { padding: 8px 16px; font-size: 13px; }
  .upload-zone { padding: 24px 16px; }
  .dropdown-list { max-height: 180px; }
}
</style>

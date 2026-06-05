<template>
  <div class="card">
    <div class="section-header">
      <h3>Compétences</h3>
      <button class="add-btn" @click="$emit('add')">
        <i class="ti ti-plus"></i> Ajouter
      </button>
    </div>

    <div v-if="user.etudiant?.competences?.length" class="skill-list">
      <div v-for="ec in user.etudiant.competences" :key="ec.competence.id_competence">

        <div class="skill-item">
          <span class="skill-name">{{ ec.competence.nom }}</span>

          <div class="skill-stars">
            <span
              v-for="i in 3" :key="i"
              class="star"
              :class="i <= niveauToInt[ec.niveau_maitrise] ? 'on' : 'off'"
            >{{ i <= niveauToInt[ec.niveau_maitrise] ? '★' : '☆' }}</span>
            <span class="niv-badge">{{ niveauLabel[ec.niveau_maitrise] }}</span>
          </div>

          <div class="skill-actions">
            <button
  v-if="pendingDelete !== ec.competence.id_competence"
  class="act-btn"
  aria-label="Supprimer"
  @click="pendingDelete = ec.competence.id_competence"
>
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <polyline points="3 6 5 6 21 6"/>
    <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
    <path d="M10 11v6"/>
    <path d="M14 11v6"/>
    <path d="M9 6V4h6v2"/>
  </svg>
</button>
          </div>
        </div>

        <Transition name="fade">
          <div v-if="pendingDelete === ec.competence.id_competence" class="confirm-row">
            <i class="ti ti-alert-triangle"></i>
            <span>Supprimer <strong>{{ ec.competence.nom }}</strong> ?</span>
            <div class="confirm-btns">
              <button class="cbtn cancel" @click="pendingDelete = null">Annuler</button>
              <button class="cbtn confirm" @click="doRemove(ec.competence.id_competence)">Supprimer</button>
            </div>
          </div>
        </Transition>

      </div>
    </div>

    <p class="empty-msg" v-else>Aucune compétence ajoutée.</p>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const props = defineProps({ user: Object })
const emit  = defineEmits(['add', 'remove'])

const pendingDelete = ref(null)

const niveauToInt = {
  1: 1, 2: 2, 3: 3,
  'DEBUTANT': 1, 'INTERMEDIAIRE': 2, 'AVANCE': 3,
}

const niveauLabel = {
  1: 'Débutant',      'DEBUTANT':      'Débutant',
  2: 'Intermédiaire', 'INTERMEDIAIRE': 'Intermédiaire',
  3: 'Avancé',        'AVANCE':        'Avancé',
}

function doRemove(id) {
  emit('remove', id)
  pendingDelete.value = null
}
</script>

<style scoped>
@import '@/assets/profile.css';

.skill-list { display: flex; flex-direction: column; gap: 8px; }

.skill-item {
  display: flex; align-items: center; gap: 10px;
  padding: 9px 12px;
  border: 0.5px solid var(--color-accent);
  border-radius: 8px;
  background: var(--color-accent);
  transition: border-color .15s;
}

.skill-item:hover { border-color: #ccc; }
.skill-item:hover .skill-actions { opacity: 1; }

.skill-name { 
  flex: 1; font-size: 13px; font-weight: 500; 
  color: var(--color-text-primary);  /* ← texte lisible */
}

.skill-stars { display: flex; align-items: center; gap: 2px;  }
.star        { font-size: 25px; }
.star.on     { color: #D95F1E; }
.star.off    { color: #ddd; }
.niv-badge { 
  font-size: 11px; 
  color: var(--color-text-primary);
  margin-left: 4px; 
}

.skill-actions { 
  opacity: 1;  /* ← toujours visible, supprime la transition */
  display: flex; 
  gap: 4px; 
}

.act-btn {
  width: 26px; height: 26px; display: flex; align-items: center; justify-content: center;
  border: 0.5px solid #e0e0e0; border-radius: 6px; background: transparent;
  cursor: pointer; color: #aaa; font-size: 14px; transition: all .15s;
}
.act-btn:hover {
  border-color: #f5c6c6;
  background: #fff5f5;
  color: #c0392b;
}

.confirm-row {
  display: flex; align-items: center; gap: 8px;
  padding: 8px 12px; margin-top: 4px;
  border: 0.5px solid #60816a; border-radius: 8px;
  background: #60816a; font-size: 12px; color: #c0392b;
}
.confirm-btns { display: flex; gap: 6px; margin-left: auto; }
.cbtn {
  padding: 3px 10px; border-radius: 6px; font-size: 12px;
  cursor: pointer; border: 0.5px solid;
}
.cbtn.cancel  { border-color: #ddd; background: transparent; color: #666; }
.cbtn.confirm { border-color: #f5c6c6; background: #fff5f5; color: #c0392b; }
.cbtn.confirm:hover { background: #c0392b; color: #fff; }

.fade-enter-active, .fade-leave-active { transition: opacity .15s, transform .15s; }
.fade-enter-from, .fade-leave-to { opacity: 0; transform: translateY(-4px); }
</style>
<template>
  <div :class="['min-h-screen font-sans', customization.darkMode && 'is-dark']" :style="{ fontFamily: fontFamilyValue }">

    <!-- ── FLOATING EDIT TOOLBAR ─────────────────────────────────── -->
    <div v-if="isEditMode" class="edit-toolbar">
      <div class="edit-toolbar__inner">
        <div class="edit-toolbar__info">
          <span class="edit-toolbar__dot"></span>
          <span class="edit-toolbar__label">Mode édition</span>
          <span class="edit-toolbar__sub">Modifications visibles uniquement par vous</span>
        </div>
        <div class="edit-toolbar__actions">
          <span v-if="savedFeedback" class="edit-toolbar__saved">✓ Sauvegardé</span>
          <button @click="saveVisibility" class="edit-btn edit-btn--save">Sauvegarder</button>
          <button @click="exitEditMode"   class="edit-btn edit-btn--exit">Quitter l'édition</button>
        </div>
      </div>
    </div>

    <!-- ── NAVBAR ─────────────────────────────────────────────────── -->
    <nav
      :class="[
        'fixed left-0 right-0 z-50 transition-all duration-300',
        isEditMode ? 'top-12' : 'top-0',
        isScrolled ? 'bg-navy/95 backdrop-blur-md shadow-lg' : 'bg-transparent'
      ]"
    >
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex h-16 items-center justify-between">
          <button @click="scrollTo('hero')" class="flex items-center gap-2">
            <div class="flex h-8 w-8 items-center justify-center rounded-lg bg-green-600">
              <span class="text-sm font-bold text-white">T</span>
            </div>
            <span class="text-lg font-bold text-white">Trusty</span>
          </button>

          <div class="hidden md:flex items-center gap-1">
            <button
              v-for="link in visibleNavLinks"
              :key="link.id"
              @click="scrollTo(link.id)"
              :class="[
                'px-3 py-2 text-sm font-medium transition-colors',
                activeSection === link.id ? 'text-white' : 'text-gray-400 hover:text-white'
              ]"
            >
              {{ link.label }}
              <div v-if="activeSection === link.id" class="mt-0.5 h-0.5 rounded-full accent-underline" />
            </button>
          </div>

          <div class="flex items-center gap-2">
            <button @click="sharePortfolio" class="hidden sm:flex items-center gap-2 border border-gray-600 bg-transparent text-gray-300 hover:bg-gray-800 hover:text-white px-3 py-1.5 rounded-lg text-sm transition-colors">
              <ShareIcon class="h-4 w-4" />
              Partager
            </button>
            <button @click="downloadPDF" class="flex items-center gap-2 accent-btn text-white px-3 py-1.5 rounded-lg text-sm font-medium transition-colors">
              <DownloadIcon class="h-4 w-4" />
              <span class="hidden sm:inline">Télécharger PDF</span>
              <span class="sm:hidden">PDF</span>
            </button>
          </div>
        </div>
      </div>
    </nav>

    <!-- ── HERO ───────────────────────────────────────────────────── -->
    <section id="hero" :class="['relative min-h-screen bg-gray-50 px-4 pb-16 sm:px-6 lg:px-8', isEditMode ? 'pt-40' : 'pt-24']">
      <div class="absolute inset-0 overflow-hidden pointer-events-none">
        <div class="absolute -top-40 -right-40 h-80 w-80 rounded-full bg-green-500/8 blur-3xl" />
        <div class="absolute -bottom-40 -left-40 h-80 w-80 rounded-full bg-green-500/5 blur-3xl" />
      </div>

      <div class="relative max-w-7xl mx-auto">
        <div class="flex flex-col items-center text-center lg:flex-row lg:items-start lg:text-left lg:gap-16">
          <div class="flex-1 space-y-6">
            <div class="flex justify-center lg:justify-start">
              <div class="flex h-28 w-28 items-center justify-center rounded-full bg-white ring-4 ring-green-500/30 shadow-lg">
                <span class="text-4xl font-bold text-navy">{{ student.initials }}</span>
              </div>
            </div>

            <div class="space-y-3">
              <h1 class="font-serif text-4xl font-bold tracking-tight text-navy sm:text-5xl lg:text-6xl">
                {{ student.fullName }}
              </h1>
              <p class="text-lg text-gray-600 sm:text-xl">{{ student.school }} · {{ student.year }}</p>
              <p class="text-base text-gray-500">{{ student.specialization }}</p>
            </div>

            <div class="flex flex-wrap justify-center gap-3 lg:justify-start">
              <span v-if="student.objective" class="inline-flex items-center rounded-full bg-gray-200 px-4 py-1.5 text-sm font-medium text-gray-700">
                {{ student.objective }}
              </span>
              <span v-if="student.isCertified" class="cert-badge inline-flex items-center gap-1.5 rounded-full px-4 py-1.5 text-sm font-medium">
                <CheckCircleIcon class="h-4 w-4" />
                Certifié UAE
              </span>
            </div>

            <!-- Bio — editable in edit mode -->
            <div class="max-w-2xl">
              <textarea
                v-if="isEditMode && bioEditing"
                ref="bioTextareaRef"
                v-model="student.bio"
                @blur="bioEditing = false"
                class="bio-textarea"
                rows="3"
              />
              <div v-else class="bio-display">
                <p
                  :class="['text-base leading-relaxed text-gray-600', isEditMode && 'bio-editable']"
                  @click="isEditMode && startBioEdit()"
                >{{ student.bio }}</p>
                <button v-if="isEditMode" @click="startBioEdit" :class="['bio-pencil', bioEditing && 'bio-pencil--active']" title="Modifier la bio">
                  <component :is="PencilIcon" class="h-3.5 w-3.5" />
                </button>
              </div>
            </div>

            <div class="flex flex-wrap justify-center gap-6 pt-4 lg:justify-start">
              <div v-for="stat in studentStats" :key="stat.label" class="flex items-center gap-2 text-gray-500">
                <component :is="stat.icon" class="h-4 w-4" />
                <span class="font-semibold text-navy">{{ stat.value }}</span>
                <span class="text-sm">{{ stat.label }}</span>
              </div>
            </div>
          </div>

          <!-- Score Card -->
          <div class="mt-12 lg:mt-0">
            <div class="rounded-2xl border border-gray-200 bg-white p-8 shadow-md">
              <p class="mb-4 text-center text-sm font-medium uppercase tracking-wider text-gray-400">Score de crédibilité</p>
              <div class="relative flex h-48 w-48 items-center justify-center">
                <svg class="absolute h-full w-full -rotate-90" viewBox="0 0 192 192">
                  <circle cx="96" cy="96" r="88" fill="none" stroke="#E5E7EB" stroke-width="8" />
                  <circle cx="96" cy="96" r="88" fill="none" :stroke="customization.accentColor" stroke-width="8"
                    stroke-linecap="round" :stroke-dasharray="`${(student.credibilityScore / 100) * 553} 553`" />
                </svg>
                <div class="text-center">
                  <span class="text-5xl font-bold text-navy">{{ student.credibilityScore }}</span>
                  <span class="text-2xl text-gray-400">/100</span>
                </div>
              </div>
              <div class="mt-4 space-y-2">
                <div v-for="item in scoreBreakdown" :key="item.label" class="flex items-center justify-between text-sm">
                  <span class="text-gray-500">{{ item.label }}</span>
                  <span class="accent-text font-medium">{{ item.pts }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- ── PROJETS — DARK ─────────────────────────────────────────── -->
    <section
      id="projects"
      v-show="visibility.sections.projects || isEditMode"
      :class="['bg-navy px-4 py-20 sm:px-6 lg:px-8', isEditMode && !visibility.sections.projects && 'section-dimmed']"
    >
      <div class="max-w-7xl mx-auto">
        <div class="mb-12">
          <div class="flex items-center gap-3">
            <h2 class="font-serif text-3xl font-bold text-white sm:text-4xl">Projets Validés</h2>
            <button v-if="isEditMode" @click="toggleSection('projects')"
              :class="['section-eye-btn', visibility.sections.projects ? 'eye-active' : 'eye-inactive']">
              <component :is="visibility.sections.projects ? EyeIcon : EyeOffIcon" class="h-5 w-5" />
            </button>
          </div>
          <p class="mt-3 text-gray-400">Mes projets académiques et personnels, certifiés par mes professeurs</p>
          <div class="mt-2 h-1 w-16 rounded-full accent-underline" />
        </div>
        <div class="grid gap-6 md:grid-cols-2">
          <div
            v-for="project in projects"
            :key="project.id"
            v-show="getItemVis('projects', project.id) || isEditMode"
            :class="['relative rounded-xl border border-gray-700 bg-[#131B2E] p-6 transition-all hover:border-green-500/50', isEditMode && !getItemVis('projects', project.id) && 'item-dimmed']"
          >
            <button v-if="isEditMode" @click="toggleItem('projects', project.id)"
              :class="['item-eye-btn item-eye-btn--dark', getItemVis('projects', project.id) ? 'eye-active' : 'eye-inactive']"
              :title="getItemVis('projects', project.id) ? 'Masquer' : 'Afficher'">
              <component :is="getItemVis('projects', project.id) ? EyeIcon : EyeOffIcon" class="h-5 w-5" />
            </button>
            <div class="flex items-start justify-between">
              <div class="flex-1">
                <div class="flex items-center gap-3">
                  <h3 class="text-xl font-semibold text-white">{{ project.name }}</h3>
                  <a v-if="project.githubUrl" :href="project.githubUrl" target="_blank" class="text-gray-500 hover:text-white transition-colors">
                    <GithubIcon class="h-5 w-5" />
                  </a>
                </div>
                <p class="mt-2 text-sm leading-relaxed text-gray-400">{{ project.description }}</p>
              </div>
            </div>
            <div class="mt-4 flex flex-wrap gap-2">
              <span v-for="tech in project.techStack" :key="tech" class="rounded-full bg-[#1A2332] px-3 py-1 text-xs font-medium text-gray-300">{{ tech }}</span>
            </div>
            <div class="mt-4 flex items-center gap-2 border-t border-gray-700 pt-4">
              <span v-if="project.isCertified" class="cert-badge inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium">
                <CheckCircleIcon class="h-3.5 w-3.5" />
                Certifié {{ project.certifyingInstitution }}
              </span>
              <span v-if="project.isCertified && project.validator" class="text-xs text-gray-500">par {{ project.validator }}</span>
              <span v-else-if="!project.isCertified" class="inline-flex items-center gap-1.5 rounded-full bg-amber-500/10 px-3 py-1 text-xs font-medium text-amber-400">
                <ClockIcon class="h-3.5 w-3.5" />
                En attente
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- ── COMPÉTENCES — LIGHT ────────────────────────────────────── -->
    <section
      id="skills"
      v-show="visibility.sections.skills || isEditMode"
      :class="['bg-gray-50 px-4 py-20 sm:px-6 lg:px-8', isEditMode && !visibility.sections.skills && 'section-dimmed']"
    >
      <div class="max-w-7xl mx-auto">
        <div class="mb-12">
          <div class="flex items-center gap-3">
            <h2 class="font-serif text-3xl font-bold text-navy sm:text-4xl">Compétences</h2>
            <button v-if="isEditMode" @click="toggleSection('skills')"
              :class="['section-eye-btn section-eye-btn--light', visibility.sections.skills ? 'eye-active' : 'eye-inactive']">
              <component :is="visibility.sections.skills ? EyeIcon : EyeOffIcon" class="h-5 w-5" />
            </button>
          </div>
          <div class="mt-2 h-1 w-16 rounded-full accent-underline" />
        </div>
        <div class="grid gap-12 lg:grid-cols-2">
          <div>
            <h3 class="mb-6 text-xl font-semibold text-navy">Compétences Techniques</h3>
            <div class="space-y-5">
              <div
                v-for="skill in skills.technical"
                :key="skill.name"
                v-show="getItemVis('skills', skill.name) || isEditMode"
                :class="['relative', isEditMode && !getItemVis('skills', skill.name) && 'item-dimmed']"
              >
                <button v-if="isEditMode" @click="toggleItem('skills', skill.name)"
                  :class="['item-eye-btn item-eye-btn--light', getItemVis('skills', skill.name) ? 'eye-active' : 'eye-inactive']"
                  :title="getItemVis('skills', skill.name) ? 'Masquer' : 'Afficher'">
                  <component :is="getItemVis('skills', skill.name) ? EyeIcon : EyeOffIcon" class="h-5 w-5" />
                </button>
                <div class="mb-2 flex items-center justify-between">
                  <span class="font-medium text-navy">{{ skill.name }}</span>
                  <div class="flex items-center gap-2">
                    <span class="text-sm text-gray-500">{{ skill.level }}</span>
                    <span class="text-sm font-semibold text-gray-700">{{ skill.percentage }}%</span>
                  </div>
                </div>
                <div class="h-2.5 w-full overflow-hidden rounded-full bg-gray-200">
                  <div class="h-full rounded-full accent-bar transition-all duration-500" :style="{ width: `${skill.percentage}%` }" />
                </div>
              </div>
            </div>
          </div>
          <div>
            <h3 class="mb-6 text-xl font-semibold text-navy">Soft Skills</h3>
            <div class="flex flex-wrap gap-3">
              <div
                v-for="skill in skills.soft"
                :key="skill"
                v-show="getItemVis('softSkills', skill) || isEditMode"
                :class="['relative inline-flex items-center', isEditMode && !getItemVis('softSkills', skill) && 'item-dimmed']"
              >
                <button v-if="isEditMode" @click="toggleItem('softSkills', skill)"
                  :class="['soft-eye-btn', getItemVis('softSkills', skill) ? 'eye-active' : 'eye-inactive']"
                  :title="getItemVis('softSkills', skill) ? 'Masquer' : 'Afficher'">
                  <component :is="getItemVis('softSkills', skill) ? EyeIcon : EyeOffIcon" class="h-3.5 w-3.5" />
                </button>
                <span class="rounded-full border border-navy/20 bg-white px-4 py-2 text-sm font-medium text-navy shadow-sm transition-colors hover:bg-navy hover:text-white cursor-default">
                  {{ skill }}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- ── STAGES — DARK ──────────────────────────────────────────── -->
    <section
      id="stages"
      v-show="visibility.sections.stages || isEditMode"
      :class="['bg-navy px-4 py-20 sm:px-6 lg:px-8', isEditMode && !visibility.sections.stages && 'section-dimmed']"
    >
      <div class="max-w-7xl mx-auto">
        <div class="mb-12">
          <div class="flex items-center gap-3">
            <h2 class="font-serif text-3xl font-bold text-white sm:text-4xl">Stages</h2>
            <button v-if="isEditMode" @click="toggleSection('stages')"
              :class="['section-eye-btn', visibility.sections.stages ? 'eye-active' : 'eye-inactive']">
              <component :is="visibility.sections.stages ? EyeIcon : EyeOffIcon" class="h-5 w-5" />
            </button>
          </div>
          <p class="mt-3 text-gray-400">Mon parcours professionnel et mes expériences en entreprise</p>
          <div class="mt-2 h-1 w-16 rounded-full accent-underline" />
        </div>
        <div class="relative">
          <div class="absolute left-4 top-0 bottom-0 hidden w-0.5 bg-gray-700 md:left-1/2 md:block md:-translate-x-1/2" />
          <div class="space-y-8">
            <div
              v-for="(stage, index) in stages"
              :key="stage.id"
              v-show="getItemVis('stages', stage.id) || isEditMode"
              :class="['relative flex flex-col md:flex-row md:items-center', index % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse', isEditMode && !getItemVis('stages', stage.id) && 'item-dimmed']"
            >
              <div class="absolute left-4 hidden h-4 w-4 rounded-full border-4 border-navy bg-green-500 md:left-1/2 md:block md:-translate-x-1/2" />
              <div :class="['relative w-full rounded-xl border border-gray-700 bg-[#131B2E] p-6 md:w-[calc(50%-2rem)]', index % 2 === 0 ? 'md:mr-auto md:pr-8' : 'md:ml-auto md:pl-8']">
                <button v-if="isEditMode" @click="toggleItem('stages', stage.id)"
                  :class="['item-eye-btn item-eye-btn--dark', getItemVis('stages', stage.id) ? 'eye-active' : 'eye-inactive']"
                  :title="getItemVis('stages', stage.id) ? 'Masquer' : 'Afficher'">
                  <component :is="getItemVis('stages', stage.id) ? EyeIcon : EyeOffIcon" class="h-5 w-5" />
                </button>
                <div class="flex items-start justify-between gap-4">
                  <div class="flex items-center gap-3">
                    <div class="flex h-12 w-12 items-center justify-center rounded-xl bg-[#1A2332]">
                      <BuildingIcon class="h-6 w-6 text-green-500" />
                    </div>
                    <div>
                      <h3 class="text-lg font-semibold text-white">{{ stage.company }}</h3>
                      <p class="text-sm text-gray-400">{{ stage.duration }}</p>
                    </div>
                  </div>
                  <span v-if="stage.isCertified" class="cert-badge inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium">
                    <CheckCircleIcon class="h-3.5 w-3.5" />
                    Certifié {{ stage.certifyingInstitution }}
                  </span>
                  <span v-else class="inline-flex items-center gap-1.5 rounded-full bg-amber-500/10 px-3 py-1 text-xs font-medium text-amber-400">
                    <ClockIcon class="h-3.5 w-3.5" />
                    En attente
                  </span>
                </div>
                <p class="mt-3 font-medium text-gray-300">{{ stage.role }}</p>
                <ul class="mt-4 space-y-2">
                  <li v-for="(mission, i) in stage.missions" :key="i" class="flex items-start gap-2 text-sm text-gray-400">
                    <span class="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-green-500" />
                    {{ mission }}
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- ── BADGES — LIGHT ─────────────────────────────────────────── -->
    <section
      id="badges"
      v-show="visibility.sections.badges || isEditMode"
      :class="['bg-gray-50 px-4 py-20 sm:px-6 lg:px-8', isEditMode && !visibility.sections.badges && 'section-dimmed']"
    >
      <div class="max-w-7xl mx-auto">
        <div class="mb-12">
          <div class="flex items-center gap-3">
            <h2 class="font-serif text-3xl font-bold text-navy sm:text-4xl">Badges & Activités</h2>
            <button v-if="isEditMode" @click="toggleSection('badges')"
              :class="['section-eye-btn section-eye-btn--light', visibility.sections.badges ? 'eye-active' : 'eye-inactive']">
              <component :is="visibility.sections.badges ? EyeIcon : EyeOffIcon" class="h-5 w-5" />
            </button>
          </div>
          <div class="mt-2 h-1 w-16 rounded-full accent-underline" />
        </div>

        <div class="mb-12">
          <h3 class="mb-6 text-xl font-semibold text-navy">Badges & Certifications</h3>
          <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div
              v-for="badge in badges"
              :key="badge.id"
              v-show="getItemVis('badges', badge.id) || isEditMode"
              :class="['relative rounded-xl border border-gray-200 bg-white p-5 shadow-sm transition-all hover:shadow-md', isEditMode && !getItemVis('badges', badge.id) && 'item-dimmed']"
            >
              <button v-if="isEditMode" @click="toggleItem('badges', badge.id)"
                :class="['item-eye-btn item-eye-btn--light', getItemVis('badges', badge.id) ? 'eye-active' : 'eye-inactive']"
                :title="getItemVis('badges', badge.id) ? 'Masquer' : 'Afficher'">
                <component :is="getItemVis('badges', badge.id) ? EyeIcon : EyeOffIcon" class="h-5 w-5" />
              </button>
              <div class="flex h-12 w-12 items-center justify-center rounded-xl accent-badge-icon">
                <TrophyIcon class="h-6 w-6" />
              </div>
              <h4 class="mt-4 font-semibold text-navy">{{ badge.name }}</h4>
              <p class="mt-1 text-sm text-gray-500">{{ badge.description }}</p>
              <p class="mt-3 text-xs text-gray-400">{{ badge.date }}</p>
            </div>
          </div>
        </div>

        <div>
          <h3 class="mb-6 text-xl font-semibold text-navy">Activités Extracurriculaires</h3>
          <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <div
              v-for="activity in activities"
              :key="activity.id"
              v-show="getItemVis('activities', activity.id) || isEditMode"
              :class="['relative rounded-xl border border-gray-200 bg-white p-5 shadow-sm', isEditMode && !getItemVis('activities', activity.id) && 'item-dimmed']"
            >
              <button v-if="isEditMode" @click="toggleItem('activities', activity.id)"
                :class="['item-eye-btn item-eye-btn--light', getItemVis('activities', activity.id) ? 'eye-active' : 'eye-inactive']"
                :title="getItemVis('activities', activity.id) ? 'Masquer' : 'Afficher'">
                <component :is="getItemVis('activities', activity.id) ? EyeIcon : EyeOffIcon" class="h-5 w-5" />
              </button>
              <h4 class="font-semibold text-navy">{{ activity.name }}</h4>
              <p class="mt-1 text-sm text-gray-500">{{ activity.description }}</p>
              <div v-if="activity.isVerified" class="mt-3">
                <span class="cert-badge inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium">
                  <CheckCircleIcon class="h-3.5 w-3.5" />
                  Attestation vérifiée
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- ── RECOMMANDATIONS — DARK ─────────────────────────────────── -->
    <section
      id="recommendations"
      v-show="visibility.sections.recommendations || isEditMode"
      :class="['bg-navy px-4 py-20 sm:px-6 lg:px-8', isEditMode && !visibility.sections.recommendations && 'section-dimmed']"
    >
      <div class="max-w-7xl mx-auto">
        <div class="mb-12">
          <div class="flex items-center gap-3">
            <h2 class="font-serif text-3xl font-bold text-white sm:text-4xl">Recommandations</h2>
            <button v-if="isEditMode" @click="toggleSection('recommendations')"
              :class="['section-eye-btn', visibility.sections.recommendations ? 'eye-active' : 'eye-inactive']">
              <component :is="visibility.sections.recommendations ? EyeIcon : EyeOffIcon" class="h-5 w-5" />
            </button>
          </div>
          <p class="mt-3 text-gray-400">Ce que disent mes professeurs, collègues et collaborateurs</p>
          <div class="mt-2 h-1 w-16 rounded-full accent-underline" />
        </div>
        <div class="grid gap-6 md:grid-cols-2">
          <div
            v-for="rec in recommendations"
            :key="rec.id"
            v-show="getItemVis('recommendations', rec.id) || isEditMode"
            :class="['relative rounded-xl border border-gray-700 bg-[#131B2E] p-6', isEditMode && !getItemVis('recommendations', rec.id) && 'item-dimmed']"
          >
            <button v-if="isEditMode" @click="toggleItem('recommendations', rec.id)"
              :class="['item-eye-btn item-eye-btn--dark', getItemVis('recommendations', rec.id) ? 'eye-active' : 'eye-inactive']"
              :title="getItemVis('recommendations', rec.id) ? 'Masquer' : 'Afficher'">
              <component :is="getItemVis('recommendations', rec.id) ? EyeIcon : EyeOffIcon" class="h-5 w-5" />
            </button>
            <div class="flex items-start justify-between">
              <div class="flex items-center gap-4">
                <div class="flex h-12 w-12 items-center justify-center rounded-full bg-[#1A2332] ring-2 ring-gray-700">
                  <span class="text-sm font-semibold text-white">{{ rec.initials }}</span>
                </div>
                <div>
                  <h4 class="font-semibold text-white">{{ rec.name }}</h4>
                  <span :class="['mt-1 inline-block rounded-full px-2.5 py-0.5 text-xs font-medium', roleColor(rec.role)]">{{ rec.role }}</span>
                </div>
              </div>
              <QuoteIcon class="h-8 w-8 text-gray-700" />
            </div>
            <p class="mt-4 text-sm leading-relaxed text-gray-400">{{ rec.message }}</p>
            <p class="mt-4 text-xs text-gray-500">{{ rec.date }}</p>
          </div>
        </div>
      </div>
    </section>

    <!-- ── GITHUB — LIGHT ─────────────────────────────────────────── -->
    <section
      v-if="student.hasGitHub"
      id="github"
      v-show="visibility.sections.github || isEditMode"
      :class="['bg-gray-50 px-4 py-20 sm:px-6 lg:px-8', isEditMode && !visibility.sections.github && 'section-dimmed']"
    >
      <div class="max-w-7xl mx-auto">
        <div class="mb-12">
          <div class="flex items-center gap-3">
            <h2 class="font-serif text-3xl font-bold text-navy sm:text-4xl">GitHub</h2>
            <button v-if="isEditMode" @click="toggleSection('github')"
              :class="['section-eye-btn section-eye-btn--light', visibility.sections.github ? 'eye-active' : 'eye-inactive']">
              <component :is="visibility.sections.github ? EyeIcon : EyeOffIcon" class="h-5 w-5" />
            </button>
          </div>
          <p class="mt-3 text-gray-500">Mon activité et mes contributions open source</p>
          <div class="mt-2 h-1 w-16 rounded-full accent-underline" />
        </div>
        <div class="grid gap-8 lg:grid-cols-2">
          <div class="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
            <h3 class="mb-4 flex items-center gap-2 font-semibold text-navy">
              <CalendarIcon class="h-5 w-5 text-green-600" />
              Contributions cette année
            </h3>
            <div class="overflow-x-auto">
              <div class="flex gap-0.5">
                <div v-for="(week, wi) in githubData.contributions" :key="wi" class="flex flex-col gap-0.5">
                  <div v-for="(day, di) in week" :key="di" :class="['h-2.5 w-2.5 rounded-sm', contributionColor(day)]" :title="`${day} contributions`" />
                </div>
              </div>
            </div>
            <div class="mt-4 flex items-center justify-end gap-1 text-xs text-gray-500">
              <span>Moins</span>
              <div class="flex gap-0.5">
                <div class="h-2.5 w-2.5 rounded-sm bg-gray-100" />
                <div class="h-2.5 w-2.5 rounded-sm bg-green-200" />
                <div class="h-2.5 w-2.5 rounded-sm bg-green-400" />
                <div class="h-2.5 w-2.5 rounded-sm bg-green-500" />
                <div class="h-2.5 w-2.5 rounded-sm bg-green-600" />
              </div>
              <span>Plus</span>
            </div>
          </div>
          <div class="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
            <h3 class="mb-4 flex items-center gap-2 font-semibold text-navy">
              <GitBranchIcon class="h-5 w-5 text-green-600" />
              Repositories principaux
            </h3>
            <div class="space-y-4">
              <div v-for="repo in githubData.topRepos" :key="repo.name" class="flex items-center justify-between rounded-lg border border-gray-100 bg-gray-50 p-4">
                <div>
                  <h4 class="font-medium text-navy">{{ repo.name }}</h4>
                  <div class="mt-1 flex items-center gap-3 text-xs text-gray-500">
                    <span class="flex items-center gap-1">
                      <span :class="['h-2.5 w-2.5 rounded-full', langColor(repo.language)]" />
                      {{ repo.language }}
                    </span>
                    <span>{{ repo.commits }} commits</span>
                  </div>
                </div>
                <span class="text-xs text-gray-400">{{ repo.lastActivity }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- ── COLOR CUSTOMIZATION PANEL ────────────────────────────────── -->
    <div v-if="isEditMode" class="color-panel-wrapper">
      <button @click="showColorPanel = !showColorPanel" class="color-panel-trigger">
        <component :is="PaletteIcon" class="h-4 w-4" />
        Personnaliser
      </button>
      <Transition name="panel-slide">
        <div v-if="showColorPanel" class="color-panel">
          <div class="color-panel__header">
            <span class="color-panel__title">Personnalisation</span>
            <button @click="showColorPanel = false" class="color-panel__close">✕</button>
          </div>

          <!-- Accent color -->
          <div class="color-panel__group">
            <label class="color-panel__label">Couleur principale</label>
            <div class="color-panel__row">
              <div class="color-picker-wrap">
                <input type="color" v-model="customization.accentColor" class="color-picker" />
              </div>
              <span class="color-panel__hex">{{ customization.accentColor }}</span>
            </div>
            <div class="color-swatches">
              <button
                v-for="c in accentPresets"
                :key="c"
                @click="customization.accentColor = c"
                :class="['swatch', customization.accentColor === c && 'swatch--active']"
                :style="{ backgroundColor: c }"
                :title="c"
              />
            </div>
          </div>

          <!-- Theme toggle -->
          <div class="color-panel__group">
            <label class="color-panel__label">Thème</label>
            <div class="theme-toggle">
              <span :class="['theme-label', !customization.darkMode && 'theme-label--active']">Clair</span>
              <button
                :class="['toggle-switch', customization.darkMode && 'toggle-switch--on']"
                @click="customization.darkMode = !customization.darkMode"
              >
                <span class="toggle-thumb" />
              </button>
              <span :class="['theme-label', customization.darkMode && 'theme-label--active']">Sombre</span>
            </div>
          </div>

          <!-- Font choice -->
          <div class="color-panel__group">
            <label class="color-panel__label">Police</label>
            <div class="font-btns">
              <button :class="['font-btn', customization.fontChoice === 'serif'  && 'font-btn--active']" @click="customization.fontChoice = 'serif'">Serif</button>
              <button :class="['font-btn', customization.fontChoice === 'sans'   && 'font-btn--active']" @click="customization.fontChoice = 'sans'">Sans-serif</button>
              <button :class="['font-btn', customization.fontChoice === 'modern' && 'font-btn--active']" @click="customization.fontChoice = 'modern'">Modern</button>
            </div>
          </div>

          <button @click="saveCustomization" class="color-panel__save">Sauvegarder</button>
        </div>
      </Transition>
    </div>

    <!-- ── FOOTER ─────────────────────────────────────────────────── -->
    <footer class="bg-navy px-4 py-12 sm:px-6 lg:px-8">
      <div class="max-w-7xl mx-auto">
        <div class="flex flex-col items-center gap-8 border-t border-gray-700 pt-8">
          <div class="text-center">
            <p class="text-sm text-gray-400">Portfolio certifié par l'Université Abdelmalek Essaâdi</p>
            <div class="mt-2 flex items-center justify-center gap-2">
              <div class="flex h-8 w-8 items-center justify-center rounded-lg bg-green-600">
                <span class="text-xs font-bold text-white">UAE</span>
              </div>
              <span class="text-xs text-gray-500">Vérifié le 15 Mars 2025</span>
            </div>
          </div>
          <div class="flex flex-wrap justify-center gap-3">
            <button @click="sharePortfolio" class="flex items-center gap-2 border border-gray-600 bg-transparent text-gray-300 hover:bg-[#131B2E] hover:text-white px-4 py-2 rounded-lg text-sm transition-colors">
              <ShareIcon class="h-4 w-4" />
              Partager le lien
            </button>
            <button @click="downloadPDF" class="flex items-center gap-2 accent-btn text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
              <DownloadIcon class="h-4 w-4" />
              Télécharger PDF
            </button>
          </div>
          <div class="flex flex-col items-center gap-4">
            <a href="/" class="flex items-center gap-2 text-gray-400 hover:text-white transition-colors text-sm">
              <ExternalLinkIcon class="h-4 w-4" />
              Retour à Trusty
            </a>
            <div class="flex items-center gap-2">
              <div class="flex h-6 w-6 items-center justify-center rounded bg-green-600">
                <span class="text-xs font-bold text-white">T</span>
              </div>
              <span class="text-sm font-semibold text-gray-400">Propulsé par Trusty</span>
            </div>
            <p class="text-xs text-gray-600">© 2025 Trusty. Plateforme de portfolio académique certifiée.</p>
          </div>
        </div>
      </div>
    </footer>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, onUnmounted, nextTick } from 'vue'
import { useRoute, useRouter } from 'vue-router'

// ── Icons ────────────────────────────────────────────────────────────
const CheckCircleIcon  = { template: `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>` }
const ClockIcon        = { template: `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>` }
const GithubIcon       = { template: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/></svg>` }
const ShareIcon        = { template: `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M7.217 10.907a2.25 2.25 0 100 2.186m0-2.186c.18.324.283.696.283 1.093s-.103.77-.283 1.093m0-2.186l9.566-5.314m-9.566 7.5l9.566 5.314m0 0a2.25 2.25 0 103.935 2.186 2.25 2.25 0 00-3.935-2.186zm0-12.814a2.25 2.25 0 103.933-2.185 2.25 2.25 0 00-3.933 2.185z"/></svg>` }
const DownloadIcon     = { template: `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3"/></svg>` }
const BuildingIcon     = { template: `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M3.75 21h16.5M4.5 3h15M5.25 3v18m13.5-18v18M9 6.75h1.5m-1.5 3h1.5m-1.5 3h1.5m3-6H15m-1.5 3H15m-1.5 3H15M9 21v-3.375c0-.621.504-1.125 1.125-1.125h3.75c.621 0 1.125.504 1.125 1.125V21"/></svg>` }
const TrophyIcon       = { template: `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M16.5 18.75h-9m9 0a3 3 0 013 3h-15a3 3 0 013-3m9 0v-3.375c0-.621-.503-1.125-1.125-1.125h-.871M7.5 18.75v-3.375c0-.621.504-1.125 1.125-1.125h.872m5.007 0H9.497m5.007 0a7.454 7.454 0 01-.982-3.172M9.497 14.25a7.454 7.454 0 00.981-3.172M5.25 4.236c-.982.143-1.954.317-2.916.52A6.003 6.003 0 007.73 9.728M5.25 4.236V4.5c0 2.108.966 3.99 2.48 5.228M5.25 4.236V2.721C7.456 2.41 9.71 2.25 12 2.25c2.291 0 4.545.16 6.75.47v1.516M7.73 9.728a6.726 6.726 0 002.748 1.35m8.272-6.842V4.5c0 2.108-.966 3.99-2.48 5.228m2.48-5.492a46.32 46.32 0 012.916.52 6.003 6.003 0 01-5.395 4.972m0 0a6.726 6.726 0 01-2.749 1.35m0 0a6.772 6.772 0 01-3.044 0"/></svg>` }
const QuoteIcon        = { template: `<svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 24 24"><path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z"/></svg>` }
const CalendarIcon     = { template: `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5"/></svg>` }
const GitBranchIcon    = { template: `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M7.5 3.75c-1.5 0-2.5 1-2.5 2.25S6 8.25 7.5 8.25c.956 0 1.793-.5 2.25-1.25M7.5 3.75v4.5M7.5 8.25c0 3.75 2.5 6.5 5 8.25m0 0c.5.375 1.5.75 2.5.75 1.5 0 2.5-1 2.5-2.25s-1-2.25-2.5-2.25c-.956 0-1.793.5-2.25 1.25M15 16.5v-4.5"/></svg>` }
const ExternalLinkIcon = { template: `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25"/></svg>` }
const EyeIcon          = { template: `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z"/><path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/></svg>` }
const EyeOffIcon       = { template: `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88"/></svg>` }
const PaletteIcon      = { template: `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M4.098 19.902a3.75 3.75 0 005.304 0l6.401-6.402M6.75 21A3.75 3.75 0 013 17.25V4.125C3 3.504 3.504 3 4.125 3h5.25c.621 0 1.125.504 1.125 1.125v4.072M6.75 21a3.75 3.75 0 003.75-3.75V8.197M6.75 21h13.125c.621 0 1.125-.504 1.125-1.125v-5.25c0-.621-.504-1.125-1.125-1.125h-4.072M10.5 8.197l2.88-2.88c.438-.439 1.15-.439 1.59 0l3.712 3.713c.44.44.44 1.152 0 1.59l-2.879 2.88M6.75 17.25h.008v.008H6.75v-.008z"/></svg>` }
const PencilIcon       = { template: `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10"/></svg>` }

// ── Edit mode ────────────────────────────────────────────────────────
const route         = useRoute()
const router        = useRouter()
const isEditMode    = computed(() => route.query.edit === 'true')
const savedFeedback = ref(false)

// ── Bio inline editing ───────────────────────────────────────────────
const bioEditing     = ref(false)
const bioTextareaRef = ref(null)

function startBioEdit() {
  bioEditing.value = true
  nextTick(() => bioTextareaRef.value?.focus())
}

// ── Color customization ──────────────────────────────────────────────
const showColorPanel = ref(false)
const customization  = reactive({ accentColor: '#16A34A', fontChoice: 'serif', darkMode: false })
const accentPresets  = ['#16A34A', '#2563EB', '#7C3AED', '#DC2626', '#D97706', '#0891B2']

function hexToRgba(hex, alpha) {
  const r = parseInt(hex.slice(1, 3), 16)
  const g = parseInt(hex.slice(3, 5), 16)
  const b = parseInt(hex.slice(5, 7), 16)
  return `rgba(${r}, ${g}, ${b}, ${alpha})`
}

const accentBadgeBg = computed(() => hexToRgba(customization.accentColor, 0.12))
const accentAlpha06 = computed(() => hexToRgba(customization.accentColor, 0.06))
const accentAlpha30 = computed(() => hexToRgba(customization.accentColor, 0.30))
const accentAlpha50 = computed(() => hexToRgba(customization.accentColor, 0.50))

const fontFamilyValue = computed(() => {
  const fonts = {
    serif:  "Georgia, 'Times New Roman', serif",
    sans:   'Inter, -apple-system, BlinkMacSystemFont, sans-serif',
    modern: "'Helvetica Neue', Arial, sans-serif",
  }
  return fonts[customization.fontChoice]
})

function saveCustomization() {
  localStorage.setItem('portfolio-customization', JSON.stringify(customization))
  showColorPanel.value = false
}

// ── Visibility ───────────────────────────────────────────────────────
const visibility = reactive({
  sections: { projects: true, skills: true, stages: true, badges: true, recommendations: true, github: true },
  projects:        {},
  skills:          {},
  softSkills:      {},
  stages:          {},
  badges:          {},
  activities:      {},
  recommendations: {},
})

function getItemVis(type, id) {
  return visibility[type][id] !== false
}

function toggleSection(section) {
  visibility.sections[section] = !visibility.sections[section]
}

function toggleItem(type, id) {
  visibility[type][id] = !getItemVis(type, id)
}

function saveVisibility() {
  localStorage.setItem('portfolio-visibility', JSON.stringify(visibility))
  savedFeedback.value = true
  setTimeout(() => { savedFeedback.value = false }, 2000)
}

function exitEditMode() {
  router.replace({ query: {} })
}

// ── Nav links ────────────────────────────────────────────────────────
const allNavLinks = [
  { id: 'projects',        label: 'Projets',          section: 'projects' },
  { id: 'skills',          label: 'Compétences',       section: 'skills' },
  { id: 'stages',          label: 'Stages',            section: 'stages' },
  { id: 'badges',          label: 'Badges',            section: 'badges' },
  { id: 'recommendations', label: 'Recommandations',   section: 'recommendations' },
  { id: 'github',          label: 'GitHub',            section: 'github' },
]
const visibleNavLinks = computed(() =>
  allNavLinks.filter(l => isEditMode.value || visibility.sections[l.section])
)

// ── Scroll state ─────────────────────────────────────────────────────
const isScrolled    = ref(false)
const activeSection = ref('hero')

// ── Mock data ────────────────────────────────────────────────────────
const student = ref({
  initials: 'YA', fullName: 'Youssef Alami',
  school: 'École Nationale des Sciences Appliquées', year: '4ème année',
  specialization: 'Génie Informatique', objective: 'Profil DevOps',
  isCertified: true, credibilityScore: 87, hasGitHub: true,
  bio: "Passionné par le développement logiciel et les technologies cloud, je me spécialise dans l'architecture de systèmes distribués et les pratiques DevOps.",
  stats: { validatedProjects: 12, recommendations: 8, commits: 847, views: 1253 }
})

const studentStats = computed(() => [
  { icon: CheckCircleIcon, value: student.value.stats.validatedProjects, label: 'projets validés' },
  { icon: QuoteIcon,       value: student.value.stats.recommendations,   label: 'recommandations' },
  { icon: GitBranchIcon,   value: student.value.stats.commits,           label: 'commits' },
  { icon: CalendarIcon,    value: student.value.stats.views,             label: 'vues' },
])

const scoreBreakdown = [
  { label: 'Projets vérifiés',  pts: '+25 pts' },
  { label: 'Stages certifiés',  pts: '+30 pts' },
  { label: 'Recommandations',   pts: '+20 pts' },
]

const projects = ref([
  { id: 1, name: 'Système de Gestion Hospitalier', description: "Application web complète pour la gestion des patients, rendez-vous et dossiers médicaux.", techStack: ['React', 'Node.js', 'MongoDB', 'Docker'], isCertified: true, githubUrl: '#', validator: 'Pr. Ahmed Bennani', certifyingInstitution: 'ENSA Tanger' },
  { id: 2, name: 'Plateforme E-learning', description: "Solution d'apprentissage en ligne avec quiz, suivi de progression et certification.", techStack: ['Next.js', 'PostgreSQL', 'AWS', 'TypeScript'], isCertified: true, githubUrl: '#', validator: 'Pr. Fatima Zohra', certifyingInstitution: 'FST Tanger' },
  { id: 3, name: 'API Gateway Microservices', description: 'Architecture microservices avec gateway API, load balancing et monitoring centralisé.', techStack: ['Go', 'Kubernetes', 'Redis', 'Prometheus'], isCertified: false, githubUrl: '#', validator: null, certifyingInstitution: null },
  { id: 4, name: 'Application Mobile IoT', description: "Application mobile pour le contrôle et monitoring d'appareils IoT connectés.", techStack: ['Flutter', 'Firebase', 'MQTT', 'Python'], isCertified: true, githubUrl: '#', validator: 'Pr. Karim Idrissi', certifyingInstitution: 'ENSA Tanger' },
])

const skills = ref({
  technical: [
    { name: 'JavaScript/TypeScript', percentage: 92, level: 'Expert' },
    { name: 'Python',                percentage: 85, level: 'Avancé' },
    { name: 'React/Next.js',         percentage: 88, level: 'Expert' },
    { name: 'Node.js',               percentage: 82, level: 'Avancé' },
    { name: 'Docker/Kubernetes',     percentage: 75, level: 'Intermédiaire' },
  ],
  soft: ['Travail en équipe', 'Communication', 'Résolution de problèmes', 'Gestion de projet', 'Adaptabilité', 'Leadership']
})

const stages = ref([
  { id: 1, company: 'OCP Group',       duration: 'Juin 2025 - Août 2025',         role: 'Stagiaire DevOps',                missions: ["Mise en place d'un pipeline CI/CD", 'Containerisation avec Docker', 'Monitoring avec Prometheus/Grafana'], isCertified: true,  certifyingInstitution: 'ENSA Tanger' },
  { id: 2, company: 'Capgemini Maroc', duration: 'Juillet 2024 - Septembre 2024', role: 'Stagiaire Développeur Full Stack', missions: ["Développement d'une application RH", "Intégration d'APIs REST", 'Tests unitaires'],                         isCertified: true,  certifyingInstitution: 'FST Tanger' },
  { id: 3, company: 'Startup TechMa', duration: 'Janvier 2024 - Mars 2024',      role: 'Stagiaire Backend',               missions: ['Conception de base de données', "Développement d'APIs GraphQL", 'Documentation technique'],                  isCertified: false, certifyingInstitution: null },
])

const badges = ref([
  { id: 1, name: 'AWS Cloud Practitioner', description: 'Certification fondamentale AWS',  date: 'Mars 2025' },
  { id: 2, name: 'Hackathon Winner',       description: '1ère place Hackathon ENSIAS',      date: 'Décembre 2024' },
  { id: 3, name: 'Major de Promotion',     description: '1er de la promotion 2023-2024',    date: 'Juin 2024' },
  { id: 4, name: 'Open Source Contributor',description: '100+ contributions GitHub',        date: 'Continu' },
])

const activities = ref([
  { id: 1, name: 'Président Club Informatique ENSA', description: "Organisation d'événements et formations",  isVerified: true },
  { id: 2, name: 'Mentor Coding Bootcamp',           description: 'Accompagnement de 15 étudiants',           isVerified: true },
  { id: 3, name: 'Bénévole Association Tech4Good',   description: 'Formation numérique pour zones rurales',   isVerified: false },
])

const recommendations = ref([
  { id: 1, initials: 'AB', name: 'Pr. Ahmed Bennani',   role: 'Professeur',    message: "Youssef est un étudiant exceptionnel, rigoureux et créatif. Son projet de fin de semestre était remarquable.",            date: '15 Mars 2025' },
  { id: 2, initials: 'FZ', name: 'Fatima Zahra Amrani', role: 'Professionnel', message: "Durant son stage chez OCP, Youssef a fait preuve d'une grande autonomie et d'excellentes compétences.",                  date: '28 Août 2024' },
  { id: 3, initials: 'MK', name: 'Mohamed Khalil',      role: 'Étudiant',      message: 'Travailler avec Youssef sur le projet e-learning a été une excellente expérience.',                                        date: '10 Février 2024' },
  { id: 4, initials: 'SE', name: 'Pr. Sara El Idrissi', role: 'Professeur',    message: "Un étudiant passionné qui va au-delà des attentes. Ses contributions au club ont eu un impact significatif.",            date: '5 Janvier 2024' },
])

const githubData = ref({
  contributions: Array.from({ length: 52 }, () => Array.from({ length: 7 }, () => Math.floor(Math.random() * 5))),
  topRepos: [
    { name: 'hospital-management-system', language: 'TypeScript', commits: 234, lastActivity: 'Il y a 2 jours' },
    { name: 'elearning-platform',         language: 'JavaScript', commits: 187, lastActivity: 'Il y a 1 semaine' },
    { name: 'microservices-gateway',      language: 'Go',         commits: 156, lastActivity: 'Il y a 3 jours' },
  ]
})

// ── Methods ──────────────────────────────────────────────────────────
function scrollTo(id) {
  document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })
}

function roleColor(role) {
  const map = { Professeur: 'bg-green-500/10 text-green-400', Professionnel: 'bg-blue-500/10 text-blue-400', Étudiant: 'bg-purple-500/10 text-purple-400' }
  return map[role] || map.Professeur
}

function contributionColor(count) {
  if (count === 0) return 'bg-gray-100'
  if (count === 1) return 'bg-green-200'
  if (count === 2) return 'bg-green-400'
  if (count === 3) return 'bg-green-500'
  return 'bg-green-600'
}

function langColor(lang) {
  const map = { TypeScript: 'bg-blue-500', JavaScript: 'bg-yellow-400', Python: 'bg-green-500', Go: 'bg-cyan-400', Rust: 'bg-orange-500' }
  return map[lang] || 'bg-gray-400'
}

function sharePortfolio() {
  navigator.clipboard?.writeText(window.location.href)
  alert('Lien copié !')
}

function downloadPDF() {
  window.print()
}

// ── Lifecycle ────────────────────────────────────────────────────────
function handleScroll() {
  isScrolled.value = window.scrollY > 50
  const sectionIds = ['hero', 'projects', 'skills', 'stages', 'badges', 'recommendations', 'github']
  for (const id of sectionIds) {
    const el = document.getElementById(id)
    if (el) {
      const rect = el.getBoundingClientRect()
      if (rect.top <= 100 && rect.bottom >= 100) { activeSection.value = id; break }
    }
  }
}

onMounted(() => {
  window.addEventListener('scroll', handleScroll)
  const saved = localStorage.getItem('portfolio-customization')
  if (saved) { try { Object.assign(customization, JSON.parse(saved)) } catch {} }
})
onUnmounted(() => window.removeEventListener('scroll', handleScroll))
</script>

<style scoped>
.bg-navy   { background-color: #0B1120; }
.text-navy { color: #0B1120; }
.font-serif { font-family: Georgia, 'Times New Roman', serif; }

/* ── Accent-driven elements (live via v-bind) ──────────────────────── */
.accent-underline { background-color: v-bind('customization.accentColor'); }
.accent-bar       { background-color: v-bind('customization.accentColor'); }
.accent-btn       { background-color: v-bind('customization.accentColor'); }
.accent-btn:hover { filter: brightness(0.88); }
.accent-text      { color: v-bind('customization.accentColor'); }

/* Certified badge — accent bg + text */
.cert-badge {
  background-color: v-bind('accentBadgeBg');
  color: v-bind('customization.accentColor');
}

/* Badge icon container */
.accent-badge-icon {
  background-color: v-bind('accentBadgeBg');
  color: v-bind('customization.accentColor');
}

/* ── Edit toolbar ──────────────────────────────────────────────────── */
.edit-toolbar {
  position: fixed;
  top: 0; left: 0; right: 0;
  height: 48px;
  background: #1a3d2e;
  border-bottom: 1px solid rgba(92, 140, 106, 0.4);
  z-index: 60;
  display: flex;
  align-items: center;
}

.edit-toolbar__inner {
  width: 100%; max-width: 1280px;
  margin: 0 auto; padding: 0 24px;
  display: flex; align-items: center;
  justify-content: space-between; gap: 16px;
}

.edit-toolbar__info  { display: flex; align-items: center; gap: 8px; }
.edit-toolbar__dot   { width: 8px; height: 8px; background: #86efac; border-radius: 50%; animation: pulse-dot 1.8s ease-in-out infinite; }

@keyframes pulse-dot {
  0%, 100% { opacity: 1; }
  50%       { opacity: 0.4; }
}

.edit-toolbar__label { font-size: 0.82rem; font-weight: 700; color: #86efac; white-space: nowrap; }
.edit-toolbar__sub   { font-size: 0.78rem; color: rgba(214, 237, 232, 0.6); }
.edit-toolbar__saved { font-size: 0.78rem; color: #86efac; font-weight: 600; }
.edit-toolbar__actions { display: flex; align-items: center; gap: 8px; flex-shrink: 0; }

.edit-btn {
  font-size: 0.8rem; font-weight: 600;
  padding: 5px 14px; border-radius: 7px;
  cursor: pointer; transition: all 0.15s;
  border: none; white-space: nowrap;
}
.edit-btn--save { background: #5C8C6A; color: #fff; }
.edit-btn--save:hover { background: #4a7358; }
.edit-btn--exit { background: transparent; color: rgba(214, 237, 232, 0.8); border: 1px solid rgba(214, 237, 232, 0.25); }
.edit-btn--exit:hover { background: rgba(214, 237, 232, 0.08); }

/* ── Section / item dimming ────────────────────────────────────────── */
.section-dimmed { opacity: 0.45; }
.item-dimmed    { opacity: 0.30; }

/* ── Section eye toggle ────────────────────────────────────────────── */
.section-eye-btn {
  display: inline-flex; align-items: center; justify-content: center;
  width: 32px; height: 32px; border-radius: 8px;
  border: 1px solid rgba(255, 255, 255, 0.15);
  background: rgba(255, 255, 255, 0.06);
  cursor: pointer; transition: all 0.15s; flex-shrink: 0;
}

.section-eye-btn--light {
  border-color: rgba(11, 17, 32, 0.15);
  background: rgba(11, 17, 32, 0.04);
}

/* visible — accent color */
.section-eye-btn.eye-active {
  color: v-bind('customization.accentColor');
  border-color: v-bind('accentAlpha50');
  background: v-bind('accentAlpha06');
}
/* hidden — gray */
.section-eye-btn.eye-inactive { color: rgba(156, 163, 175, 0.6); }
.section-eye-btn--light.eye-inactive { color: rgba(107, 114, 128, 0.5); }

.section-eye-btn:hover { filter: brightness(1.2); }

/* ── Item eye toggle ───────────────────────────────────────────────── */
.item-eye-btn {
  position: absolute;
  top: 10px; right: 10px;
  display: inline-flex; align-items: center; justify-content: center;
  width: 28px; height: 28px;
  border-radius: 6px; border: none;
  cursor: pointer;
  /* always visible in edit mode — no opacity:0 */
  opacity: 1;
  transition: background 0.15s, transform 0.1s;
  z-index: 2;
}

.item-eye-btn:hover { transform: scale(1.1); }

/* visible — accent color */
.item-eye-btn.eye-active {
  color: v-bind('customization.accentColor');
  background: v-bind('accentBadgeBg');
}
/* hidden — gray */
.item-eye-btn.eye-inactive {
  color: rgba(156, 163, 175, 0.6);
  background: rgba(156, 163, 175, 0.1);
}

.item-eye-btn--dark.eye-inactive  { background: rgba(255, 255, 255, 0.08); color: rgba(255,255,255,0.35); }
.item-eye-btn--light.eye-inactive { background: rgba(11, 17, 32, 0.06);    color: rgba(11,17,32,0.3); }

/* Soft skill eye btn */
.soft-eye-btn {
  display: inline-flex; align-items: center; justify-content: center;
  width: 22px; height: 22px; border-radius: 4px;
  border: 1px solid rgba(11, 17, 32, 0.12);
  background: rgba(11, 17, 32, 0.04);
  cursor: pointer; vertical-align: middle;
  margin-right: 5px; transition: all 0.15s;
}
.soft-eye-btn.eye-active  { color: v-bind('customization.accentColor'); border-color: v-bind('accentAlpha50'); background: v-bind('accentAlpha06'); }
.soft-eye-btn.eye-inactive { color: rgba(107, 114, 128, 0.5); }
.soft-eye-btn:hover { filter: brightness(1.15); }

/* ── Bio editable ──────────────────────────────────────────────────── */
.bio-display {
  position: relative;
  display: flex; align-items: flex-start; gap: 8px;
}

.bio-editable {
  cursor: text; flex: 1;
  border-radius: 6px; padding: 4px 6px; margin: -4px -6px;
  transition: background 0.15s, outline 0.15s;
}
.bio-editable:hover {
  background: v-bind('accentAlpha06');
  outline: 1px dashed v-bind('accentAlpha30');
}

.bio-textarea {
  width: 100%;
  background: rgba(255, 255, 255, 0.9);
  border: 1.5px solid v-bind('customization.accentColor');
  border-radius: 8px; padding: 8px 10px;
  font-size: 1rem; line-height: 1.6; color: #374151;
  font-family: inherit; resize: vertical; outline: none;
  box-shadow: 0 0 0 3px v-bind('accentAlpha06');
}

.bio-pencil {
  flex-shrink: 0; margin-top: 3px;
  background: none; border: none;
  color: rgba(156, 163, 175, 0.5);
  cursor: pointer; padding: 4px; border-radius: 5px;
  transition: color 0.15s, background 0.15s;
}
.bio-pencil:hover   { color: v-bind('customization.accentColor'); background: v-bind('accentAlpha06'); }
.bio-pencil--active { color: v-bind('customization.accentColor'); }

/* ── Dark-mode overrides for light sections ────────────────────────── */
.is-dark #hero,
.is-dark #skills,
.is-dark #badges,
.is-dark #github { background-color: #0B1120; }

/* Headings */
.is-dark #hero .text-navy,
.is-dark #skills .text-navy,
.is-dark #badges .text-navy,
.is-dark #github .text-navy { color: #f3f4f6; }

/* Body text */
.is-dark #hero .text-gray-600,
.is-dark #skills .text-gray-600,
.is-dark #badges .text-gray-600,
.is-dark #github .text-gray-600 { color: #9ca3af; }

.is-dark #hero .text-gray-500,
.is-dark #skills .text-gray-500,
.is-dark #badges .text-gray-500,
.is-dark #github .text-gray-500 { color: #6b7280; }

.is-dark #hero .text-gray-400,
.is-dark #skills .text-gray-400,
.is-dark #badges .text-gray-400,
.is-dark #github .text-gray-400 { color: #4b5563; }

.is-dark #skills .text-gray-700,
.is-dark #hero .text-gray-700   { color: #d1d5db; }

/* Skill track background */
.is-dark #skills .bg-gray-200 { background-color: #374151; }

/* Cards */
.is-dark #badges .bg-white,
.is-dark #github .bg-white,
.is-dark #hero .bg-white { background-color: #131B2E; }

/* Borders */
.is-dark #badges .border-gray-200,
.is-dark #github .border-gray-200,
.is-dark #hero .border-gray-200 { border-color: #374151; }

/* GitHub repo items */
.is-dark #github .bg-gray-50  { background-color: #1A2332; }
.is-dark #github .border-gray-100 { border-color: #374151; }

/* Objective pill */
.is-dark #hero .bg-gray-200 { background-color: #1f2937; }
.is-dark #hero .text-gray-700 { color: #d1d5db; }

/* ── Color customization panel ─────────────────────────────────────── */
.color-panel-wrapper {
  position: fixed; bottom: 24px; left: 24px; z-index: 55;
  display: flex; flex-direction: column; align-items: flex-start; gap: 8px;
}

.color-panel-trigger {
  display: inline-flex; align-items: center; gap: 7px;
  background: #1a3d2e; color: #86efac;
  border: 1px solid rgba(92, 140, 106, 0.45);
  border-radius: 10px; padding: 9px 16px;
  font-size: 0.83rem; font-weight: 600; cursor: pointer;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.35);
  transition: background 0.15s;
}
.color-panel-trigger:hover { background: #224d38; }

.color-panel {
  background: #0f2419;
  border: 1px solid rgba(92, 140, 106, 0.35);
  border-radius: 14px; padding: 18px; width: 248px;
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.5);
  display: flex; flex-direction: column; gap: 16px;
  order: -1;
}

.color-panel__header { display: flex; align-items: center; justify-content: space-between; }
.color-panel__title  { font-size: 0.85rem; font-weight: 700; color: #d6ede8; }
.color-panel__close  {
  background: none; border: none; color: rgba(214, 237, 232, 0.5);
  font-size: 0.9rem; cursor: pointer; padding: 2px 6px; border-radius: 4px; transition: color 0.15s;
}
.color-panel__close:hover { color: #d6ede8; }

.color-panel__group { display: flex; flex-direction: column; gap: 8px; }
.color-panel__label {
  font-size: 0.68rem; font-weight: 700; color: rgba(214, 237, 232, 0.45);
  text-transform: uppercase; letter-spacing: 0.08em;
}

/* Color picker wrapped with accent border */
.color-panel__row { display: flex; align-items: center; gap: 10px; }
.color-picker-wrap {
  border: 2px solid v-bind('customization.accentColor');
  border-radius: 10px; overflow: hidden;
  width: 38px; height: 38px;
  display: flex; align-items: center; justify-content: center;
  flex-shrink: 0;
}
.color-picker {
  width: 40px; height: 40px;
  border: none; cursor: pointer; padding: 0; background: none;
  margin: -2px;
}
.color-panel__hex { font-size: 0.78rem; color: v-bind('customization.accentColor'); font-family: monospace; font-weight: 600; }

/* Swatches */
.color-swatches { display: flex; gap: 6px; flex-wrap: wrap; }
.swatch {
  width: 22px; height: 22px; border-radius: 50%;
  border: 2px solid rgba(214, 237, 232, 0.12);
  cursor: pointer; transition: transform 0.15s, border-color 0.15s;
}
.swatch:hover  { transform: scale(1.2); border-color: rgba(214, 237, 232, 0.5); }
.swatch--active { border-color: #fff; transform: scale(1.15); }

/* Theme toggle */
.theme-toggle  { display: flex; align-items: center; gap: 10px; }
.theme-label   { font-size: 0.76rem; color: rgba(214, 237, 232, 0.45); transition: color 0.15s; }
.theme-label--active { color: #d6ede8; font-weight: 600; }

.toggle-switch {
  position: relative; width: 42px; height: 24px;
  border-radius: 12px; background: rgba(214, 237, 232, 0.15);
  border: none; cursor: pointer; flex-shrink: 0;
  transition: background 0.2s;
}
.toggle-switch--on { background: v-bind('customization.accentColor'); }
.toggle-thumb {
  position: absolute; top: 4px; left: 4px;
  width: 16px; height: 16px; border-radius: 50%;
  background: #fff; display: block;
  transition: transform 0.2s;
}
.toggle-switch--on .toggle-thumb { transform: translateX(18px); }

/* Font buttons */
.font-btns { display: flex; gap: 6px; }
.font-btn {
  flex: 1; padding: 6px 4px; font-size: 0.75rem; font-weight: 600;
  border-radius: 7px; border: 1px solid rgba(214, 237, 232, 0.12);
  background: rgba(214, 237, 232, 0.05); color: rgba(214, 237, 232, 0.55);
  cursor: pointer; transition: all 0.15s;
}
.font-btn:hover       { background: rgba(214, 237, 232, 0.1); color: #d6ede8; }
.font-btn--active {
  background: v-bind('accentBadgeBg');
  color: v-bind('customization.accentColor');
  border-color: v-bind('accentAlpha50');
}

/* Save button */
.color-panel__save {
  width: 100%; padding: 9px; border-radius: 9px; border: none;
  background: v-bind('customization.accentColor');
  color: #fff; font-size: 0.83rem; font-weight: 700;
  cursor: pointer; transition: filter 0.15s;
}
.color-panel__save:hover { filter: brightness(0.88); }

/* Panel slide transition */
.panel-slide-enter-active, .panel-slide-leave-active { transition: opacity 0.18s, transform 0.18s; }
.panel-slide-enter-from, .panel-slide-leave-to { opacity: 0; transform: translateY(8px); }
</style>

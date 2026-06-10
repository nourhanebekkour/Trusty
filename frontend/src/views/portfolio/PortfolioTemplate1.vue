<template>
    <div class="pf2" :style="fontStyle">

        <div v-if="loading" style="min-height:100vh;background:#0F2040;display:flex;align-items:center;justify-content:center;">
            <div class="pf2-spinner"></div>
        </div>
        <div v-else-if="error" style="min-height:100vh;background:#0F2040;display:flex;align-items:center;justify-content:center;">
            <p style="color:rgba(255,255,255,0.7);font-size:1.125rem;font-family:Inter,sans-serif;">Portfolio introuvable</p>
        </div>
        <template v-else>

        <!-- ── STICKY NAV ────────────────────────────────────────────── -->
        <nav class="pf2-nav" :class="{ 'pf2-nav--scrolled': isScrolled }">
            <div class="pf2-nav__inner">
                <a href="/" class="pf2-back">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M19 12H5M5 12l7 7M5 12l7-7" />
                    </svg>
                    Mon espace
                </a>
                <div class="pf2-tabs">
                    <button v-for="tab in tabs" :key="tab.id" @click="scrollTo(tab.id)"
                        :class="['pf2-tab', activeTab === tab.id && 'pf2-tab--active']">
                        {{ tab.label }}
                    </button>
                </div>
                <div class="pf2-nav__actions">
                    <button class="pf2-btn-ghost" @click="share" :disabled="isShareLimited">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                            stroke-width="2">
                            <path d="M4 12v8a2 2 0 002 2h12a2 2 0 002-2v-8M16 6l-4-4-4 4M12 2v13" />
                        </svg>
                        Partager
                    </button>
                    <button class="pf2-btn-accent" @click="downloadPDF" :disabled="isPdfLimited">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                            stroke-width="2">
                            <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3" />
                        </svg>
                        PDF
                    </button>
                </div>
            </div>
        </nav>

        <!-- ── DOCUMENT WRAPPER ──────────────────────────────────────── -->
        <div class="pf2-doc">

            <!-- ── HERO ───────────────────────────────────────────────── -->
            <section id="hero" class="pf2-hero">
                <div class="pf2-hero__left">
                    <h1 class="pf2-name">{{ sanitizeText(student.prenom) }}<br>{{ sanitizeText(student.nom) }}</h1>
                    <p class="pf2-role">{{ sanitizeText(student.specialization) }} · {{ sanitizeText(student.year) }}</p>
                    <p class="pf2-school">{{ sanitizeText(student.school) }}</p>

                    <div class="pf2-hero__badges">
                        <span class="pf2-badge-obj">{{ sanitizeText(student.objective) }}</span>
                        <span class="pf2-badge-cert">
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                                stroke-width="2.5">
                                <path
                                    d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                            </svg>
                            Certifié UAE
                        </span>
                    </div>

                    <p class="pf2-bio">{{ sanitizeText(student.bio) }}</p>

                    <div class="pf2-stats">
                        <div v-for="stat in studentStats" :key="stat.label" class="pf2-stat">
                            <span class="pf2-stat__val">{{ stat.value }}</span>
                            <span class="pf2-stat__lbl">{{ sanitizeText(stat.label) }}</span>
                        </div>
                    </div>

                    <div class="pf2-social">
                        <!-- open redirect : URLs validées avant d'être rendues -->
                        <a :href="safeUrl(student.linkedin)" target="_blank" rel="noopener noreferrer" class="pf2-social-btn">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                                <path
                                    d="M16 8a6 6 0 016 6v7h-4v-7a2 2 0 00-2-2 2 2 0 00-2 2v7h-4v-7a6 6 0 016-6zM2 9h4v12H2z" />
                                <circle cx="4" cy="4" r="2" />
                            </svg>
                            LinkedIn
                        </a>
                        <a :href="safeUrl(student.github)" target="_blank" rel="noopener noreferrer" class="pf2-social-btn">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                                <path
                                    d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
                            </svg>
                            GitHub
                        </a>
                        <a :href="safeMailto(student.email)" class="pf2-social-btn">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                                stroke-width="2">
                                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                                <polyline points="22,6 12,13 2,6" />
                            </svg>
                            Email
                        </a>
                    </div>
                </div>

                <div class="pf2-hero__right">
                    <div class="pf2-avatar-wrap">
                        <div class="pf2-avatar">{{ sanitizeText(student.initials) }}</div>
                    </div>
                    <div class="pf2-score-card">
                        <p class="pf2-score-label">Score de crédibilité</p>
                        <div class="pf2-score-ring-wrap">
                            <svg class="pf2-score-svg" viewBox="0 0 120 120">
                                <circle cx="60" cy="60" r="52" fill="none" stroke="#1A3055" stroke-width="8" />
                                <circle cx="60" cy="60" r="52" fill="none" :stroke="safeAccentColor" stroke-width="8"
                                    stroke-linecap="round" stroke-dasharray="327"
                                    :stroke-dashoffset="327 - (327 * safeScore / 100)"
                                    transform="rotate(-90 60 60)" />
                            </svg>
                            <div class="pf2-score-inner">
                                <span class="pf2-score-num">{{ safeScore }}</span>
                                <span class="pf2-score-denom">/100</span>
                            </div>
                        </div>
                        <div class="pf2-score-breakdown">
                            <div v-for="item in scoreBreakdown" :key="item.label" class="pf2-score-item">
                                <span>{{ sanitizeText(item.label) }}</span>
                                <span class="pf2-score-pts">{{ sanitizeText(item.pts) }}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <!-- ── PARCOURS ACADÉMIQUE ────────────────────────────────── -->
            <section id="parcours" class="pf2-section pf2-section--mid">
                <div class="pf2-section__header">
                    <p class="pf2-section__label">Mon parcours</p>
                    <h2 class="pf2-section__title">Parcours Académique</h2>
                </div>
                <div class="pf2-parcours-layout">
                    <div class="pf2-parcours__left">
                        <p class="pf2-parcours__about">{{ sanitizeText(student.about) }}</p>
                        <div class="pf2-key-numbers">
                            <div v-for="kn in keyNumbers" :key="kn.label" class="pf2-kn">
                                <span class="pf2-kn__val">{{ kn.value }}</span>
                                <span class="pf2-kn__lbl">{{ sanitizeText(kn.label) }}</span>
                            </div>
                        </div>
                    </div>
                    <div class="pf2-timeline">
                        <div v-for="(step, i) in parcours" :key="i" class="pf2-timeline__item">
                            <div class="pf2-timeline__dot"></div>
                            <div v-if="i < parcours.length - 1" class="pf2-timeline__line"></div>
                            <div class="pf2-timeline__content">
                                <span class="pf2-timeline__year">{{ sanitizeText(step.year) }}</span>
                                <h4 class="pf2-timeline__title">{{ sanitizeText(step.title) }}</h4>
                                <p class="pf2-timeline__school">{{ sanitizeText(step.school) }}</p>
                                <div v-if="step.mention" class="pf2-timeline__badge">{{ sanitizeText(step.mention) }}</div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <!-- ── PROJETS ────────────────────────────────────────────── -->
            <section id="projets" class="pf2-section pf2-section--dark">
                <div class="pf2-section__header pf2-section__header--with-nav">
                    <div>
                        <p class="pf2-section__label">Mes réalisations</p>
                        <h2 class="pf2-section__title">Projets Validés</h2>
                    </div>
                    <div class="pf2-carousel-nav">
                        <button class="pf2-nav-btn" @click="prevProjects" :disabled="projectsIdx === 0">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                                stroke-width="2">
                                <path d="M15 18l-6-6 6-6" />
                            </svg>
                        </button>
                        <button class="pf2-nav-btn" @click="nextProjects"
                            :disabled="projectsIdx >= projects.length - 3">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                                stroke-width="2">
                                <path d="M9 18l6-6-6-6" />
                            </svg>
                        </button>
                    </div>
                </div>

                <div class="pf2-projects-grid">
                    <div v-for="project in visibleProjects" :key="project.id" class="pf2-project-card"
                        @click="openProject(project)">
                        <div class="pf2-project-img">
                            <div class="pf2-project-img__placeholder">
                                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                                    stroke-width="1.5" opacity="0.3">
                                    <rect x="3" y="3" width="18" height="18" rx="2" />
                                    <path d="M3 9h18M9 21V9" />
                                </svg>
                            </div>
                            <div class="pf2-project-img__overlay">
                                <span>Voir le projet →</span>
                            </div>
                        </div>
                        <div class="pf2-project-body">
                            <div class="pf2-project-meta">
                                <span class="pf2-project-cat">{{ sanitizeText(project.category) }}</span>
                                <span v-if="project.certified" class="pf2-cert-badge">✦ Certifié {{ sanitizeText(project.institution) }}</span>
                                <span v-else class="pf2-pending-badge">En attente</span>
                            </div>
                            <h3 class="pf2-project-title">{{ sanitizeText(project.title) }}</h3>
                            <p class="pf2-project-desc">{{ sanitizeText(project.description) }}</p>
                            <div class="pf2-project-tags">
                                <span v-for="tech in project.tech.slice(0,3)" :key="tech" class="pf2-tech-tag">{{ sanitizeText(tech) }}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <!-- ── COMPÉTENCES ────────────────────────────────────────── -->
            <section id="competences" class="pf2-section pf2-section--light">
                <div class="pf2-section__header">
                    <p class="pf2-section__label">Expertise</p>
                    <h2 class="pf2-section__title">Compétences</h2>
                </div>
                <div class="pf2-skills-layout">
                    <div class="pf2-skills__tech">
                        <h3 class="pf2-skills__subtitle">Compétences Techniques</h3>
                        <div class="pf2-skills-list">
                            <div v-for="skill in skills.technical" :key="skill.name" class="pf2-skill-row">
                                <div class="pf2-skill-info">
                                    <span class="pf2-skill-name">{{ sanitizeText(skill.name) }}</span>
                                    <span class="pf2-skill-level">{{ sanitizeText(skill.level) }}</span>
                                    <span class="pf2-skill-pct">{{ safePct(skill.pct) }}%</span>
                                </div>
                                <div class="pf2-skill-bar">
                                    <div class="pf2-skill-fill"
                                        :style="{ width: safePct(skill.pct) + '%', background: safeAccentColor }"></div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="pf2-skills__radar">
                        <h3 class="pf2-skills__subtitle">Vue d'ensemble par domaine</h3>
                        <svg class="pf2-radar-svg" viewBox="0 0 300 300" xmlns="http://www.w3.org/2000/svg">
                            <polygon points="150,30 255,97.5 255,202.5 150,270 45,202.5 45,97.5" fill="none" stroke="#E5E8ED" stroke-width="1"/>
                            <polygon points="150,60 232.5,112.5 232.5,187.5 150,240 67.5,187.5 67.5,112.5" fill="none" stroke="#E5E8ED" stroke-width="1"/>
                            <polygon points="150,90 210,127.5 210,172.5 150,210 90,172.5 90,127.5" fill="none" stroke="#E5E8ED" stroke-width="1"/>
                            <polygon points="150,120 187.5,142.5 187.5,157.5 150,180 112.5,157.5 112.5,142.5" fill="none" stroke="#E5E8ED" stroke-width="1"/>
                            <line x1="150" y1="150" x2="150" y2="30"   stroke="#D1D5DB" stroke-width="1"/>
                            <line x1="150" y1="150" x2="255" y2="97.5" stroke="#D1D5DB" stroke-width="1"/>
                            <line x1="150" y1="150" x2="255" y2="202.5" stroke="#D1D5DB" stroke-width="1"/>
                            <line x1="150" y1="150" x2="150" y2="270"  stroke="#D1D5DB" stroke-width="1"/>
                            <line x1="150" y1="150" x2="45" y2="202.5" stroke="#D1D5DB" stroke-width="1"/>
                            <line x1="150" y1="150" x2="45" y2="97.5"  stroke="#D1D5DB" stroke-width="1"/>
                            <polygon
                                points="150,36 245.4,105.6 233.4,201 150,246 66.6,195 82.8,100.2"
                                fill="rgba(90,137,216,0.18)"
                                stroke="#5A89D8"
                                stroke-width="2"
                                stroke-linejoin="round"/>
                            <circle cx="150"  cy="36"   r="4" fill="#5A89D8"/>
                            <circle cx="245.4" cy="105.6" r="4" fill="#5A89D8"/>
                            <circle cx="233.4" cy="201"  r="4" fill="#5A89D8"/>
                            <circle cx="150"  cy="246"  r="4" fill="#5A89D8"/>
                            <circle cx="66.6" cy="195"  r="4" fill="#5A89D8"/>
                            <circle cx="82.8" cy="100.2" r="4" fill="#5A89D8"/>
                            <text x="150"  y="22"   text-anchor="middle" font-size="11" font-family="Inter,sans-serif" font-weight="600" fill="#0F2040">DevOps</text>
                            <text x="268"  y="100"  text-anchor="start"  font-size="11" font-family="Inter,sans-serif" font-weight="600" fill="#0F2040">Cloud</text>
                            <text x="268"  y="212"  text-anchor="start"  font-size="11" font-family="Inter,sans-serif" font-weight="600" fill="#0F2040">Sécurité</text>
                            <text x="150"  y="286"  text-anchor="middle" font-size="11" font-family="Inter,sans-serif" font-weight="600" fill="#0F2040">Web</text>
                            <text x="32"   y="212"  text-anchor="end"    font-size="11" font-family="Inter,sans-serif" font-weight="600" fill="#0F2040">Data</text>
                            <text x="32"   y="100"  text-anchor="end"    font-size="11" font-family="Inter,sans-serif" font-weight="600" fill="#0F2040">IaC</text>
                            <text x="156"  y="34"   font-size="9" fill="#2B5090" font-family="Inter,sans-serif">95%</text>
                            <text x="248"  y="103"  font-size="9" fill="#2B5090" font-family="Inter,sans-serif">82%</text>
                            <text x="236"  y="209"  font-size="9" fill="#2B5090" font-family="Inter,sans-serif">70%</text>
                            <text x="140"  y="258"  font-size="9" fill="#2B5090" font-family="Inter,sans-serif">65%</text>
                            <text x="46"   y="200"  font-size="9" fill="#2B5090" font-family="Inter,sans-serif">55%</text>
                            <text x="60"   y="100"  font-size="9" fill="#2B5090" font-family="Inter,sans-serif">80%</text>
                        </svg>
                    </div>
                </div>
                <div class="pf2-soft-section">
                    <h3 class="pf2-skills__subtitle">Soft Skills</h3>
                    <div class="pf2-soft-tags">
                        <span v-for="s in skills.soft" :key="s" class="pf2-soft-tag">{{ sanitizeText(s) }}</span>
                    </div>
                </div>
            </section>

            <!-- ── STAGES ─────────────────────────────────────────────── -->
            <section id="stages" class="pf2-section pf2-section--dark">
                <div class="pf2-section__header">
                    <p class="pf2-section__label">Expériences</p>
                    <h2 class="pf2-section__title">Stages et Expériences</h2>
                </div>
                <div class="pf2-stages-list">
                    <div v-for="(stage, i) in stages" :key="stage.id" class="pf2-stage">
                        <div class="pf2-stage__timeline">
                            <div class="pf2-stage__dot" :style="{ background: safeAccentColor }"></div>
                            <div v-if="i < stages.length - 1" class="pf2-stage__line"></div>
                        </div>
                        <div class="pf2-stage__content">
                            <div class="pf2-stage__header">
                                <div>
                                    <h3 class="pf2-stage__role">{{ sanitizeText(stage.role) }}</h3>
                                    <p class="pf2-stage__company" :style="{ color: safeAccentColor }">{{ sanitizeText(stage.company) }}</p>
                                    <p class="pf2-stage__duration">{{ sanitizeText(stage.duration) }}</p>
                                </div>
                                <div class="pf2-stage__badges">
                                    <span v-if="stage.certified" class="pf2-cert-badge">✦ Certifié {{ sanitizeText(stage.institution) }}</span>
                                    <span v-else class="pf2-pending-badge">En attente</span>
                                    <span class="pf2-duration-badge">{{ sanitizeText(stage.months) }}</span>
                                </div>
                            </div>
                            <ul class="pf2-stage__missions">
                                <li v-for="m in stage.missions" :key="m">{{ sanitizeText(m) }}</li>
                            </ul>
                            <div class="pf2-stage__meta">
                                <div class="pf2-stage__meta-row">
                                    <span class="pf2-stage__meta-label">Encadrant académique</span>
                                    <span class="pf2-stage__meta-val">{{ sanitizeText(stage.encadrant) }}</span>
                                </div>
                                <div class="pf2-stage__tech-row">
                                    <span class="pf2-stage__meta-label">Technologies</span>
                                    <div class="pf2-stage__tech-tags">
                                        <span v-for="t in stage.tech" :key="t" class="pf2-tech-tag">{{ sanitizeText(t) }}</span>
                                    </div>
                                </div>
                            </div>
                            <div class="pf2-stage__attachments">
                                <button v-if="stage.attachments.attestation" class="pf2-attach-btn">
                                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                        <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3" />
                                    </svg>
                                    Attestation
                                </button>
                                <button v-if="stage.attachments.rapport" class="pf2-attach-btn">
                                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                        <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3" />
                                    </svg>
                                    Rapport de stage
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <!-- ── ACTIVITÉS ──────────────────────────────────────────── -->
            <section id="activites" class="pf2-section pf2-section--light">
                <div class="pf2-section__header">
                    <p class="pf2-section__label">Engagement</p>
                    <h2 class="pf2-section__title">Activités Parascolaires</h2>
                </div>
                <div class="pf2-activities-grid">
                    <div v-for="act in activites" :key="act.id" class="pf2-activity-card">
                        <div class="pf2-activity-img">
                            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                                stroke-width="1.5" opacity="0.25">
                                <rect x="3" y="3" width="18" height="18" rx="2" />
                                <path d="M8.5 8.5l7 7M15.5 8.5l-7 7" />
                            </svg>
                            <div v-if="act.verified" class="pf2-activity-verified">
                                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                                    <path d="M9 12l2 2 4-4" />
                                    <path d="M12 2l2.09 6.26H21l-5.47 3.97 2.09 6.26L12 15 6.38 18.49l2.09-6.26L1 8.26h6.91z" />
                                </svg>
                                Attestation vérifiée
                            </div>
                            <span v-else class="pf2-activity-pending">En attente</span>
                        </div>
                        <div class="pf2-activity-body">
                            <span class="pf2-activity-cat">{{ sanitizeText(act.category) }}</span>
                            <h4 class="pf2-activity-title">{{ sanitizeText(act.title) }}</h4>
                            <p class="pf2-activity-desc">{{ sanitizeText(act.description) }}</p>
                            <div class="pf2-activity-footer">
                                <button v-if="act.attestation" class="pf2-attach-btn pf2-attach-btn--light">
                                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                        <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3" />
                                    </svg>
                                    Attestation
                                </button>
                                <span v-else class="pf2-activity-no-att">Pas d'attestation</span>
                                <span class="pf2-activity-date">{{ sanitizeText(act.date) }}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <!-- ── BADGES ─────────────────────────────────────────────── -->
            <section id="badges" class="pf2-section pf2-section--dark">
                <div class="pf2-section__header">
                    <p class="pf2-section__label">Distinctions</p>
                    <h2 class="pf2-section__title">Badges & Accomplissements</h2>
                </div>
                <div class="pf2-badges-grid">
                    <div v-for="badge in badges" :key="badge.id" class="pf2-badge-card">
                        <div class="pf2-badge-icon" :style="{ color: safeAccentColor }">
                            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                            </svg>
                        </div>
                        <h4 class="pf2-badge-name">{{ sanitizeText(badge.name) }}</h4>
                        <p class="pf2-badge-desc">{{ sanitizeText(badge.description) }}</p>
                        <span class="pf2-badge-date">{{ sanitizeText(badge.date) }}</span>
                    </div>
                </div>
            </section>

            <!-- ── RECOMMANDATIONS ────────────────────────────────────── -->
            <section id="recommandations" class="pf2-section pf2-section--mid">
                <div class="pf2-section__header pf2-section__header--with-nav">
                    <div>
                        <p class="pf2-section__label">Ce qu'on dit de moi</p>
                        <h2 class="pf2-section__title">Recommandations</h2>
                    </div>
                    <div class="pf2-carousel-nav">
                        <button class="pf2-nav-btn pf2-nav-btn--dark" @click="prevRecs" :disabled="recsIdx === 0">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M15 18l-6-6 6-6" />
                            </svg>
                        </button>
                        <button class="pf2-nav-btn pf2-nav-btn--dark" @click="nextRecs"
                            :disabled="recsIdx >= recommandations.length - 3">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M9 18l6-6-6-6" />
                            </svg>
                        </button>
                    </div>
                </div>
                <div class="pf2-recs-grid">
                    <div v-for="rec in visibleRecs" :key="rec.id" class="pf2-rec-card">
                        <div class="pf2-rec-quote">"</div>
                        <p class="pf2-rec-message">{{ sanitizeText(rec.message) }}</p>
                        <div class="pf2-rec-author">
                            <div class="pf2-rec-avatar">{{ sanitizeText(rec.initials) }}</div>
                            <div>
                                <p class="pf2-rec-name">{{ sanitizeText(rec.name) }}</p>
                                <p class="pf2-rec-role">{{ sanitizeText(rec.company) }}</p>
                            </div>
                            <span :class="['pf2-role-badge', safeRoleBadgeClass(rec.role)]">
                                {{ sanitizeText(rec.role) }}
                            </span>
                        </div>
                    </div>
                </div>
            </section>

            <!-- ── LETTRES ────────────────────────────────────────────── -->
            <section id="lettres" class="pf2-section pf2-section--dark">
                <div class="pf2-section__header">
                    <p class="pf2-section__label">Documents officiels</p>
                    <h2 class="pf2-section__title">Lettres de Recommandation</h2>
                </div>
                <div class="pf2-letters-grid">
                    <div v-for="letter in lettres" :key="letter.id" class="pf2-letter-card">
                        <div class="pf2-letter__author">
                            <div class="pf2-letter__avatar">{{ sanitizeText(letter.initials) }}</div>
                            <div>
                                <p class="pf2-letter__name">{{ sanitizeText(letter.author) }}</p>
                                <p class="pf2-letter__title">{{ sanitizeText(letter.title) }}</p>
                            </div>
                        </div>
                        <div class="pf2-letter__details">
                            <div class="pf2-letter__row">
                                <span>Objectif</span>
                                <span>{{ sanitizeText(letter.purpose) }}</span>
                            </div>
                            <div class="pf2-letter__row">
                                <span>Visibilité</span>
                                <span class="pf2-letter__vis"
                                    :class="letter.visibility === 'public' ? 'pf2-letter__vis--pub' : 'pf2-letter__vis--priv'">
                                    {{ letter.visibility === 'public' ? 'Publique' : 'Privée' }}
                                </span>
                            </div>
                            <div class="pf2-letter__row">
                                <span>Validée</span>
                                <span class="pf2-cert-badge pf2-cert-badge--sm">✦ Validée par l'institution</span>
                            </div>
                        </div>
                        <button v-if="letter.visibility === 'public'" class="pf2-download-btn"
                            :style="{ background: safeAccentColor }">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3" />
                            </svg>
                            Télécharger la lettre
                        </button>
                        <button v-else class="pf2-locked-btn" disabled>
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <rect x="3" y="11" width="18" height="11" rx="2" />
                                <path d="M7 11V7a5 5 0 0110 0v4" />
                            </svg>
                            Privée
                        </button>
                    </div>
                </div>
            </section>

            <!-- ── GITHUB ─────────────────────────────────────────────── -->
            <section id="github" class="pf2-section pf2-section--light">
                <div class="pf2-section__header">
                    <p class="pf2-section__label">Open source</p>
                    <h2 class="pf2-section__title">Activité GitHub</h2>
                </div>
                <div class="pf2-github-layout">
                    <div class="pf2-heatmap-wrap">
                        <h3 class="pf2-github__subtitle">Contributions cette année</h3>
                        <div class="pf2-heatmap">
                            <div v-for="(week, wi) in contributions" :key="wi" class="pf2-heatmap__week">
                                <div v-for="(day, di) in week" :key="di"
                                    :class="['pf2-heatmap__day', `pf2-heatmap__day--${safeHeatmapLevel(day)}`]"
                                    :title="`${safeHeatmapLevel(day)} contributions`"></div>
                            </div>
                        </div>
                        <div class="pf2-heatmap__legend">
                            <span>Moins</span>
                            <div class="pf2-heatmap__day pf2-heatmap__day--0"></div>
                            <div class="pf2-heatmap__day pf2-heatmap__day--1"></div>
                            <div class="pf2-heatmap__day pf2-heatmap__day--2"></div>
                            <div class="pf2-heatmap__day pf2-heatmap__day--3"></div>
                            <div class="pf2-heatmap__day pf2-heatmap__day--4"></div>
                            <span>Plus</span>
                        </div>
                    </div>
                    <div class="pf2-repos">
                        <h3 class="pf2-github__subtitle">Repositories principaux</h3>
                        <div class="pf2-repos-list">
                            <div v-for="repo in github.repos" :key="repo.name" class="pf2-repo">
                                <div>
                                    <p class="pf2-repo__name">{{ sanitizeText(repo.name) }}</p>
                                    <div class="pf2-repo__meta">
                                        <span class="pf2-repo__lang">
                                            <span class="pf2-repo__dot" :style="{ background: langColor(repo.lang) }"></span>
                                            {{ sanitizeText(repo.lang) }}
                                        </span>
                                        <span>{{ safeInt(repo.commits) }} commits</span>
                                    </div>
                                </div>
                                <span class="pf2-repo__activity">{{ sanitizeText(repo.lastActivity) }}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <!-- ── FOOTER ─────────────────────────────────────────────── -->
            <footer class="pf2-footer">
                <div class="pf2-footer__cert">
                    <div class="pf2-footer__seal" :style="{ background: safeAccentColor }">UAE</div>
                    <div>
                        <p class="pf2-footer__cert-text">Portfolio certifié par l'Université Abdelmalek Essaâdi</p>
                        <p class="pf2-footer__cert-date">Vérifié le 15 Mars 2025</p>
                    </div>
                </div>
                <div class="pf2-footer__actions">
                    <button class="pf2-btn-ghost" @click="share" :disabled="isShareLimited">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M4 12v8a2 2 0 002 2h12a2 2 0 002-2v-8M16 6l-4-4-4 4M12 2v13" />
                        </svg>
                        Partager le lien
                    </button>
                    <button class="pf2-btn-accent" @click="downloadPDF" :disabled="isPdfLimited">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3" />
                        </svg>
                        Télécharger PDF
                    </button>
                </div>
                <div class="pf2-footer__brand">
                    <div class="pf2-footer__logo" :style="{ background: safeAccentColor }">T</div>
                    <span>Portfolio généré par Trusty</span>
                </div>
                <p class="pf2-footer__copy">© 2025 Trusty. Plateforme de portfolio académique certifiée.</p>
            </footer>

        </div>

        <!-- ── PROJECT MODAL ─────────────────────────────────────────── -->
        <div v-if="activeProject" class="pf2-modal-overlay" @click.self="activeProject = null">
            <div class="pf2-modal">
                <button class="pf2-modal__close" @click="activeProject = null">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M18 6L6 18M6 6l12 12" />
                    </svg>
                </button>
                <div class="pf2-modal__img">
                    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1" opacity="0.2">
                        <rect x="3" y="3" width="18" height="18" rx="2" />
                        <path d="M3 9h18M9 21V9" />
                    </svg>
                </div>
                <div class="pf2-modal__body">
                    <p class="pf2-modal__category">{{ sanitizeText(activeProject.category) }}</p>
                    <h2 class="pf2-modal__title">{{ sanitizeText(activeProject.title) }}</h2>
                    <p class="pf2-modal__desc">{{ sanitizeText(activeProject.description) }}</p>
                    <div class="pf2-modal__grid">
                        <div class="pf2-modal__cell"><span>Type</span><strong>{{ sanitizeText(activeProject.type) }}</strong></div>
                        <div class="pf2-modal__cell"><span>Rôle</span><strong>{{ sanitizeText(activeProject.role) }}</strong></div>
                        <div class="pf2-modal__cell"><span>Validateur</span><strong>{{ sanitizeText(activeProject.validator) }}</strong></div>
                        <div class="pf2-modal__cell"><span>Équipe</span><strong>{{ sanitizeText(activeProject.team) }}</strong></div>
                    </div>
                    <div v-if="activeProject.results" class="pf2-modal__results">
                        <p class="pf2-modal__results-label">Résultats obtenus</p>
                        <p class="pf2-modal__results-text">{{ sanitizeText(activeProject.results) }}</p>
                    </div>
                    <div v-if="activeProject.appreciation" class="pf2-modal__appreciation">
                        <div class="pf2-modal__appr-header">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/>
                            </svg>
                            <span>Appréciation — {{ sanitizeText(activeProject.validator) }}</span>
                        </div>
                        <p class="pf2-modal__appr-text">« {{ sanitizeText(activeProject.appreciation) }} »</p>
                    </div>
                    <div class="pf2-modal__tech">
                        <span v-for="t in activeProject.tech" :key="t" class="pf2-tech-tag pf2-tech-tag--light">{{ sanitizeText(t) }}</span>
                    </div>
                    <div class="pf2-modal__footer">
                        <span v-if="activeProject.certified" class="pf2-cert-badge">✦ Certifié {{ sanitizeText(activeProject.institution) }}</span>
                        <span v-else class="pf2-pending-badge">En attente de validation</span>
                        <a v-if="activeProject.github" :href="safeUrl(activeProject.github)" target="_blank" rel="noopener noreferrer" class="pf2-btn-accent">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
                            </svg>
                            GitHub
                        </a>
                        <a v-if="activeProject.youtube" :href="safeUrl(activeProject.youtube)" target="_blank" rel="noopener noreferrer" class="pf2-btn-youtube">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                            </svg>
                            Démo vidéo
                        </a>
                    </div>
                </div>
            </div>
        </div>
        </template>

    </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRoute } from 'vue-router'

const accentColor = '#5A89D8'
const isScrolled = ref(false)
const activeTab = ref('hero')
const projectsIdx = ref(0)
const recsIdx = ref(0)
const activeProject = ref(null)

const fontStyle = computed(() => ({
    fontFamily: "'Inter', system-ui, -apple-system, sans-serif"
}))

const tabs = [
    { id: 'parcours',        label: 'À propos' },
    { id: 'projets',         label: 'Projets' },
    { id: 'competences',     label: 'Compétences' },
    { id: 'stages',          label: 'Stages' },
    { id: 'activites',       label: 'Activités' },
    { id: 'badges',          label: 'Badges' },
    { id: 'recommandations', label: 'Recommandations' },
    { id: 'lettres',         label: 'Lettres' },
    { id: 'github',          label: 'GitHub' },
]

const route = useRoute()
const portfolioData = ref(null)
const loading = ref(true)
const error = ref(null)

// --- XSS : encodage de toutes les chaînes affichées depuis l'API ---
const sanitizeText = (value) => {
    if (value === null || value === undefined) return ''
    return String(value)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#x27;')
}

// --- CSS injection : seules les valeurs de couleur valides sont acceptées ---
const SAFE_COLOR_RE = /^(#[0-9a-fA-F]{3,8}|rgb\(\s*\d+\s*,\s*\d+\s*,\s*\d+\s*\)|rgba\(\s*\d+\s*,\s*\d+\s*,\s*[\d.]+\s*\)|hsl\(\s*\d+\s*,\s*[\d.]+%\s*,\s*[\d.]+%\s*\)|[a-zA-Z]{2,30})$/

const safeColor = (color, fallback = '#5A89D8') => {
    if (!color || typeof color !== 'string') return fallback
    return SAFE_COLOR_RE.test(color.trim()) ? color.trim() : fallback
}

const safeAccentColor = safeColor(accentColor)

// --- Valeur numérique bornée pour le score (0–100) ---
const safeScore = computed(() => {
    const s = Number(student.value.score)
    if (!Number.isFinite(s)) return 0
    return Math.min(100, Math.max(0, Math.round(s)))
})

// --- Pourcentage borné pour les barres de compétences ---
const safePct = (pct) => {
    const n = Number(pct)
    if (!Number.isFinite(n)) return 0
    return Math.min(100, Math.max(0, Math.round(n)))
}

// --- Entier positif sûr (commits, etc.) ---
const safeInt = (value) => {
    const n = Number(value)
    if (!Number.isInteger(n) || n < 0) return 0
    return n
}

// --- Open redirect : seules les URLs http/https et github/linkedin sont autorisées ---
const ALLOWED_URL_ORIGINS = [
    'https://github.com',
    'https://www.linkedin.com',
    'https://linkedin.com',
    'https://youtube.com',
    'https://www.youtube.com',
]

const safeUrl = (url) => {
    if (!url || typeof url !== 'string') return '#'
    try {
        const parsed = new URL(url)
        if (parsed.protocol !== 'https:' && parsed.protocol !== 'http:') return '#'
        const origin = parsed.origin
        if (!ALLOWED_URL_ORIGINS.some(allowed => origin === allowed || origin.endsWith('.' + allowed.replace('https://', '')))) {
            return '#'
        }
        return url
    } catch {
        return '#'
    }
}

// --- mailto : validation basique de l'adresse email ---
const safeMailto = (email) => {
    if (!email || typeof email !== 'string') return '#'
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) return '#'
    return `mailto:${email.trim()}`
}

// --- Niveau heatmap borné à [0–4] pour éviter des classes CSS arbitraires ---
const safeHeatmapLevel = (level) => {
    const n = Number(level)
    if (!Number.isFinite(n)) return 0
    return Math.min(4, Math.max(0, Math.floor(n)))
}

// --- Classe CSS du badge de rôle : whitelist stricte ---
const ALLOWED_ROLE_CLASSES = {
    'Professeur':     'pf2-role-badge--professeur',
    'Professionnel':  'pf2-role-badge--professionnel',
    'Étudiant':       'pf2-role-badge--étudiant',
}

const safeRoleBadgeClass = (role) => {
    return ALLOWED_ROLE_CLASSES[role] || 'pf2-role-badge--étudiant'
}

// --- URL de l'API : validation du paramètre de route avant le fetch ---
const isValidRouteParam = (param) => {
    if (!param || typeof param !== 'string') return false
    // Accepte uniquement des slugs alphanumériques (lettres, chiffres, tirets, underscores)
    return /^[a-zA-Z0-9_-]{1,100}$/.test(param.trim())
}

// --- Rate limiting : share() max 5/min, downloadPDF() max 3/min ---
const shareTimestamps  = ref([])
const pdfTimestamps    = ref([])
const RL_WINDOW_MS     = 60_000

const isShareLimited = computed(() => {
    const now = Date.now()
    return shareTimestamps.value.filter(ts => now - ts < RL_WINDOW_MS).length >= 5
})

const isPdfLimited = computed(() => {
    const now = Date.now()
    return pdfTimestamps.value.filter(ts => now - ts < RL_WINDOW_MS).length >= 3
})

onMounted(async () => {
    window.addEventListener('scroll', handleScroll)
    try {
        const raw = route.params.url_publique || route.params.username
        // Validation du paramètre de route avant utilisation dans le fetch
        if (!isValidRouteParam(raw)) {
            error.value = 'Portfolio introuvable'
            return
        }
        const url = encodeURIComponent(String(raw).trim())
        const res = await fetch(`/api/portfolio/${url}`)
        const json = await res.json()
        if (!res.ok || !json.success) {
            error.value = 'Portfolio introuvable'
            return
        }
        portfolioData.value = json.data
    } catch (e) {
        console.error('[PortfolioTemplate1] fetch error:', e)
        error.value = 'Erreur de connexion'
    } finally {
        loading.value = false
    }
})

onUnmounted(() => window.removeEventListener('scroll', handleScroll))

function formatDate(dateStr) {
    if (!dateStr) return ''
    const parsed = new Date(dateStr)
    if (isNaN(parsed.getTime())) return ''
    return parsed.toLocaleDateString('fr-FR', { month: 'short', year: 'numeric' })
}

function calcDuration(start, end) {
    if (!start || !end) return ''
    const startDate = new Date(start)
    const endDate   = new Date(end)
    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) return ''
    const months = Math.round((endDate - startDate) / (1000 * 60 * 60 * 24 * 30))
    if (months < 0 || months > 120) return ''
    return `${months} mois`
}

const student = computed(() => {
    if (!portfolioData.value) return {}
    const e = portfolioData.value.etudiant
    const u = e.utilisateur
    return {
        initials: `${u.prenom?.[0] || ''}${u.nom?.[0] || ''}`.toUpperCase(),
        prenom: u.prenom,
        nom: u.nom,
        school: u.ecole || 'ENSA Tanger',
        year: e.annee ? `${e.annee}ème année` : '',
        specialization: e.filiere || 'Génie Informatique',
        objective: e.objectif_professionnel || '',
        score: e.score_credibilite || 0,
        bio: e.biographie || '',
        about: e.biographie || '',
        linkedin: e.linkedin_url || '#',
        github: e.github_username ? `https://github.com/${e.github_username}` : '#',
        email: u.email || '',
        stats: {
            projets: e.participations_projets?.length || 0,
            recs: e.recommendation?.length || 0,
            commits: e.depots_github?.reduce((sum, d) => sum + (d.nombre_commits || 0), 0) || 0,
            vues: portfolioData.value.nombre_vues || 0
        }
    }
})

const studentStats = computed(() => [
    { value: student.value.stats?.projets || 0, label: 'projets validés' },
    { value: student.value.stats?.recs || 0,    label: 'recommandations' },
    { value: student.value.stats?.commits || 0, label: 'commits' },
    { value: student.value.stats?.vues || 0,    label: 'vues' },
])

const projects = computed(() => {
    if (!portfolioData.value) return []
    return (portfolioData.value.etudiant.participations_projets || []).map(p => ({
        id: p.projet.id_projet,
        category: p.projet.type_projet || 'Projet',
        title: p.projet.titre,
        description: p.projet.description,
        tech: p.projet.technologies?.map(t => t.technologie.nom) || [],
        certified: p.projet.status_validation === 'VALIDE',
        institution: 'UAE',
        validator: '',
        appreciation: p.projet.appreciation || null,
        type: p.projet.type_projet,
        role: p.role_joue,
        team: '',
        github: p.projet.lien_github || null,
        youtube: p.projet.lien_demo || null,
        results: p.projet.resultats_obtenus || null
    }))
})

const visibleProjects = computed(() => projects.value.slice(projectsIdx.value, projectsIdx.value + 3))
function nextProjects() { if (projectsIdx.value < projects.value.length - 3) projectsIdx.value++ }
function prevProjects() { if (projectsIdx.value > 0) projectsIdx.value-- }
function openProject(p) { activeProject.value = p }

const skills = computed(() => {
    if (!portfolioData.value) return { technical: [], soft: [] }
    const competences = portfolioData.value.etudiant.competences || []
    return {
        technical: competences
            .filter(c => c.competence.type === 'TECHNIQUE')
            .map(c => ({
                name: c.competence.nom,
                level: c.niveau_maitrise,
                pct: { DEBUTANT: 25, INTERMEDIAIRE: 55, AVANCE: 80, EXPERT: 95 }[c.niveau_maitrise] ?? 50
            })),
        soft: competences
            .filter(c => c.competence.type === 'COMPORTEMENTALE')
            .map(c => c.competence.nom)
    }
})

const stages = computed(() => {
    if (!portfolioData.value) return []
    return (portfolioData.value.etudiant.stages || []).map(s => ({
        id: s.id_stage,
        company: s.entreprise,
        role: s.poste,
        duration: `${formatDate(s.date_debut)} - ${formatDate(s.date_fin)}`,
        months: calcDuration(s.date_debut, s.date_fin),
        certified: s.status_validation === 'VALIDE',
        institution: 'UAE',
        encadrant: s.encadrant_academique || '',
        tech: s.technologies?.map(t => t.technologie.nom) || [],
        missions: s.missions ? s.missions.split('\n').filter(Boolean) : [],
        attachments: { attestation: true, rapport: !!s.id_rapport }
    }))
})

const activites = computed(() => {
    if (!portfolioData.value) return []
    return (portfolioData.value.etudiant.activites_parascolaires || []).map(a => ({
        id: a.id_activite,
        category: a.type_activite,
        title: a.nom_activite,
        description: a.description,
        date: formatDate(a.date_debut),
        verified: a.status_validation === 'VALIDE',
        attestation: !!a.id_attestation
    }))
})

const badges = computed(() => {
    if (!portfolioData.value) return []
    return (portfolioData.value.etudiant.badges || []).map(b => ({
        id: b.badge.id_badge,
        name: b.badge.nom,
        description: b.badge.description,
        date: formatDate(b.date_attribution)
    }))
})

const recommandations = computed(() => {
    if (!portfolioData.value) return []
    return (portfolioData.value.etudiant.recommendation || []).map((r, i) => ({
        id: i,
        initials: `${r.auteur.prenom?.[0] || ''}${r.auteur.nom?.[0] || ''}`.toUpperCase(),
        name: `${r.auteur.prenom} ${r.auteur.nom}`,
        company: '',
        role: r.auteur.role === 'PROFESSEUR' ? 'Professeur' : r.auteur.role === 'PROFESSIONNEL' ? 'Professionnel' : 'Étudiant',
        message: r.message,
        date: formatDate(r.date_creation)
    }))
})

const visibleRecs = computed(() => recommandations.value.slice(recsIdx.value, recsIdx.value + 3))
function nextRecs() { if (recsIdx.value < recommandations.value.length - 3) recsIdx.value++ }
function prevRecs() { if (recsIdx.value > 0) recsIdx.value-- }

const lettres = computed(() => [])

const github = computed(() => {
    if (!portfolioData.value) return { repos: [] }
    return {
        repos: (portfolioData.value.etudiant.depots_github || []).map(d => ({
            name: d.nom_depot,
            lang: d.langage_principal || 'JavaScript',
            commits: d.nombre_commits || 0,
            lastActivity: formatDate(d.date_dernier_commit)
        }))
    }
})

const scoreBreakdown = computed(() => [
    { label: 'Projets vérifiés', pts: `+${projects.value.filter(p => p.certified).length * 5} pts` },
    { label: 'Stages certifiés', pts: `+${stages.value.filter(s => s.certified).length * 10} pts` },
    { label: 'Recommandations',  pts: `+${recommandations.value.length * 5} pts` },
])

const keyNumbers = computed(() => [
    { value: student.value.stats?.projets || 0, label: 'Projets réalisés' },
    { value: skills.value.technical?.length || 0, label: 'Technologies' },
    { value: stages.value.length || 0, label: 'Stages' },
])

const parcours = [
    { year: '2022',      title: 'Baccalauréat Sciences Maths', school: 'Lycée Mohamed V',  mention: 'Mention Très Bien' },
    { year: '2022-2024', title: 'Cycle Préparatoire',          school: 'CPGE Tanger',       mention: null },
    { year: '2024-2025', title: 'Génie Informatique — 1ère année', school: 'ENSA Tanger',  mention: null },
]

const contributions = Array.from({ length: 52 }, () =>
    Array.from({ length: 7 }, () => Math.floor(Math.random() * 5))
)

function langColor(lang) {
    const map = { TypeScript: '#3178C6', JavaScript: '#F7DF1E', Python: '#3776AB', Go: '#00ADD8', Rust: '#CE422B' }
    const color = map[String(lang)] || '#888'
    return safeColor(color, '#888888')
}

function scrollTo(id) { document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' }) }

function share() {
    if (isShareLimited.value) return
    const now = Date.now()
    shareTimestamps.value = [...shareTimestamps.value.filter(ts => now - ts < RL_WINDOW_MS), now]
    navigator.clipboard?.writeText(window.location.href)
    alert('Lien copié !')
}

function downloadPDF() {
    if (isPdfLimited.value) return
    const now = Date.now()
    pdfTimestamps.value = [...pdfTimestamps.value.filter(ts => now - ts < RL_WINDOW_MS), now]
    window.print()
}

function handleScroll() {
    isScrolled.value = window.scrollY > 80
    const ids = ['hero', ...tabs.map(t => t.id)]
    for (const id of ids) {
        const el = document.getElementById(id)
        if (el) {
            const rect = el.getBoundingClientRect()
            if (rect.top <= 120 && rect.bottom >= 120) { activeTab.value = id; break }
        }
    }
}
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Lora:ital,wght@0,600;1,400&display=swap');

*,
*::before,
*::after { box-sizing: border-box; margin: 0; padding: 0; }

.pf2 {
    background: #F8FAFC;
    min-height: 100vh;
    font-family: 'Inter', system-ui, -apple-system, sans-serif;
    color: #1A1D2E;
    -webkit-font-smoothing: antialiased;
}

.pf2-nav {
    position: fixed;
    top: 0; left: 0; right: 0;
    z-index: 100;
    background: rgba(10, 22, 40, 0.97);
    box-shadow: 0 1px 0 rgba(255,255,255,0.06);
    backdrop-filter: blur(8px);
    transition: background 0.3s, box-shadow 0.3s;
}
.pf2-nav--scrolled {
    background: rgba(10, 22, 40, 0.99);
    box-shadow: 0 1px 0 rgba(255,255,255,0.08);
}
.pf2-nav__inner {
    max-width: 1100px;
    margin: 0 auto;
    padding: 0 24px;
    height: 56px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 16px;
}
.pf2-back {
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: 13px;
    font-weight: 500;
    color: rgba(255,255,255,0.5);
    text-decoration: none;
    transition: color 0.2s;
    white-space: nowrap;
}
.pf2-back:hover { color: #fff; }

.pf2-tabs { display: flex; gap: 2px; overflow-x: auto; scrollbar-width: none; }
.pf2-tabs::-webkit-scrollbar { display: none; }
.pf2-tab {
    background: none;
    border: none;
    padding: 6px 12px;
    font-size: 13px;
    font-weight: 400;
    color: rgba(255,255,255,0.45);
    cursor: pointer;
    border-radius: 6px;
    transition: color 0.2s, background 0.2s;
    white-space: nowrap;
    font-family: inherit;
    letter-spacing: -0.1px;
}
.pf2-tab:hover { color: rgba(255,255,255,0.8); }
.pf2-tab--active { color: #fff; background: rgba(255,255,255,0.08); font-weight: 500; }

.pf2-nav__actions { display: flex; gap: 8px; flex-shrink: 0; }

.pf2-btn-ghost {
    display: flex;
    align-items: center;
    gap: 6px;
    background: transparent;
    border: 1px solid rgba(255,255,255,0.2);
    color: rgba(255,255,255,0.7);
    padding: 6px 14px;
    border-radius: 8px;
    font-size: 13px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s;
    font-family: inherit;
}
.pf2-btn-ghost:hover:not(:disabled) { border-color: rgba(255,255,255,0.5); color: #fff; }
.pf2-btn-ghost:disabled { opacity: 0.4; cursor: not-allowed; }
.pf2-btn-ghost--light { border-color: rgba(26,29,46,0.2); color: rgba(26,29,46,0.6); }
.pf2-btn-ghost--light:hover { border-color: rgba(26,29,46,0.5); color: #1A1D2E; }

.pf2-btn-accent {
    display: flex;
    align-items: center;
    gap: 6px;
    background: #2B5090;
    color: #fff;
    border: none;
    padding: 6px 14px;
    border-radius: 8px;
    font-size: 13px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s;
    font-family: inherit;
}
.pf2-btn-accent:hover:not(:disabled) { background: #3B6BC4; }
.pf2-btn-accent:disabled { opacity: 0.4; cursor: not-allowed; }

.pf2-doc { max-width: 1100px; margin: 0 auto; background: #FFFFFF; }

.pf2-hero {
    display: grid;
    grid-template-columns: 1fr auto;
    gap: 48px;
    padding: 120px 64px 80px;
    background: #0F2040;
}
.pf2-name {
    font-family: 'Lora', Georgia, serif;
    font-size: clamp(44px, 5.5vw, 72px);
    font-weight: 600;
    color: #FFFFFF;
    line-height: 1.05;
    letter-spacing: -1.5px;
    margin-bottom: 14px;
}
.pf2-role { font-size: 18px; font-weight: 400; color: rgba(255,255,255,0.55); margin-bottom: 4px; }
.pf2-school { font-size: 14px; color: rgba(255,255,255,0.35); margin-bottom: 24px; }

.pf2-hero__badges { display: flex; gap: 10px; flex-wrap: wrap; margin-bottom: 22px; }
.pf2-badge-obj {
    background: rgba(255,255,255,0.07);
    color: rgba(255,255,255,0.6);
    font-size: 12.5px;
    font-weight: 500;
    padding: 5px 13px;
    border-radius: 20px;
    border: 1px solid rgba(255,255,255,0.1);
}
.pf2-badge-cert {
    display: flex;
    align-items: center;
    gap: 6px;
    background: rgba(212,168,67,0.15);
    color: #D4A843;
    font-size: 12.5px;
    font-weight: 500;
    padding: 5px 13px;
    border-radius: 20px;
    border: 1px solid rgba(212,168,67,0.3);
}
.pf2-bio {
    font-family: 'Lora', Georgia, serif;
    font-style: italic;
    font-size: 16px;
    color: rgba(255,255,255,0.5);
    line-height: 1.8;
    margin-bottom: 32px;
    max-width: 520px;
}
.pf2-stats {
    display: flex;
    gap: 28px;
    flex-wrap: wrap;
    margin-bottom: 28px;
    padding-top: 24px;
    border-top: 1px solid rgba(255,255,255,0.08);
}
.pf2-stat { display: flex; flex-direction: column; gap: 3px; }
.pf2-stat__val { font-size: 24px; font-weight: 700; color: #FFFFFF; letter-spacing: -0.5px; }
.pf2-stat__lbl { font-size: 11px; color: rgba(255,255,255,0.35); text-transform: uppercase; letter-spacing: 0.5px; font-weight: 500; }

.pf2-social { display: flex; gap: 8px; flex-wrap: wrap; }
.pf2-social-btn {
    display: flex;
    align-items: center;
    gap: 6px;
    background: rgba(255,255,255,0.06);
    border: 1px solid rgba(255,255,255,0.1);
    color: rgba(255,255,255,0.6);
    padding: 7px 14px;
    border-radius: 8px;
    font-size: 13px;
    font-weight: 500;
    text-decoration: none;
    transition: all 0.2s;
    font-family: inherit;
}
.pf2-social-btn:hover { background: rgba(255,255,255,0.1); color: #fff; }

.pf2-hero__right { display: flex; flex-direction: column; gap: 20px; align-items: center; }
.pf2-avatar {
    width: 140px; height: 140px;
    border-radius: 50%;
    background: #1A3055;
    border: 3px solid rgba(90,137,216,0.4);
    display: flex;
    align-items: center;
    justify-content: center;
    font-family: 'Lora', Georgia, serif;
    font-size: 44px;
    font-weight: 600;
    color: #8AAEE8;
}
.pf2-score-card {
    background: #1A3055;
    border: 1px solid rgba(255,255,255,0.06);
    border-radius: 16px;
    padding: 20px;
    text-align: center;
    width: 200px;
}
.pf2-score-label {
    font-size: 10px;
    font-weight: 600;
    color: rgba(255,255,255,0.3);
    text-transform: uppercase;
    letter-spacing: 1px;
    margin-bottom: 12px;
}
.pf2-score-ring-wrap { position: relative; width: 120px; height: 120px; margin: 0 auto 12px; }
.pf2-score-svg { width: 100%; height: 100%; }
.pf2-score-inner {
    position: absolute; inset: 0;
    display: flex; align-items: center; justify-content: center; flex-direction: column;
}
.pf2-score-num { font-size: 36px; font-weight: 700; color: #fff; letter-spacing: -1px; line-height: 1; }
.pf2-score-denom { font-size: 13px; color: rgba(255,255,255,0.3); }
.pf2-score-breakdown { display: flex; flex-direction: column; gap: 6px; }
.pf2-score-item { display: flex; justify-content: space-between; font-size: 11.5px; color: rgba(255,255,255,0.4); }
.pf2-score-pts { color: #8AAEE8; font-weight: 600; }

.pf2-section { padding: 80px 64px; }
.pf2-section--light { background: #FFFFFF; }
.pf2-section--mid   { background: #F1F3F6; }
.pf2-section--dark  { background: #0F2040; }

.pf2-section__header { margin-bottom: 48px; }
.pf2-section__header--with-nav {
    display: flex;
    align-items: flex-end;
    justify-content: space-between;
    margin-bottom: 40px;
}
.pf2-section__label {
    font-size: 11px;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 2px;
    margin-bottom: 8px;
}
.pf2-section--light .pf2-section__label,
.pf2-section--mid   .pf2-section__label { color: #2B5090; }
.pf2-section--dark  .pf2-section__label { color: #8AAEE8; }

.pf2-section__title {
    font-family: 'Lora', Georgia, serif;
    font-size: clamp(28px, 3.5vw, 44px);
    font-weight: 600;
    line-height: 1.1;
    letter-spacing: -0.5px;
}
.pf2-section--light .pf2-section__title,
.pf2-section--mid   .pf2-section__title { color: #0F2040; }
.pf2-section--dark  .pf2-section__title { color: #FFFFFF; }

.pf2-carousel-nav { display: flex; gap: 8px; }
.pf2-nav-btn {
    width: 40px; height: 40px;
    border-radius: 50%;
    border: 1px solid rgba(255,255,255,0.15);
    background: transparent;
    color: rgba(255,255,255,0.5);
    cursor: pointer;
    display: flex; align-items: center; justify-content: center;
    transition: all 0.2s;
}
.pf2-nav-btn:hover:not(:disabled) { border-color: #5A89D8; color: #8AAEE8; }
.pf2-nav-btn:disabled { opacity: 0.3; cursor: default; }
.pf2-nav-btn--dark { border-color: #D1D5DB; color: #9CA3AF; }
.pf2-nav-btn--dark:hover:not(:disabled) { border-color: #2B5090; color: #2B5090; }

.pf2-parcours-layout { display: grid; grid-template-columns: 1fr 1fr; gap: 64px; }
.pf2-parcours__about {
    font-family: 'Lora', Georgia, serif;
    font-style: italic;
    font-size: 17px;
    color: #374151;
    line-height: 1.8;
    margin-bottom: 40px;
}
.pf2-key-numbers {
    display: flex;
    gap: 32px;
    padding-top: 32px;
    border-top: 1px solid #E5E8ED;
}
.pf2-kn { display: flex; flex-direction: column; gap: 4px; }
.pf2-kn__val { font-size: 38px; font-weight: 700; color: #0F2040; letter-spacing: -1px; line-height: 1; }
.pf2-kn__lbl { font-size: 11px; color: #9CA3AF; text-transform: uppercase; letter-spacing: 0.5px; font-weight: 500; }

.pf2-timeline { display: flex; flex-direction: column; }
.pf2-timeline__item { position: relative; display: flex; gap: 20px; padding-bottom: 32px; }
.pf2-timeline__dot {
    width: 10px; height: 10px;
    border-radius: 50%;
    background: #2B5090;
    flex-shrink: 0;
    margin-top: 8px;
}
.pf2-timeline__line {
    position: absolute;
    left: 4px; top: 18px; bottom: 0;
    width: 1px;
    background: #D1D5DB;
}
.pf2-timeline__year {
    font-size: 11px;
    font-weight: 600;
    color: #2B5090;
    text-transform: uppercase;
    letter-spacing: 1px;
    margin-bottom: 4px;
    display: block;
}
.pf2-timeline__title { font-size: 17px; font-weight: 600; color: #0F2040; margin-bottom: 3px; }
.pf2-timeline__school { font-size: 13.5px; color: #6B7280; margin-bottom: 8px; }
.pf2-timeline__badge {
    display: inline-block;
    font-size: 11px;
    font-weight: 500;
    background: #F0F5FD;
    color: #2B5090;
    border: 1px solid #BCCFF3;
    padding: 2px 10px;
    border-radius: 20px;
}

.pf2-projects-grid { display: grid; grid-template-columns: repeat(3,1fr); gap: 24px; }
.pf2-project-card {
    border: 1px solid rgba(255,255,255,0.07);
    border-radius: 12px;
    overflow: hidden;
    cursor: pointer;
    transition: border-color 0.2s, transform 0.2s;
    background: #1A3055;
}
.pf2-project-card:hover { border-color: rgba(90,137,216,0.45); transform: translateY(-3px); }
.pf2-project-img {
    height: 200px;
    background: #0F2040;
    display: flex; align-items: center; justify-content: center;
    position: relative; overflow: hidden;
}
.pf2-project-img__placeholder { display: flex; align-items: center; justify-content: center; width: 100%; height: 100%; }
.pf2-project-img__overlay {
    position: absolute; inset: 0;
    background: rgba(43,80,144,0.92);
    display: flex; align-items: center; justify-content: center;
    font-size: 13.5px; font-weight: 600; color: #fff;
    opacity: 0; transition: opacity 0.2s;
}
.pf2-project-card:hover .pf2-project-img__overlay { opacity: 1; }
.pf2-project-body { padding: 20px; }
.pf2-project-meta { display: flex; align-items: center; gap: 8px; margin-bottom: 10px; flex-wrap: wrap; }
.pf2-project-cat {
    font-size: 10.5px;
    font-weight: 600;
    background: rgba(255,255,255,0.06);
    color: rgba(255,255,255,0.45);
    padding: 3px 9px;
    border-radius: 20px;
    text-transform: uppercase;
    letter-spacing: 0.5px;
}
.pf2-project-title { font-size: 19px; font-weight: 600; color: #FFFFFF; margin-bottom: 8px; letter-spacing: -0.2px; }
.pf2-project-desc {
    font-family: 'Lora', Georgia, serif;
    font-style: italic;
    font-size: 13.5px;
    color: rgba(255,255,255,0.4);
    line-height: 1.65;
    margin-bottom: 14px;
}
.pf2-project-tags { display: flex; gap: 6px; flex-wrap: wrap; }

.pf2-tech-tag {
    font-size: 11px;
    font-weight: 500;
    padding: 2px 8px;
    background: rgba(255,255,255,0.06);
    color: rgba(255,255,255,0.5);
    border-radius: 4px;
    border: 1px solid rgba(255,255,255,0.08);
}
.pf2-tech-tag--light {
    background: rgba(15,32,64,0.05);
    color: #374151;
    border-color: #E5E8ED;
}

.pf2-cert-badge {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    font-size: 11px;
    font-weight: 500;
    background: rgba(212,168,67,0.12);
    color: #B8860B;
    border: 1px solid rgba(212,168,67,0.28);
    padding: 3px 9px;
    border-radius: 20px;
}
.pf2-cert-badge--sm { font-size: 10px; padding: 2px 8px; }
.pf2-pending-badge {
    font-size: 11px;
    font-weight: 500;
    background: rgba(107,114,128,0.08);
    color: #6B7280;
    border: 1px solid rgba(107,114,128,0.2);
    padding: 3px 9px;
    border-radius: 20px;
}

.pf2-skills-layout { display: grid; grid-template-columns: 1fr 1fr; gap: 64px; }
.pf2-skills__subtitle { font-size: 17px; font-weight: 600; color: #0F2040; margin-bottom: 24px; }
.pf2-skills-list { display: flex; flex-direction: column; gap: 18px; }
.pf2-skill-info { display: flex; align-items: center; gap: 8px; margin-bottom: 6px; }
.pf2-skill-name { font-size: 14px; font-weight: 500; color: #1A1D2E; flex: 1; }
.pf2-skill-level { font-size: 12px; color: #9CA3AF; }
.pf2-skill-pct { font-size: 13px; font-weight: 600; color: #0F2040; min-width: 36px; text-align: right; }
.pf2-skill-bar { height: 3px; background: #E5E8ED; border-radius: 2px; }
.pf2-skill-fill { height: 3px; border-radius: 2px; transition: width 0.5s; }

.pf2-soft-tags { display: flex; flex-wrap: wrap; gap: 10px; }
.pf2-soft-tag {
    font-size: 13.5px;
    font-weight: 400;
    padding: 7px 17px;
    border: 1px solid #D1D5DB;
    color: #374151;
    border-radius: 30px;
    transition: all 0.2s;
    cursor: default;
}
.pf2-soft-tag:hover { background: #0F2040; color: #fff; border-color: #0F2040; }

.pf2-stages-list { display: flex; flex-direction: column; gap: 0; }
.pf2-stage { display: flex; gap: 24px; }
.pf2-stage__timeline { display: flex; flex-direction: column; align-items: center; padding-top: 8px; }
.pf2-stage__dot { width: 12px; height: 12px; border-radius: 50%; flex-shrink: 0; }
.pf2-stage__line { flex: 1; width: 1px; background: rgba(255,255,255,0.07); margin-top: 8px; }
.pf2-stage__content { flex: 1; padding-bottom: 48px; }
.pf2-stage__header { display: flex; justify-content: space-between; align-items: flex-start; gap: 16px; margin-bottom: 16px; flex-wrap: wrap; }
.pf2-stage__role { font-size: 21px; font-weight: 600; color: #FFFFFF; margin-bottom: 4px; letter-spacing: -0.2px; }
.pf2-stage__company { font-size: 15px; font-weight: 600; margin-bottom: 4px; }
.pf2-stage__duration { font-size: 12.5px; color: rgba(255,255,255,0.35); }
.pf2-stage__badges { display: flex; flex-direction: column; gap: 6px; align-items: flex-end; }
.pf2-duration-badge {
    font-size: 11px;
    font-weight: 500;
    background: rgba(255,255,255,0.05);
    color: rgba(255,255,255,0.4);
    padding: 3px 9px;
    border-radius: 20px;
    border: 1px solid rgba(255,255,255,0.08);
}
.pf2-stage__missions { list-style: none; display: flex; flex-direction: column; gap: 8px; margin-bottom: 16px; }
.pf2-stage__missions li {
    font-family: 'Lora', Georgia, serif;
    font-style: italic;
    font-size: 14.5px;
    color: rgba(255,255,255,0.45);
    padding-left: 18px;
    position: relative;
    line-height: 1.6;
}
.pf2-stage__missions li::before { content: '—'; position: absolute; left: 0; color: #5A89D8; }
.pf2-stage__attachments { display: flex; gap: 8px; flex-wrap: wrap; }
.pf2-attach-btn {
    display: flex;
    align-items: center;
    gap: 5px;
    background: rgba(255,255,255,0.04);
    border: 1px solid rgba(255,255,255,0.08);
    color: rgba(255,255,255,0.45);
    padding: 5px 12px;
    border-radius: 6px;
    font-size: 12px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s;
    font-family: inherit;
}
.pf2-attach-btn:hover { background: rgba(255,255,255,0.08); color: #fff; }

.pf2-activities-grid { display: grid; grid-template-columns: repeat(2,1fr); gap: 20px; }
.pf2-activity-card { border: 1px solid #E5E8ED; border-radius: 12px; overflow: hidden; background: #fff; }
.pf2-activity-img {
    height: 140px;
    background: #F0F5FD;
    display: flex; align-items: center; justify-content: center;
    position: relative;
}
.pf2-activity-verified {
    position: absolute; top: 10px; right: 10px;
    display: flex; align-items: center; gap: 4px;
    font-size: 10px;
    font-weight: 600;
    background: #F0F5FD;
    color: #2B5090;
    border: 1px solid #BCCFF3;
    padding: 3px 8px;
    border-radius: 20px;
}
.pf2-activity-pending {
    position: absolute; top: 10px; right: 10px;
    font-size: 10px;
    font-weight: 500;
    background: #F8FAFC;
    color: #9CA3AF;
    border: 1px solid #D1D5DB;
    padding: 3px 8px;
    border-radius: 20px;
}
.pf2-activity-body { padding: 16px 18px; }
.pf2-activity-cat {
    font-size: 10px;
    font-weight: 600;
    color: #2B5090;
    text-transform: uppercase;
    letter-spacing: 1px;
    margin-bottom: 6px;
    display: block;
}
.pf2-activity-title { font-size: 16px; font-weight: 600; color: #0F2040; margin-bottom: 5px; }
.pf2-activity-desc {
    font-family: 'Lora', Georgia, serif;
    font-style: italic;
    font-size: 13px;
    color: #6B7280;
    line-height: 1.6;
    margin-bottom: 12px;
}
.pf2-activity-footer {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding-top: 10px;
    border-top: 1px solid #E5E8ED;
    font-size: 11.5px;
    color: #9CA3AF;
}

.pf2-badges-grid { display: grid; grid-template-columns: repeat(4,1fr); gap: 16px; }
.pf2-badge-card {
    background: #1A3055;
    border: 1px solid rgba(255,255,255,0.06);
    border-radius: 12px;
    padding: 24px;
    text-align: center;
    transition: border-color 0.2s;
}
.pf2-badge-card:hover { border-color: rgba(90,137,216,0.3); }
.pf2-badge-icon { margin-bottom: 12px; }
.pf2-badge-name { font-size: 14px; font-weight: 600; color: #FFFFFF; margin-bottom: 6px; }
.pf2-badge-desc {
    font-family: 'Lora', Georgia, serif;
    font-style: italic;
    font-size: 12px;
    color: rgba(255,255,255,0.35);
    line-height: 1.5;
    margin-bottom: 10px;
}
.pf2-badge-date { font-size: 11px; font-weight: 500; color: #8AAEE8; }

.pf2-recs-grid { display: grid; grid-template-columns: repeat(3,1fr); gap: 24px; }
.pf2-rec-card {
    background: #FFFFFF;
    border: 1px solid #E5E8ED;
    border-radius: 12px;
    padding: 28px;
}
.pf2-rec-quote {
    font-size: 56px;
    color: rgba(43,80,144,0.15);
    line-height: 1;
    margin-bottom: -10px;
    font-family: Georgia, serif;
}
.pf2-rec-message {
    font-family: 'Lora', Georgia, serif;
    font-style: italic;
    font-size: 15px;
    color: #374151;
    line-height: 1.8;
    margin-bottom: 22px;
}
.pf2-rec-author { display: flex; align-items: center; gap: 12px; }
.pf2-rec-avatar {
    width: 40px; height: 40px;
    border-radius: 50%;
    background: #F0F5FD;
    display: flex; align-items: center; justify-content: center;
    font-size: 13px;
    font-weight: 700;
    color: #2B5090;
    flex-shrink: 0;
}
.pf2-rec-name { font-size: 13.5px; font-weight: 600; color: #0F2040; }
.pf2-rec-role { font-size: 11.5px; color: #9CA3AF; }
.pf2-role-badge { font-size: 10.5px; font-weight: 500; padding: 2px 9px; border-radius: 20px; margin-left: auto; }
.pf2-role-badge--professeur  { background: #F0F5FD; color: #2B5090; border: 1px solid #BCCFF3; }
.pf2-role-badge--professionnel { background: #EAF3DE; color: #3B6D11; border: 1px solid #C0DD97; }
.pf2-role-badge--étudiant    { background: #EEEDFE; color: #534AB7; border: 1px solid #AFA9EC; }

.pf2-letters-grid { display: grid; grid-template-columns: repeat(3,1fr); gap: 20px; }
.pf2-letter-card {
    background: #1A3055;
    border: 1px solid rgba(255,255,255,0.07);
    border-radius: 12px;
    padding: 20px;
}
.pf2-letter__author { display: flex; gap: 12px; align-items: flex-start; margin-bottom: 16px; }
.pf2-letter__avatar {
    width: 40px; height: 40px;
    border-radius: 50%;
    background: #0F2040;
    display: flex; align-items: center; justify-content: center;
    font-size: 13px; font-weight: 700; color: #8AAEE8;
    flex-shrink: 0;
}
.pf2-letter__name { font-size: 13.5px; font-weight: 600; color: #FFFFFF; }
.pf2-letter__title { font-size: 11.5px; color: rgba(255,255,255,0.35); }
.pf2-letter__details {
    display: flex; flex-direction: column; gap: 8px;
    margin-bottom: 16px;
    padding: 12px;
    background: rgba(255,255,255,0.03);
    border-radius: 8px;
}
.pf2-letter__row { display: flex; justify-content: space-between; align-items: center; font-size: 12px; color: rgba(255,255,255,0.4); }
.pf2-letter__row span:last-child { color: rgba(255,255,255,0.65); }
.pf2-letter__vis { font-size: 11px; font-weight: 500; padding: 2px 8px; border-radius: 20px; }
.pf2-letter__vis--pub  { background: rgba(212,168,67,0.1); color: #D4A843; border: 1px solid rgba(212,168,67,0.2); }
.pf2-letter__vis--priv { background: rgba(255,255,255,0.05); color: rgba(255,255,255,0.35); border: 1px solid rgba(255,255,255,0.1); }
.pf2-download-btn {
    width: 100%;
    display: flex; align-items: center; justify-content: center; gap: 6px;
    border: none; border-radius: 8px; padding: 9px;
    font-size: 13px; font-weight: 600; color: #fff;
    cursor: pointer; transition: opacity 0.2s; font-family: inherit;
}
.pf2-download-btn:hover { opacity: 0.85; }
.pf2-locked-btn {
    width: 100%;
    display: flex; align-items: center; justify-content: center; gap: 6px;
    background: rgba(255,255,255,0.04);
    border: 1px solid rgba(255,255,255,0.08);
    color: rgba(255,255,255,0.25);
    padding: 9px; border-radius: 8px;
    font-size: 13px; font-weight: 500;
    cursor: not-allowed; font-family: inherit;
}

.pf2-github-layout { display: grid; grid-template-columns: 1fr 1fr; gap: 48px; }
.pf2-github__subtitle { font-size: 17px; font-weight: 600; color: #0F2040; margin-bottom: 20px; }
.pf2-heatmap { display: flex; gap: 3px; overflow-x: auto; padding-bottom: 8px; }
.pf2-heatmap__week { display: flex; flex-direction: column; gap: 3px; }
.pf2-heatmap__day  { width: 10px; height: 10px; border-radius: 2px; }
.pf2-heatmap__day--0 { background: #E5E8ED; }
.pf2-heatmap__day--1 { background: #BCCFF3; }
.pf2-heatmap__day--2 { background: #8AAEE8; }
.pf2-heatmap__day--3 { background: #5A89D8; }
.pf2-heatmap__day--4 { background: #2B5090; }
.pf2-heatmap__legend {
    display: flex; align-items: center; gap: 4px;
    font-size: 10.5px; color: #9CA3AF;
    margin-top: 10px; justify-content: flex-end;
}
.pf2-repos-list { display: flex; flex-direction: column; gap: 0; }
.pf2-repo { display: flex; align-items: center; justify-content: space-between; padding: 14px 0; border-bottom: 1px solid #E5E8ED; }
.pf2-repo:last-child { border-bottom: none; }
.pf2-repo__name { font-size: 14px; font-weight: 600; color: #0F2040; margin-bottom: 4px; }
.pf2-repo__meta { display: flex; align-items: center; gap: 14px; font-size: 12px; color: #9CA3AF; }
.pf2-repo__lang { display: flex; align-items: center; gap: 5px; }
.pf2-repo__dot { width: 10px; height: 10px; border-radius: 50%; }
.pf2-repo__activity { font-size: 12px; color: #9CA3AF; white-space: nowrap; }

.pf2-footer {
    background: #0A1628;
    padding: 56px 64px;
    display: flex; flex-direction: column; align-items: center; gap: 24px;
    text-align: center;
    border-top: 1px solid rgba(255,255,255,0.05);
}
.pf2-footer__cert { display: flex; align-items: center; gap: 14px; }
.pf2-footer__seal {
    width: 44px; height: 44px;
    border-radius: 10px;
    display: flex; align-items: center; justify-content: center;
    font-size: 11px; font-weight: 700; color: #fff; flex-shrink: 0;
}
.pf2-footer__cert-text { font-size: 14px; color: rgba(255,255,255,0.5); }
.pf2-footer__cert-date { font-size: 12px; color: rgba(255,255,255,0.25); margin-top: 2px; }
.pf2-footer__actions { display: flex; gap: 10px; }
.pf2-footer__brand { display: flex; align-items: center; gap: 8px; }
.pf2-footer__logo {
    width: 24px; height: 24px;
    border-radius: 6px;
    display: flex; align-items: center; justify-content: center;
    font-size: 11px; font-weight: 700; color: #fff;
}
.pf2-footer__brand span { font-size: 13px; color: rgba(255,255,255,0.35); }
.pf2-footer__copy { font-size: 12px; color: rgba(255,255,255,0.18); }

.pf2-modal-overlay {
    position: fixed; inset: 0;
    background: rgba(10,22,40,0.75);
    display: flex; align-items: center; justify-content: center;
    z-index: 200; padding: 20px;
    backdrop-filter: blur(4px);
}
.pf2-modal {
    background: #FFFFFF;
    border-radius: 16px;
    max-width: 600px; width: 100%;
    max-height: 90vh; overflow-y: auto;
    position: relative;
}
.pf2-modal__close {
    position: absolute; top: 16px; right: 16px;
    background: rgba(26,29,46,0.07);
    border: none; border-radius: 50%;
    width: 36px; height: 36px;
    display: flex; align-items: center; justify-content: center;
    cursor: pointer; z-index: 1; transition: background 0.2s;
}
.pf2-modal__close:hover { background: rgba(26,29,46,0.14); }
.pf2-modal__img {
    height: 220px;
    background: #F0F5FD;
    display: flex; align-items: center; justify-content: center;
    border-radius: 16px 16px 0 0;
}
.pf2-modal__body { padding: 28px; }
.pf2-modal__category {
    font-size: 11px;
    font-weight: 600;
    color: #2B5090;
    text-transform: uppercase;
    letter-spacing: 1.5px;
    margin-bottom: 8px;
}
.pf2-modal__title {
    font-family: 'Lora', Georgia, serif;
    font-size: 27px;
    font-weight: 600;
    color: #0F2040;
    letter-spacing: -0.4px;
    margin-bottom: 12px;
}
.pf2-modal__desc {
    font-family: 'Lora', Georgia, serif;
    font-style: italic;
    font-size: 15px;
    color: #6B7280;
    line-height: 1.7;
    margin-bottom: 24px;
}
.pf2-modal__grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 20px; }
.pf2-modal__cell { background: #F8FAFC; border-radius: 8px; padding: 12px 14px; }
.pf2-modal__cell span { font-size: 10.5px; font-weight: 600; color: #9CA3AF; text-transform: uppercase; letter-spacing: 0.5px; display: block; margin-bottom: 4px; }
.pf2-modal__cell strong { font-size: 14px; color: #0F2040; font-weight: 600; }
.pf2-modal__tech { display: flex; gap: 6px; flex-wrap: wrap; margin-bottom: 20px; }
.pf2-modal__footer { display: flex; align-items: center; gap: 12px; flex-wrap: wrap; }

.pf2-modal__results {
    background: #F0F5FD;
    border-left: 3px solid #5A89D8;
    border-radius: 0 8px 8px 0;
    padding: 12px 16px;
    margin-bottom: 18px;
}
.pf2-modal__results-label {
    font-size: 10.5px;
    font-weight: 600;
    color: #2B5090;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    margin-bottom: 4px;
}
.pf2-modal__results-text {
    font-size: 13.5px;
    color: #374151;
    line-height: 1.6;
    font-style: italic;
    font-family: 'Lora', Georgia, serif;
}

.pf2-btn-youtube {
    display: flex;
    align-items: center;
    gap: 6px;
    background: #CC0000;
    color: #fff;
    border: none;
    padding: 6px 14px;
    border-radius: 8px;
    font-size: 13px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s;
    font-family: inherit;
    text-decoration: none;
}
.pf2-btn-youtube:hover { background: #E00000; }

.pf2-skills__radar { display: flex; flex-direction: column; }
.pf2-radar-svg { width: 100%; max-width: 300px; margin: 0 auto; }

.pf2-soft-section {
    margin-top: 48px;
    padding-top: 40px;
    border-top: 1px solid #E5E8ED;
}

.pf2-modal__appreciation {
    background: #F0F5FD;
    border-left: 3px solid #D4A843;
    border-radius: 0 8px 8px 0;
    padding: 12px 16px;
    margin-bottom: 18px;
}
.pf2-modal__appr-header {
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: 10.5px;
    font-weight: 600;
    color: #B8860B;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    margin-bottom: 6px;
}
.pf2-modal__appr-text {
    font-family: 'Lora', Georgia, serif;
    font-style: italic;
    font-size: 13.5px;
    color: #374151;
    line-height: 1.65;
}

.pf2-stage__meta {
    display: flex;
    flex-direction: column;
    gap: 10px;
    margin-bottom: 16px;
    padding: 12px 14px;
    background: rgba(255,255,255,0.04);
    border-radius: 8px;
    border: 1px solid rgba(255,255,255,0.07);
}
.pf2-stage__meta-row {
    display: flex;
    align-items: center;
    gap: 10px;
}
.pf2-stage__tech-row {
    display: flex;
    align-items: flex-start;
    gap: 10px;
}
.pf2-stage__meta-label {
    font-size: 11px;
    font-weight: 600;
    color: rgba(255,255,255,0.35);
    text-transform: uppercase;
    letter-spacing: 0.5px;
    white-space: nowrap;
    min-width: 140px;
}
.pf2-stage__meta-val {
    font-size: 13.5px;
    color: #8AAEE8;
    font-weight: 500;
}
.pf2-stage__tech-tags {
    display: flex;
    flex-wrap: wrap;
    gap: 5px;
}
.pf2-attach-btn--light {
    background: #F0F5FD;
    border: 1px solid #BCCFF3;
    color: #2B5090;
}
.pf2-attach-btn--light:hover { background: #DCE8FA; color: #1E3D6B; }
.pf2-activity-no-att { font-size: 11.5px; color: #9CA3AF; }

@keyframes pf2spin { to { transform: rotate(360deg); } }
.pf2-spinner {
    width: 40px; height: 40px;
    border: 3px solid rgba(255,255,255,0.1);
    border-top-color: #5A89D8;
    border-radius: 50%;
    animation: pf2spin 0.8s linear infinite;
}
</style>
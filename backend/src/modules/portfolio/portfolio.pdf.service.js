import puppeteer from 'puppeteer';
import * as portfolioService from './portfolio.service.js';

export const generatePortfolioPDF = async (url_publique) => {
    const portfolio = await portfolioService.getPortfolioByUrl(url_publique);
    if (!portfolio) throw new Error('Portfolio introuvable');

    const e = portfolio.etudiant;
    const u = e.utilisateur;

    const projets = (e.participations_projets || []).map(p => `
        <div class="card">
            <h3>${p.projet.titre}</h3>
            <p>${p.projet.description || ''}</p>
            <div class="tags">${(p.projet.technologies || []).map(t => `<span class="tag">${t.technologie.nom}</span>`).join('')}</div>
        </div>
    `).join('');

    const competences = (e.competences || []).filter(c => c.competence.type === 'TECHNIQUE').map(c => `
        <div class="skill-row">
            <span>${c.competence.nom}</span>
            <span class="level">${c.niveau_maitrise}</span>
        </div>
    `).join('');

    const stages = (e.stages || []).map(s => `
        <div class="card">
            <h3>${s.poste} — ${s.entreprise}</h3>
            <p>${s.missions || ''}</p>
        </div>
    `).join('');

    const html = `
<!DOCTYPE html>
<html lang="fr">
<head>
<meta charset="UTF-8">
<style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: Inter, sans-serif; color: #1A1D2E; background: #fff; }
    .hero { background: #0F2040; color: white; padding: 48px; }
    .hero h1 { font-size: 48px; font-weight: 700; margin-bottom: 8px; }
    .hero p { color: rgba(255,255,255,0.6); font-size: 16px; margin-bottom: 4px; }
    .badge { display: inline-block; background: rgba(212,168,67,0.2); color: #D4A843; border: 1px solid rgba(212,168,67,0.3); padding: 4px 12px; border-radius: 20px; font-size: 12px; margin-top: 12px; }
    .section { padding: 48px; border-bottom: 1px solid #E5E8ED; page-break-inside: avoid; break-inside: avoid; }
    .section h2 { font-size: 28px; font-weight: 700; color: #0F2040; margin-bottom: 24px; }
    .section-label { font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 2px; color: #2B5090; margin-bottom: 8px; }
    .card { border: 1px solid #E5E8ED; border-radius: 10px; padding: 20px; margin-bottom: 16px; page-break-inside: avoid; break-inside: avoid; }
    .card h3 { font-size: 18px; font-weight: 600; color: #0F2040; margin-bottom: 8px; }
    .card p { font-size: 14px; color: #6B7280; line-height: 1.6; }
    .tags { display: flex; gap: 6px; flex-wrap: wrap; margin-top: 10px; }
    .tag { background: #F0F5FD; color: #2B5090; padding: 2px 10px; border-radius: 4px; font-size: 12px; }
    .skill-row { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #E5E8ED; page-break-inside: avoid; break-inside: avoid; }
    .skill-row span { font-size: 14px; color: #1A1D2E; }
    .level { color: #2B5090; font-weight: 600; }
    .footer { background: #0A1628; color: rgba(255,255,255,0.5); text-align: center; padding: 32px; font-size: 13px; }
    .score { background: #1A3055; border-radius: 12px; padding: 16px 24px; display: inline-block; margin-top: 20px; }
    .score-num { font-size: 36px; font-weight: 700; color: #fff; }
    .score-label { font-size: 11px; color: rgba(255,255,255,0.4); text-transform: uppercase; letter-spacing: 1px; }
</style>
</head>
<body>

<div class="hero">
    <h1>${u.prenom} ${u.nom}</h1>
    <p>${e.filiere || 'Génie Informatique'} · ${e.annee ? e.annee + 'ème année' : ''}</p>
    <p>${u.ecole || 'ENSA Tanger'}</p>
    <p>${u.email}</p>
    <span class="badge">✦ Certifié UAE</span>
    <div class="score">
        <div class="score-label">Score de crédibilité</div>
        <div class="score-num">${e.score_credibilite || 0}<span style="font-size:16px;color:rgba(255,255,255,0.4)">/100</span></div>
    </div>
</div>

${e.biographie ? `
<div class="section">
    <div class="section-label">À propos</div>
    <h2>Parcours Académique</h2>
    <p style="font-size:15px;color:#374151;line-height:1.8">${e.biographie}</p>
</div>` : ''}

${projets ? `
<div class="section">
    <div class="section-label">Mes réalisations</div>
    <h2>Projets Validés</h2>
    ${projets}
</div>` : ''}

${competences ? `
<div class="section">
    <div class="section-label">Expertise</div>
    <h2>Compétences Techniques</h2>
    ${competences}
</div>` : ''}

${stages ? `
<div class="section">
    <div class="section-label">Expériences</div>
    <h2>Stages</h2>
    ${stages}
</div>` : ''}

<div class="footer">
    Portfolio certifié par l'Université Abdelmalek Essaâdi · Généré par Trusty
</div>

</body>
</html>`;

    const browser = await puppeteer.launch({
        headless: 'new',
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    try {
        const page = await browser.newPage();
        await page.setContent(html, { waitUntil: 'networkidle0' });
        const pdf = await page.pdf({
            format: 'A4',
            printBackground: true,
            margin: { top: '0', right: '0', bottom: '0', left: '0' }
        });
        return pdf;
    } finally {
        await browser.close();
    }
};
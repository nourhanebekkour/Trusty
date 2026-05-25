import nodemailer from 'nodemailer'; // lib pour envoyer des emails via Node
import fs from 'fs'; // lib pour lire/écrire des fichiers
import path from 'path'; // lib pour construire des chemins de fichiers
import { fileURLToPath } from 'url'; // nécessaire en ESModules pour avoir __dirname
import dotenv from 'dotenv'; // charger les variables d'environnement

dotenv.config({ path: '.env.test' });

// en ESModules __dirname n'existe pas nativement.
// Cette ligne le recrée manuellement à partir de l'URL du fichier courant
const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Construit le chemin absolu vers le fichier 
// backend/test-reports/test-report.html
const reportPath = path.join(__dirname, 'test-reports', 'test-report.html');


async function sendEmail(reportHtml) {
    // Crée un "transporteur" Gmail avec les id du .env.test
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.GMAIL_USER, // mon mail
            pass: process.env.GMAIL_APP_PASSWORD, // mon mdp généré gmail
        },
    });

    // envoi du mail
    await transporter.sendMail({
        from: process.env.GMAIL_USER,
        to: 'nourhan221app@gmail.com, email.adjoint@gmail.com',
        subject: 'Rapport de Tests Backend',
        html: reportHtml,
        attachments: [
            {
                filename: 'test-report.html',
                path: reportPath,
            },
        ],
    });

    console.log('Email envoyé avec succès');
}

// L'API Jira attend ce header dans chaque requête :
// Authorization: Basic <quelquechose_en_base64>
// donc email:token encodé en Base64
async function postToJira() {
    const credentials = Buffer.from(
        `${process.env.JIRA_EMAIL}:${process.env.JIRA_API_TOKEN}`
    ).toString('base64');

    // Créer un nouveau ticket pour chaque rapport
    const res = await fetch( // fetch envoie une requête HTTP
        // l'URL complète de l'API jira
        // Ex: https://nourhane-bekkour.atlassian.net/rest/api/3/issue
        `${process.env.JIRA_URL}/rest/api/3/issue`,
        {
            method: 'POST',
            headers: {
                Authorization: `Basic ${credentials}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                fields: {
                    project: { key: process.env.JIRA_PROJECT_KEY },
                    summary: `[Tests Backend] Rapport automatique du ${new Date().toLocaleString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })}`,
                    issuetype: { name: 'Task' },
                    description: {
                        type: 'doc',
                        version: 1,
                        content: [
                            {
                                type: 'paragraph',
                                content: [
                                    {
                                        type: 'text',
                                        text: `Rapport de tests automatiques généré le ${new Date().toLocaleString('fr-FR')}.`,
                                    },
                                ],
                            },
                            {
                                type: 'paragraph',
                                content: [
                                    {
                                        type: 'text',
                                        text: "Le rapport complet est joint en pièce jointe à ce ticket et envoyé simultanément par email.",
                                    },
                                ],
                            },
                        ],
                    },
                },
            }),
        }
    );

    const data = await res.json();

    if (!res.ok) {
        throw new Error(`Erreur Jira: ${JSON.stringify(data)}`);
    }

    console.log(`Ticket Jira créé : ${data.key}`);
    return data.key;
}

async function attachToJira(issueKey) {
    const credentials = Buffer.from(
        `${process.env.JIRA_EMAIL}:${process.env.JIRA_API_TOKEN}`
    ).toString('base64');

    const formData = new FormData();
    const fileBuffer = fs.readFileSync(reportPath);
    const blob = new Blob([fileBuffer], { type: 'text/html' });
    formData.append('file', blob, 'test-report.html');

    const res = await fetch(
        `${process.env.JIRA_URL}/rest/api/3/issue/${issueKey}/attachments`,
        {
            method: 'POST',
            headers: {
                Authorization: `Basic ${credentials}`,
                'X-Atlassian-Token': 'no-check',
            },
            body: formData,
        }
    );

    if (!res.ok) {
        const data = await res.json();
        throw new Error(`Erreur pièce jointe Jira: ${JSON.stringify(data)}`);
    }

    console.log(`Rapport HTML joint au ticket ${issueKey}`);
}

async function main() {
    if (!fs.existsSync(reportPath)) {
        console.error('Rapport introuvable, lance npm test:report dabord');
        process.exit(1);
    }

    const reportHtml = fs.readFileSync(reportPath, 'utf-8');

    const [issueKey] = await Promise.all([
        postToJira(),
        sendEmail(reportHtml),
    ]);

    await attachToJira(issueKey);
}

main().catch((err) => {
    console.error('Erreur:', err);
    process.exit(1);
});

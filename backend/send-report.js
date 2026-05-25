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
        to: 'email.chef@gmail.com, email.adjoint@gmail.com',
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
                    summary: 'Rapport de tests backend',
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
                                        text: "Le rapport complet est joint en pièce jointe dans l'email envoyé simultanément.",
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
}

async function main() {
    if (!fs.existsSync(reportPath)) {
        console.error('Rapport introuvable, lance npm test:report dabord');
        process.exit(1);
    }

    const reportHtml = fs.readFileSync(reportPath, 'utf-8');

    await Promise.all([
        sendEmail(reportHtml),
        postToJira(),
    ]);
}

main().catch((err) => {
    console.error('Erreur:', err);
    process.exit(1);
});

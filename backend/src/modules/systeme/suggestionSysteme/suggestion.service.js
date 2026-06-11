import { PrismaClient } from '@prisma/client';
import { GoogleGenerativeAI } from '@google/generative-ai';

const prisma = new PrismaClient();

export const genererEtSauvegarderSuggestion = async (id_etudiant) => {
    if (!process.env.GEMINI_API_KEY) {
        throw new Error("La clé API Gemini n'est pas configurée dans le fichier .env");
    }
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

    // 1. Retrieve student data to provide context to the AI
    const etudiant = await prisma.etudiant.findUnique({
        where: { id_etudiant },
        include: {
            competences: { include: { competence: true } },
            formations: true,
            stages: true,
            participations_projets: { include: { projet: { include: { technologies: { include: { technologie: true } } } } } }
        }
    });

    if (!etudiant) {
        throw new Error("Étudiant non trouvé");
    }

    // 1.5 Retrieve past suggestions to avoid repetition
    const suggestionsPassees = await prisma.suggestionSysteme.findMany({
        where: { id_etudiant },
        take: 5,
        orderBy: { date_generation: 'desc' },
        select: { titre: true }
    });
    const titresPassees = suggestionsPassees.map(s => s.titre).join('; ');

    // 2. Prepare context for AI
    const typesPossibles = ["COMPETENCE", "PROJET", "TECHNOLOGIE"];
    const typeForce = typesPossibles[Math.floor(Math.random() * typesPossibles.length)];

    const competences = etudiant.competences.map(c => c.competence.nom).join(', ');
    const projets = etudiant.participations_projets.map(p => p.projet.titre).join(', ');
    const stages = etudiant.stages.map(s => `${s.poste} chez ${s.entreprise}`).join(', ');
    
    const prompt = `En tant qu'assistant IA expert en employabilité IT, 
analyse le profil suivant d'un étudiant en ingénierie :
- Compétences actuelles : ${competences || "Aucune spécifiée"}
- Projets réalisés : ${projets || "Aucun spécifié"}
- Stages effectués : ${stages || "Aucun spécifié"}
- Filière : ${etudiant.filiere || "Non spécifiée"}
- Suggestions précédentes à NE PAS RÉPÉTER : ${titresPassees || "Aucune"}

CONSIGNES STRICTES :
1. NE DONNE JAMAIS de conseils génériques (ex: "Fais un projet de A à Z", "Apprends une techno").
2. Sois HYPER CONCRET, PRÉCIS et CRÉATIF.
3. Si PROJET (Projets recommandés) : Donne une idée de projet métier pointu qui résout un problème complexe (ex: "Développer une API GraphQL de détection de fraude").
4. Si COMPETENCE (Compétences manquantes) : Identifie une compétence métier ou méthodologique manquante (ex: "Architecture Microservices", "Conception DDD").
5. Si TECHNOLOGIE (Technologies pertinentes) : Suggère un framework ou un outil précis à maîtriser (ex: "Rust", "Kubernetes", "Next.js").
6. Ne répète jamais les suggestions précédentes et les priorités.
7. OBLIGATION ABSOLUE : Tu dois générer une suggestion de type "${typeForce}".

Réponds UNIQUEMENT au format JSON strict :
{
  "type_suggestion": "${typeForce}",
  "titre": "Titre TRES CONCRET de la suggestion",
  "description": "Description technique détaillée (technos à utiliser, architecture, cas d'usage réel)",
  "element_suggere": "Nom exact de la techno ou domaine (ex: Kafka, Next.js)",
  "priorite": "HAUTE", "MOYENNE" ou "BASSE" ne donne jamais 3 meme priorite succesive,
  "justification_ia": "Pourquoi ce choix précis le rendra indispensable sur le marché du travail"
}`;

    // 3. Call Gemini API
    const model = genAI.getGenerativeModel({ model: "gemini-3.1-flash-lite" });
    const result = await model.generateContent(prompt);
    let text = result.response.text();
    
    // Nettoyer le texte si le modèle renvoie du markdown JSON
    text = text.replace(/```json/g, '').replace(/```/g, '').trim();
    
    let suggestionData;
    try {
        suggestionData = JSON.parse(text);
    } catch (e) {
         throw new Error("Erreur lors de l'analyse de la réponse IA: " + text);
    }

    // 4. Save to database
    const nouvelleSuggestion = await prisma.suggestionSysteme.create({
        data: {
            id_etudiant,
            type_suggestion: suggestionData.type_suggestion,
            titre: suggestionData.titre,
            description: suggestionData.description,
            element_suggere: suggestionData.element_suggere,
            priorite: suggestionData.priorite,
            justification_ia: suggestionData.justification_ia
        }
    });

    return nouvelleSuggestion;
};

export const recupererSuggestions = async (id_etudiant) => {
    return await prisma.suggestionSysteme.findMany({
        where: { id_etudiant },
        orderBy: { date_generation: 'desc' }
    });
};

export const marquerCommeLue = async (id_suggestion, id_etudiant) => {
    // Verify ownership
    const suggestion = await prisma.suggestionSysteme.findUnique({ where: { id_suggestion } });
    if (!suggestion || suggestion.id_etudiant !== id_etudiant) {
        throw new Error("Suggestion non trouvée ou accès refusé");
    }

    return await prisma.suggestionSysteme.update({
        where: { id_suggestion },
        data: {
            est_lue: true,
            date_lecture: new Date()
        }
    });
};

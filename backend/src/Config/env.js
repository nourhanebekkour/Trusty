import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';

const nodeEnv = process.env.NODE_ENV || 'development';

// On définit quel fichier .env charger selon l'environnement
// On supporte .env (default/dev), .env.test, .env.production
const envFile = nodeEnv === 'development' ? '.env' : `.env.${nodeEnv}`;
const envPath = path.resolve(process.cwd(), envFile);

if (fs.existsSync(envPath)) {
  dotenv.config({ path: envPath });
  console.log(`🌍 Environnement : [${nodeEnv.toUpperCase()}]`);
  console.log(`📄 Fichier de config chargé : ${envFile}`);
} else {
  console.log(`🌍 Environnement : [${nodeEnv.toUpperCase()}]`);
  console.log(`⚠️ Aucun fichier ${envFile} trouvé, utilisation des variables d'environnement système.`);
}

export default process;

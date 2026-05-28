import '#Config/env.js';
import app from './app.js';

const PORT = process.env.PORT || 3000;

if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(`🚀 Serveur démarré sur http://localhost:${PORT}`);
    console.log(`📖 Documentation disponible sur http://localhost:${PORT}/api-docs`);
  });
}

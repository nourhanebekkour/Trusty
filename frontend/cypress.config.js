const path = require('path')

require('dotenv').config({
  path: path.resolve(__dirname, '../backend/.env')
})

const { defineConfig } = require('cypress')
const { PrismaClient } = require(path.resolve(__dirname, '../backend/node_modules/@prisma/client'))
const bcrypt = require(path.resolve(__dirname, '../backend/node_modules/bcryptjs'))

const prisma = new PrismaClient()

module.exports = defineConfig({
  e2e: {
    baseUrl: 'http://localhost:5173',
    setupNodeEvents(on, config) {
      on('task', {

        async dbSeed() {
          const hash = await bcrypt.hash('Password123!', 12)
          await prisma.utilisateur.upsert({
            where: { email: 'etudiant@test.com' },
            update: { mot_de_passe: hash, status_compte: 'ACTIF' },
            create: { email: 'etudiant@test.com', mot_de_passe: hash, nom: 'Test', prenom: 'Etudiant', role: 'ETUDIANT', status_compte: 'ACTIF' },
          })
          await prisma.utilisateur.upsert({
            where: { email: 'prof@test.com' },
            update: { mot_de_passe: hash, status_compte: 'ACTIF' },
            create: { email: 'prof@test.com', mot_de_passe: hash, nom: 'Test', prenom: 'Professeur', role: 'PROFESSEUR', status_compte: 'ACTIF' },
          })
          await prisma.utilisateur.upsert({
            where: { email: 'admin@test.com' },
            update: { mot_de_passe: hash, status_compte: 'ACTIF' },
            create: { email: 'admin@test.com', mot_de_passe: hash, nom: 'Test', prenom: 'Admin', role: 'ADMINISTRATEUR', status_compte: 'ACTIF' },
          })
          return null
        },

        async createInactifUser({ email, password }) {
          const hash = await bcrypt.hash(password, 12)
          await prisma.utilisateur.upsert({
            where: { email },
            update: { mot_de_passe: hash, status_compte: 'INACTIF' },
            create: { email, mot_de_passe: hash, nom: 'Test', prenom: 'Inactif', role: 'ETUDIANT', status_compte: 'INACTIF' },
          })
          return null
        },

        async deleteUserByEmail(email) {
          await prisma.utilisateur.deleteMany({ where: { email } })
          return null
        },

      })
    },
  },
})
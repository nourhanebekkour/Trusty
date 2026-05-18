import { config } from 'dotenv';
config({ path: '.env.test' });

export default {
    testEnvironment: "node",
    transformIgnorePatterns: [
        "node_modules/(?!(.prisma|@prisma)/)"
    ]
};
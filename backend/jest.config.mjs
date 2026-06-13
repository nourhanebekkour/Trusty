import { config } from 'dotenv';
config({ path: '.env.test' });

export default {
    testEnvironment: "node",
    testPathIgnorePatterns: [
        "/node_modules/",
        "/Tests/performance/",
        "/tests/performance/"
    ],
    transformIgnorePatterns: [
        "node_modules/(?!(.prisma|@prisma)/)"
    ],
    reporters: [
        "default",
        ["jest-html-reporter", {
            pageTitle: "Rapport de Tests",
            outputPath: "test-reports/test-report.html",
            includeFailureMsg: true,
            includeSuiteFailure: true,
            includeConsoleLog: false,
            dateFormat: "dd/mm/yyyy HH:MM:ss",
            sort: "status",
            theme: "defaultTheme"
        }]
    ]
};
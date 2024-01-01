module.exports = {
    testEnvironment: "jsdom",
    testEnvironmentOptions: {
        customExportConditions: ["node", "node-addons"],
    },
    testPathIgnorePatterns: [
        '__tests__/TestTools.js',
    ],
};
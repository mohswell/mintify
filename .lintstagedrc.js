module.exports = {
    // Run type checking on staged files
    '**/*.{ts,tsx}': () => 'tsc --noEmit',

    // Run ESLint on JS/TS files
    '**/*.{js,jsx,ts,tsx}': (filenames) => [
        `eslint --fix ${filenames.join(' ')}`,
        `prettier --write ${filenames.join(' ')}`
    ],

    // Format other files with Prettier
    '**/*.{json,md,yml,yaml,css,scss}': (filenames) =>
        `prettier --write ${filenames.join(' ')}`,

    // Run tests related to changed files
    '**/*.{js,jsx,ts,tsx}': (filenames) => {
        const testFiles = filenames
            .map(filename => filename.replace(/\.[jt]sx?$/, '.test.$&'))
            .filter(testFile => fs.existsSync(testFile));

        if (testFiles.length > 0) {
            return `jest ${testFiles.join(' ')}`;
        }
        return [];
    }
};
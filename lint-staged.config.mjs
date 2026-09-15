export default {
  '*.{js,jsx,ts,tsx,mjs,cjs}': (files) => {
    const filtered = files.filter((file) => !file.endsWith('next-env.d.ts'));
    if (filtered.length === 0) {
      return [];
    }
    return [`eslint --fix ${filtered.join(' ')}`, `prettier --write ${filtered.join(' ')}`];
  },
  '*.{json,md,yml,yaml,css}': 'prettier --write',
};

module.exports = {
  '*.{js,ts}': ['prettier --write', 'eslint --fix', 'eslint --max-warnings=0'],
  '*.{json,css,md}': ['prettier --write'],
  '*.astro': [
    'prettier --plugin prettier-plugin-astro --write',
    'eslint --fix',
    'eslint --max-warnings=0',
  ],
};

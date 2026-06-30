import sveltePreprocess from 'svelte-preprocess';

/** @type {import('@sveltejs/vite-plugin-svelte').Options} */
const config = {
  preprocess: sveltePreprocess(),
  compilerOptions: {
    css: 'external',
  },
};

export default config;

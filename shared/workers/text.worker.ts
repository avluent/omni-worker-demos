/**
 * Text worker — provides string processing operations using lodash-es.
 *
 * @feature omni-worker: worker with external dependencies
 * @see {@link https://github.com/avluent/omni-worker}
 */

import { capitalize } from 'lodash-es';

/** Interface describing the text worker API shape. */
export interface TextApi {
  /** Capitalizes the first character of the string (via lodash-es). */
  capitalize(str: string): string;
  /** Reverses the string. */
  reverse(str: string): string;
  /** Creates a URL-friendly slug from the string. */
  slugify(str: string): string;
}

/**
 * The worker API — must be exported as `api` for omni-worker.
 */
export const api: TextApi = {
  capitalize(str: string): string {
    return capitalize(str);
  },

  reverse(str: string): string {
    return str.split('').reverse().join('');
  },

  slugify(str: string): string {
    return str
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '');
  },
};

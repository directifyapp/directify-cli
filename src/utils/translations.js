/**
 * Helpers for multi-language directories.
 *
 * Reads take `?locale=<code>` so text comes back in that language. Writes take a
 * `translations` object: { "es": { "name": "Café de Joe" }, "fr": { ... } }.
 * A `null` (or empty) value removes that translation. `--locale` must never be
 * sent on writes (the API rejects it with a 422).
 */

/** Translatable fields per resource, as accepted in `translations`. */
export const TRANSLATABLE_FIELDS = {
  listings: ['name', 'slug', 'description', 'content', 'seo_title', 'seo_description'],
  categories: ['title', 'slug', 'display_name', 'description', 'content', 'filter_group', 'seo_title', 'seo_description'],
  tags: ['title'],
  articles: ['title', 'slug', 'content', 'markdown', 'seo_title', 'seo_description'],
  pages: ['title', 'slug', 'markdown', 'seo_title', 'seo_description'],
  organizers: ['name', 'slug', 'description', 'content'],
  fields: ['label', 'placeholder', 'description', 'value_prefix', 'value_suffix'],
};

export const LOCALE_HELP =
  'Return text in this language (e.g. es); see: directify languages list';

export function translateHelp(resource) {
  return (
    'Translation for one field, as <locale>.<field>=<value> (repeatable, e.g. es.' +
    TRANSLATABLE_FIELDS[resource][0] +
    '="..."); empty or null removes it. Fields: ' +
    TRANSLATABLE_FIELDS[resource].join(', ')
  );
}

export const TRANSLATIONS_JSON_HELP =
  'All translations as JSON, e.g. \'{"es":{"name":"..."}}\' (merged with --translate)';

/** Append `locale` to a read path as a query parameter (no-op when unset). */
export function localized(path, locale) {
  if (!locale) return path;
  const sep = path.includes('?') ? '&' : '?';
  return `${path}${sep}locale=${encodeURIComponent(locale)}`;
}

/**
 * Build the `translations` body from --translations <json> and repeatable
 * --translate <locale.field=value>. Returns undefined when neither was given.
 */
export function parseTranslations(opts) {
  let translations;

  if (opts.translations) {
    try {
      translations = JSON.parse(opts.translations);
    } catch (err) {
      throw new Error(`--translations is not valid JSON: ${err.message}`);
    }
    if (!translations || typeof translations !== 'object' || Array.isArray(translations)) {
      throw new Error('--translations must be a JSON object keyed by language code, e.g. {"es":{"name":"..."}}');
    }
  }

  for (const entry of opts.translate || []) {
    const eq = entry.indexOf('=');
    const target = eq === -1 ? '' : entry.slice(0, eq).trim();
    const dot = target.indexOf('.');
    if (dot <= 0 || dot === target.length - 1) {
      throw new Error(`Invalid --translate "${entry}". Use <locale>.<field>=<value>, e.g. es.name="Café de Joe"`);
    }
    const locale = target.slice(0, dot);
    const field = target.slice(dot + 1);
    const raw = entry.slice(eq + 1);

    translations = translations || {};
    if (translations[locale] === null || typeof translations[locale] !== 'object') {
      translations[locale] = {};
    }
    translations[locale][field] = raw === '' || raw === 'null' ? null : raw;
  }

  return translations;
}

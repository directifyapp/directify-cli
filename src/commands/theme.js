import { Command } from 'commander';
import { readFileSync, writeFileSync } from 'fs';
import { api, resolveDirectory } from '../utils/api.js';
import { printJson, printSuccess, printError, printInfo } from '../utils/output.js';
import { localized, LOCALE_HELP } from '../utils/translations.js';
import ora from 'ora';

const theme = new Command('theme').description('Read and change the directory theme (everything the Theme Editor controls)');

function collect(value, previous) {
  return previous.concat([value]);
}

/** "true"/"false"/"null"/numbers become their JSON value; anything else stays a string. */
function parseValue(raw) {
  if (raw === 'true') return true;
  if (raw === 'false') return false;
  if (raw === 'null' || raw === '') return null;
  if (/^-?\d+(\.\d+)?$/.test(raw)) return Number(raw);
  if ((raw.startsWith('{') && raw.endsWith('}')) || (raw.startsWith('[') && raw.endsWith(']'))) {
    try {
      return JSON.parse(raw);
    } catch {
      return raw;
    }
  }
  return raw;
}

/** Set a dotted path on an object: "footer.colors.text" → body.footer.colors.text. CSS vars keep their dashes. */
function setPath(body, path, value) {
  const parts = path.split('.');
  let target = body;
  for (let i = 0; i < parts.length - 1; i++) {
    if (typeof target[parts[i]] !== 'object' || target[parts[i]] === null) target[parts[i]] = {};
    target = target[parts[i]];
  }
  target[parts[parts.length - 1]] = value;
}

function stripOptions(data) {
  const { options, ...rest } = data;
  return rest;
}

theme
  .command('get')
  .description('Show the current theme as JSON (add --options to include the valid values for this template)')
  .option('-d, --directory <id>', 'Directory ID')
  .option('--locale <code>', LOCALE_HELP)
  .option('--options', 'Include the options block (templates, themes, fonts, palettes, section keys, template settings…)')
  .action(async (opts) => {
    const spinner = ora('Fetching theme...').start();
    try {
      const dir = resolveDirectory(opts);
      const data = await api.get(localized(`/directories/${dir}/theme`, opts.locale));
      spinner.stop();
      const document = data.data || data;
      printJson(opts.options ? document : stripOptions(document));
    } catch (err) {
      spinner.stop();
      printError(err.message);
      process.exit(1);
    }
  });

theme
  .command('options')
  .description('Show the valid values for this directory template: templates, themes, fonts, palettes, section keys, template settings, labels, CSS vars')
  .option('-d, --directory <id>', 'Directory ID')
  .action(async (opts) => {
    try {
      const dir = resolveDirectory(opts);
      const data = await api.get(`/directories/${dir}/theme`);
      printJson((data.data || data).options);
    } catch (err) {
      printError(err.message);
      process.exit(1);
    }
  });

theme
  .command('set')
  .description('Change the theme. Only what you pass changes; everything else keeps its value.')
  .option('--template <name>', 'Switch template (applies its preset brand colors when it has one)')
  .option('--theme <name>', 'DaisyUI base theme, e.g. light, dark, cupcake')
  .option('--palette <key>', 'Canned palette: bold, pastel, mono, earthy, ocean')
  .option('--primary <color>', 'Brand primary color (hex), "null" to clear')
  .option('--secondary <color>', 'Brand secondary color (hex), "null" to clear')
  .option('--accent <color>', 'Brand accent color (hex), "null" to clear')
  .option('--font <family>', 'Body font family (see theme options)')
  .option('--heading-font <family>', 'Heading font (weddings and members only), "null" for the template default')
  .option('--dark-mode <on|off>', 'Auto dark mode')
  .option('--dark-theme <name>', 'Theme used in dark mode')
  .option('--hero-title <text>', 'Hero heading')
  .option('--hero-subtitle <text>', 'Text under the heading')
  .option('--logo <url>', 'Logo image URL ("null" removes)')
  .option('--favicon <url>', 'Favicon URL ("null" removes)')
  .option('--cover <url>', 'Cover image URL ("null" removes)')
  .option('--footer-logo <url>', 'Footer logo URL ("null" removes)')
  .option('--set <path=value...>', 'Any key by dotted path, e.g. footer.enabled=false, template_settings.hero_city_search=true, custom_css_vars.--radius-box=1.5rem, homepage.sections=[{"key":"cta","enabled":false}]', collect, [])
  .option('--translate <locale.path=value...>', 'A translation, e.g. es.hero.title="Hola", es.homepage.content="…", es.labels.directory.submit_listing_button_label="Añadir"', collect, [])
  .option('--json <json>', 'A JSON body in the API shape (merged with the other options)')
  .option('--file <path>', 'A JSON file in the API shape (merged with the other options)')
  .option('-d, --directory <id>', 'Directory ID')
  .option('--quiet', 'Print only a confirmation instead of the resulting theme')
  .action(async (opts) => {
    const spinner = ora('Updating theme...').start();
    try {
      const dir = resolveDirectory(opts);
      let body = {};

      if (opts.file) body = { ...body, ...JSON.parse(readFileSync(opts.file, 'utf-8')) };
      if (opts.json) body = { ...body, ...JSON.parse(opts.json) };

      const simple = {
        template: opts.template,
        theme: opts.theme,
        palette: opts.palette,
      };
      for (const [key, value] of Object.entries(simple)) {
        if (value !== undefined) body[key] = value;
      }

      for (const [key, flag] of Object.entries({ primary: opts.primary, secondary: opts.secondary, accent: opts.accent })) {
        if (flag !== undefined) setPath(body, `brand.${key}`, parseValue(flag));
      }
      if (opts.font !== undefined) setPath(body, 'fonts.body', opts.font);
      if (opts.headingFont !== undefined) setPath(body, 'fonts.heading', parseValue(opts.headingFont));
      if (opts.darkMode !== undefined) setPath(body, 'dark_mode.auto', opts.darkMode === 'on' || opts.darkMode === 'true');
      if (opts.darkTheme !== undefined) setPath(body, 'dark_mode.theme', opts.darkTheme);
      if (opts.heroTitle !== undefined) setPath(body, 'hero.title', opts.heroTitle);
      if (opts.heroSubtitle !== undefined) setPath(body, 'hero.subtitle', opts.heroSubtitle);
      if (opts.logo !== undefined) setPath(body, 'media.logo_url', parseValue(opts.logo));
      if (opts.favicon !== undefined) setPath(body, 'media.favicon_url', parseValue(opts.favicon));
      if (opts.cover !== undefined) setPath(body, 'media.cover_image_url', parseValue(opts.cover));
      if (opts.footerLogo !== undefined) setPath(body, 'media.footer_logo_url', parseValue(opts.footerLogo));

      for (const pair of opts.set) {
        const eq = pair.indexOf('=');
        if (eq === -1) throw new Error(`--set expects path=value, got "${pair}"`);
        setPath(body, pair.slice(0, eq), parseValue(pair.slice(eq + 1)));
      }

      for (const pair of opts.translate) {
        const eq = pair.indexOf('=');
        if (eq === -1) throw new Error(`--translate expects locale.path=value, got "${pair}"`);
        setPath(body, `translations.${pair.slice(0, eq)}`, parseValue(pair.slice(eq + 1)));
      }

      if (Object.keys(body).length === 0) {
        throw new Error('Nothing to change. Pass at least one option (see --help).');
      }

      const data = await api.put(`/directories/${dir}/theme`, body);
      spinner.stop();
      const document = data.data || data;
      printSuccess(`Theme updated — ${document.public_url}`);
      if (!opts.quiet) printJson(stripOptions(document));
    } catch (err) {
      spinner.stop();
      printError(err.message);
      process.exit(1);
    }
  });

theme
  .command('preview')
  .description('Screenshot a page of the live directory to check the theme (20 per hour per account)')
  .option('--page <name>', 'home, browse, categories, category, listing, blog, map or submit', 'home')
  .option('--width <px>', 'Viewport width: 375, 768, 1280 or 1440', '1280')
  .option('--locale <code>', 'Extra language code to capture that language')
  .option('--out <file>', 'Save the image to this file')
  .option('-d, --directory <id>', 'Directory ID')
  .option('--json', 'Output as JSON')
  .action(async (opts) => {
    const spinner = ora('Capturing preview...').start();
    try {
      const dir = resolveDirectory(opts);
      const query = new URLSearchParams({ page: opts.page, width: String(opts.width) });
      if (opts.locale) query.set('locale', opts.locale);
      const data = await api.get(`/directories/${dir}/theme/preview?${query}`);
      const capture = data.data || data;
      if (opts.out) {
        const res = await fetch(capture.url);
        if (!res.ok) throw new Error(`The screenshot could not be downloaded (HTTP ${res.status}).`);
        writeFileSync(opts.out, Buffer.from(await res.arrayBuffer()));
      }
      spinner.stop();
      if (opts.json) {
        printJson(capture);
      } else {
        printSuccess(`Captured ${capture.page} at ${capture.width}px`);
        printInfo(capture.url);
        if (opts.out) printInfo(`Saved to ${opts.out}`);
      }
    } catch (err) {
      spinner.stop();
      printError(err.message);
      process.exit(1);
    }
  });

export default theme;

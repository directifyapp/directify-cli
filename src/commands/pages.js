import { Command } from 'commander';
import { api, resolveDirectory } from '../utils/api.js';
import { printTable, printJson, printSuccess, printError } from '../utils/output.js';
import ora from 'ora';

const pages = new Command('pages').description('Manage custom pages');

pages
  .command('list')
  .alias('ls')
  .description('List all custom pages')
  .option('-d, --directory <id>', 'Directory ID')
  .option('--json', 'Output as JSON')
  .action(async (opts) => {
    const spinner = ora('Fetching pages...').start();
    try {
      const dir = resolveDirectory(opts);
      const data = await api.get(`/directories/${dir}/pages`);
      spinner.stop();
      if (opts.json) {
        printJson(data);
      } else {
        const items = data.data || data;
        printTable(items, [
          { key: 'id', label: 'ID' },
          { key: 'title', label: 'Title', maxWidth: 40 },
          { key: 'slug', label: 'Slug', maxWidth: 25 },
          { key: 'placement', label: 'Placement' },
          { key: 'is_published', label: 'Published' },
          { key: 'order', label: 'Order' },
        ]);
        if (data.meta) {
          console.log(`\nPage ${data.meta.current_page} of ${data.meta.last_page} (${data.meta.total} total)`);
        }
      }
    } catch (err) {
      spinner.stop();
      printError(err.message);
      process.exit(1);
    }
  });

pages
  .command('get <id>')
  .description('Get a specific page')
  .option('-d, --directory <id>', 'Directory ID')
  .action(async (id, opts) => {
    try {
      const dir = resolveDirectory(opts);
      const data = await api.get(`/directories/${dir}/pages/${id}`);
      printJson(data.data || data);
    } catch (err) {
      printError(err.message);
      process.exit(1);
    }
  });

pages
  .command('create')
  .description('Create a new custom page')
  .requiredOption('--title <title>', 'Page title')
  .option('--slug <slug>', 'URL slug (auto-generated from title if not set)')
  .option('--markdown <text>', 'Page content in markdown')
  .option('--placement <type>', 'Where the link appears: navbar, footer, sidebar, unlisted (default: unlisted)')
  .option('--order <n>', 'Sort order for navigation', '0')
  .option('--seo-title <text>', 'SEO title')
  .option('--seo-description <text>', 'SEO description')
  .option('--external-url <url>', 'External URL (makes this a link, not a page)')
  .option('--new-tab', 'Open external links in new tab')
  .option('--unpublished', 'Create as unpublished')
  .option('-d, --directory <id>', 'Directory ID')
  .action(async (opts) => {
    const spinner = ora('Creating page...').start();
    try {
      const dir = resolveDirectory(opts);
      const body = { title: opts.title };
      if (opts.slug) body.slug = opts.slug;
      if (opts.markdown) body.markdown = opts.markdown;
      if (opts.placement) body.placement = opts.placement;
      if (opts.order) body.order = parseInt(opts.order, 10);
      if (opts.externalUrl) {
        body.is_external = true;
        body.external_url = opts.externalUrl;
      }
      if (opts.newTab) body.new_tab = true;
      if (opts.seoTitle || opts.seoDescription) {
        body.seo = {};
        if (opts.seoTitle) body.seo.title = opts.seoTitle;
        if (opts.seoDescription) body.seo.description = opts.seoDescription;
      }
      body.is_published = !opts.unpublished;

      const data = await api.post(`/directories/${dir}/pages`, body);
      spinner.stop();
      const result = data.data || data;
      printSuccess(`Page created: ${result.title} (ID: ${result.id})`);
    } catch (err) {
      spinner.stop();
      printError(err.message);
      process.exit(1);
    }
  });

pages
  .command('update <id>')
  .description('Update a custom page')
  .option('--title <title>', 'Page title')
  .option('--slug <slug>', 'URL slug')
  .option('--markdown <text>', 'Page content in markdown')
  .option('--placement <type>', 'Where the link appears: navbar, footer, sidebar, unlisted')
  .option('--order <n>', 'Sort order for navigation')
  .option('--seo-title <text>', 'SEO title')
  .option('--seo-description <text>', 'SEO description')
  .option('--external-url <url>', 'External URL')
  .option('--new-tab <bool>', 'Open in new tab (true/false)')
  .option('--published <bool>', 'Published status (true/false)')
  .option('-d, --directory <id>', 'Directory ID')
  .action(async (id, opts) => {
    const spinner = ora('Updating page...').start();
    try {
      const dir = resolveDirectory(opts);
      const body = {};
      if (opts.title) body.title = opts.title;
      if (opts.slug) body.slug = opts.slug;
      if (opts.markdown) body.markdown = opts.markdown;
      if (opts.placement) body.placement = opts.placement;
      if (opts.order !== undefined) body.order = parseInt(opts.order, 10);
      if (opts.externalUrl) {
        body.is_external = true;
        body.external_url = opts.externalUrl;
      }
      if (opts.newTab !== undefined) body.new_tab = opts.newTab === 'true';
      if (opts.published !== undefined) body.is_published = opts.published === 'true';
      if (opts.seoTitle || opts.seoDescription) {
        body.seo = {};
        if (opts.seoTitle) body.seo.title = opts.seoTitle;
        if (opts.seoDescription) body.seo.description = opts.seoDescription;
      }

      const data = await api.put(`/directories/${dir}/pages/${id}`, body);
      spinner.stop();
      printSuccess(`Page updated: ${data.data?.title || data.title}`);
    } catch (err) {
      spinner.stop();
      printError(err.message);
      process.exit(1);
    }
  });

pages
  .command('delete <id>')
  .description('Delete a custom page')
  .option('-d, --directory <id>', 'Directory ID')
  .action(async (id, opts) => {
    const spinner = ora('Deleting page...').start();
    try {
      const dir = resolveDirectory(opts);
      await api.delete(`/directories/${dir}/pages/${id}`);
      spinner.stop();
      printSuccess(`Page ${id} deleted.`);
    } catch (err) {
      spinner.stop();
      printError(err.message);
      process.exit(1);
    }
  });

pages
  .command('toggle <id>')
  .description('Toggle page published/unpublished status')
  .option('-d, --directory <id>', 'Directory ID')
  .action(async (id, opts) => {
    const spinner = ora('Toggling page...').start();
    try {
      const dir = resolveDirectory(opts);
      const data = await api.patch(`/directories/${dir}/pages/${id}/toggle`);
      spinner.stop();
      const result = data.data || data;
      printSuccess(`Page "${result.title}" is now ${result.is_published ? 'published' : 'unpublished'}.`);
    } catch (err) {
      spinner.stop();
      printError(err.message);
      process.exit(1);
    }
  });

export default pages;

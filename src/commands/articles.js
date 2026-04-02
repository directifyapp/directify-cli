import { Command } from 'commander';
import { api, resolveDirectory } from '../utils/api.js';
import { printTable, printJson, printSuccess, printError } from '../utils/output.js';
import ora from 'ora';

const articles = new Command('articles').description('Manage blog articles');

articles
  .command('list')
  .alias('ls')
  .description('List all articles')
  .option('-d, --directory <id>', 'Directory ID')
  .option('--page <n>', 'Page number', '1')
  .option('--json', 'Output as JSON')
  .action(async (opts) => {
    const spinner = ora('Fetching articles...').start();
    try {
      const dir = resolveDirectory(opts);
      const data = await api.get(`/directories/${dir}/articles?page=${opts.page}`);
      spinner.stop();
      if (opts.json) {
        printJson(data);
      } else {
        const items = data.data || data;
        printTable(items, [
          { key: 'id', label: 'ID' },
          { key: 'title', label: 'Title', maxWidth: 40 },
          { key: 'slug', label: 'Slug', maxWidth: 25 },
          { key: 'active', label: 'Active' },
          { key: 'published_at', label: 'Published' },
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

articles
  .command('get <id>')
  .description('Get a specific article')
  .option('-d, --directory <id>', 'Directory ID')
  .action(async (id, opts) => {
    try {
      const dir = resolveDirectory(opts);
      const data = await api.get(`/directories/${dir}/articles/${id}`);
      printJson(data.data || data);
    } catch (err) {
      printError(err.message);
      process.exit(1);
    }
  });

articles
  .command('create')
  .description('Create a new article')
  .requiredOption('--title <title>', 'Article title')
  .option('--slug <slug>', 'URL slug (auto-generated from title if not set)')
  .option('--content <text>', 'HTML content')
  .option('--markdown <text>', 'Markdown content')
  .option('--thumbnail-url <url>', 'Thumbnail image URL')
  .option('--categories <names>', 'Category names (comma-separated)')
  .option('--seo-title <text>', 'SEO title')
  .option('--seo-description <text>', 'SEO description')
  .option('--inactive', 'Create as inactive')
  .option('-d, --directory <id>', 'Directory ID')
  .action(async (opts) => {
    const spinner = ora('Creating article...').start();
    try {
      const dir = resolveDirectory(opts);
      const body = { title: opts.title };
      if (opts.slug) body.slug = opts.slug;
      if (opts.content) body.content = opts.content;
      if (opts.markdown) body.markdown = opts.markdown;
      if (opts.thumbnailUrl) body.thumbnail_url = opts.thumbnailUrl;
      if (opts.categories) body.categories = opts.categories.split(',').map((s) => s.trim());
      if (opts.seoTitle || opts.seoDescription) {
        body.seo = {};
        if (opts.seoTitle) body.seo.title = opts.seoTitle;
        if (opts.seoDescription) body.seo.description = opts.seoDescription;
      }
      body.active = !opts.inactive;

      const data = await api.post(`/directories/${dir}/articles`, body);
      spinner.stop();
      const result = data.data || data;
      printSuccess(`Article created: ${result.title} (ID: ${result.id})`);
    } catch (err) {
      spinner.stop();
      printError(err.message);
      process.exit(1);
    }
  });

articles
  .command('update <id>')
  .description('Update an article')
  .option('--title <title>', 'Article title')
  .option('--slug <slug>', 'URL slug')
  .option('--content <text>', 'HTML content')
  .option('--markdown <text>', 'Markdown content')
  .option('--thumbnail-url <url>', 'Thumbnail image URL')
  .option('--categories <names>', 'Category names (comma-separated)')
  .option('--seo-title <text>', 'SEO title')
  .option('--seo-description <text>', 'SEO description')
  .option('--active <bool>', 'Active status (true/false)')
  .option('-d, --directory <id>', 'Directory ID')
  .action(async (id, opts) => {
    const spinner = ora('Updating article...').start();
    try {
      const dir = resolveDirectory(opts);
      const body = {};
      if (opts.title) body.title = opts.title;
      if (opts.slug) body.slug = opts.slug;
      if (opts.content) body.content = opts.content;
      if (opts.markdown) body.markdown = opts.markdown;
      if (opts.thumbnailUrl) body.thumbnail_url = opts.thumbnailUrl;
      if (opts.categories) body.categories = opts.categories.split(',').map((s) => s.trim());
      if (opts.active !== undefined) body.active = opts.active === 'true';
      if (opts.seoTitle || opts.seoDescription) {
        body.seo = {};
        if (opts.seoTitle) body.seo.title = opts.seoTitle;
        if (opts.seoDescription) body.seo.description = opts.seoDescription;
      }

      const data = await api.put(`/directories/${dir}/articles/${id}`, body);
      spinner.stop();
      printSuccess(`Article updated: ${data.data?.title || data.title}`);
    } catch (err) {
      spinner.stop();
      printError(err.message);
      process.exit(1);
    }
  });

articles
  .command('delete <id>')
  .description('Delete an article')
  .option('-d, --directory <id>', 'Directory ID')
  .action(async (id, opts) => {
    const spinner = ora('Deleting article...').start();
    try {
      const dir = resolveDirectory(opts);
      await api.delete(`/directories/${dir}/articles/${id}`);
      spinner.stop();
      printSuccess(`Article ${id} deleted.`);
    } catch (err) {
      spinner.stop();
      printError(err.message);
      process.exit(1);
    }
  });

articles
  .command('toggle <id>')
  .description('Toggle article active/inactive status')
  .option('-d, --directory <id>', 'Directory ID')
  .action(async (id, opts) => {
    const spinner = ora('Toggling article...').start();
    try {
      const dir = resolveDirectory(opts);
      const data = await api.patch(`/directories/${dir}/articles/${id}/toggle`);
      spinner.stop();
      const result = data.data || data;
      printSuccess(`Article "${result.title}" is now ${result.active ? 'active' : 'inactive'}.`);
    } catch (err) {
      spinner.stop();
      printError(err.message);
      process.exit(1);
    }
  });

articles
  .command('exists')
  .description('Check if an article with a given slug exists')
  .requiredOption('--slug <slug>', 'Slug to check')
  .option('-d, --directory <id>', 'Directory ID')
  .action(async (opts) => {
    try {
      const dir = resolveDirectory(opts);
      const data = await api.post(`/directories/${dir}/articles/exists`, { slug: opts.slug });
      printSuccess(data.message);
    } catch (err) {
      printError(err.message);
      process.exit(1);
    }
  });

export default articles;

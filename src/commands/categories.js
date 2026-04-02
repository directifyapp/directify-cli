import { Command } from 'commander';
import { api, resolveDirectory } from '../utils/api.js';
import { printTable, printJson, printSuccess, printError } from '../utils/output.js';
import ora from 'ora';

const categories = new Command('categories')
  .alias('cats')
  .description('Manage categories');

categories
  .command('list')
  .alias('ls')
  .description('List all categories')
  .option('-d, --directory <id>', 'Directory ID')
  .option('--json', 'Output as JSON')
  .action(async (opts) => {
    const spinner = ora('Fetching categories...').start();
    try {
      const dir = resolveDirectory(opts);
      const data = await api.get(`/directories/${dir}/categories`);
      spinner.stop();
      if (opts.json) {
        printJson(data.data || data);
      } else {
        printTable(data.data || data, [
          { key: 'id', label: 'ID' },
          { key: 'title', label: 'Title', maxWidth: 30 },
          { key: 'slug', label: 'Slug', maxWidth: 30 },
          { key: 'is_active', label: 'Active' },
          { key: 'order', label: 'Order' },
        ]);
      }
    } catch (err) {
      spinner.stop();
      printError(err.message);
      process.exit(1);
    }
  });

categories
  .command('get <id>')
  .description('Get a specific category')
  .option('-d, --directory <id>', 'Directory ID')
  .option('--json', 'Output as JSON')
  .action(async (id, opts) => {
    try {
      const dir = resolveDirectory(opts);
      const data = await api.get(`/directories/${dir}/categories/${id}`);
      printJson(data.data || data);
    } catch (err) {
      printError(err.message);
      process.exit(1);
    }
  });

categories
  .command('create')
  .description('Create a new category')
  .requiredOption('--title <title>', 'Category title')
  .option('--slug <slug>', 'URL slug')
  .option('--description <text>', 'Description')
  .option('--content <text>', 'Content (markdown)')
  .option('--icon <icon>', 'Icon (emoji or URL)')
  .option('--parent-id <id>', 'Parent category ID')
  .option('--order <n>', 'Sort order', parseInt)
  .option('--inactive', 'Create as inactive')
  .option('-d, --directory <id>', 'Directory ID')
  .action(async (opts) => {
    const spinner = ora('Creating category...').start();
    try {
      const dir = resolveDirectory(opts);
      const body = {
        title: opts.title,
        ...(opts.slug && { slug: opts.slug }),
        ...(opts.description && { description: opts.description }),
        ...(opts.content && { content: opts.content }),
        ...(opts.icon && { icon: opts.icon }),
        ...(opts.parentId && { parent_id: parseInt(opts.parentId) }),
        ...(opts.order !== undefined && { order: opts.order }),
        is_active: !opts.inactive,
      };
      const data = await api.post(`/directories/${dir}/categories`, body);
      spinner.stop();
      printSuccess(`Category created: ${data.data?.title || data.title} (ID: ${data.data?.id || data.id})`);
    } catch (err) {
      spinner.stop();
      printError(err.message);
      process.exit(1);
    }
  });

categories
  .command('update <id>')
  .description('Update a category')
  .option('--title <title>', 'Category title')
  .option('--slug <slug>', 'URL slug')
  .option('--description <text>', 'Description')
  .option('--content <text>', 'Content')
  .option('--icon <icon>', 'Icon')
  .option('--parent-id <id>', 'Parent category ID')
  .option('--order <n>', 'Sort order', parseInt)
  .option('--active <bool>', 'Active status (true/false)')
  .option('-d, --directory <id>', 'Directory ID')
  .action(async (id, opts) => {
    const spinner = ora('Updating category...').start();
    try {
      const dir = resolveDirectory(opts);
      const body = {};
      if (opts.title) body.title = opts.title;
      if (opts.slug) body.slug = opts.slug;
      if (opts.description) body.description = opts.description;
      if (opts.content) body.content = opts.content;
      if (opts.icon) body.icon = opts.icon;
      if (opts.parentId) body.parent_id = parseInt(opts.parentId);
      if (opts.order !== undefined) body.order = opts.order;
      if (opts.active !== undefined) body.is_active = opts.active === 'true';

      const data = await api.put(`/directories/${dir}/categories/${id}`, body);
      spinner.stop();
      printSuccess(`Category updated: ${data.data?.title || data.title}`);
    } catch (err) {
      spinner.stop();
      printError(err.message);
      process.exit(1);
    }
  });

categories
  .command('delete <id>')
  .description('Delete a category')
  .option('-d, --directory <id>', 'Directory ID')
  .action(async (id, opts) => {
    const spinner = ora('Deleting category...').start();
    try {
      const dir = resolveDirectory(opts);
      await api.delete(`/directories/${dir}/categories/${id}`);
      spinner.stop();
      printSuccess(`Category ${id} deleted.`);
    } catch (err) {
      spinner.stop();
      printError(err.message);
      process.exit(1);
    }
  });

export default categories;

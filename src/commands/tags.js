import { Command } from 'commander';
import { api, resolveDirectory } from '../utils/api.js';
import { printTable, printJson, printSuccess, printError } from '../utils/output.js';
import ora from 'ora';

const tags = new Command('tags').description('Manage tags');

tags
  .command('list')
  .alias('ls')
  .description('List all tags')
  .option('-d, --directory <id>', 'Directory ID')
  .option('--json', 'Output as JSON')
  .action(async (opts) => {
    const spinner = ora('Fetching tags...').start();
    try {
      const dir = resolveDirectory(opts);
      const data = await api.get(`/directories/${dir}/tags`);
      spinner.stop();
      if (opts.json) {
        printJson(data.data || data);
      } else {
        printTable(data.data || data, [
          { key: 'id', label: 'ID' },
          { key: 'title', label: 'Title', maxWidth: 30 },
          { key: 'slug', label: 'Slug', maxWidth: 30 },
          { key: 'is_active', label: 'Active' },
        ]);
      }
    } catch (err) {
      spinner.stop();
      printError(err.message);
      process.exit(1);
    }
  });

tags
  .command('get <id>')
  .description('Get a specific tag')
  .option('-d, --directory <id>', 'Directory ID')
  .action(async (id, opts) => {
    try {
      const dir = resolveDirectory(opts);
      const data = await api.get(`/directories/${dir}/tags/${id}`);
      printJson(data.data || data);
    } catch (err) {
      printError(err.message);
      process.exit(1);
    }
  });

tags
  .command('create')
  .description('Create a new tag')
  .requiredOption('--title <title>', 'Tag title')
  .option('--slug <slug>', 'URL slug')
  .option('--color <hex>', 'Background color (hex)')
  .option('--text-color <hex>', 'Text color (hex)')
  .option('--icon <icon>', 'Icon')
  .option('--heroicon <name>', 'Heroicon name')
  .option('--inactive', 'Create as inactive')
  .option('-d, --directory <id>', 'Directory ID')
  .action(async (opts) => {
    const spinner = ora('Creating tag...').start();
    try {
      const dir = resolveDirectory(opts);
      const body = {
        title: opts.title,
        ...(opts.slug && { slug: opts.slug }),
        ...(opts.color && { color: opts.color }),
        ...(opts.textColor && { text_color: opts.textColor }),
        ...(opts.icon && { icon: opts.icon }),
        ...(opts.heroicon && { heroicon: opts.heroicon }),
        is_active: !opts.inactive,
      };
      const data = await api.post(`/directories/${dir}/tags`, body);
      spinner.stop();
      printSuccess(`Tag created: ${data.data?.title || data.title} (ID: ${data.data?.id || data.id})`);
    } catch (err) {
      spinner.stop();
      printError(err.message);
      process.exit(1);
    }
  });

tags
  .command('update <id>')
  .description('Update a tag')
  .option('--title <title>', 'Tag title')
  .option('--slug <slug>', 'URL slug')
  .option('--color <hex>', 'Background color')
  .option('--text-color <hex>', 'Text color')
  .option('--icon <icon>', 'Icon')
  .option('--heroicon <name>', 'Heroicon name')
  .option('--active <bool>', 'Active status (true/false)')
  .option('-d, --directory <id>', 'Directory ID')
  .action(async (id, opts) => {
    const spinner = ora('Updating tag...').start();
    try {
      const dir = resolveDirectory(opts);
      const body = {};
      if (opts.title) body.title = opts.title;
      if (opts.slug) body.slug = opts.slug;
      if (opts.color) body.color = opts.color;
      if (opts.textColor) body.text_color = opts.textColor;
      if (opts.icon) body.icon = opts.icon;
      if (opts.heroicon) body.heroicon = opts.heroicon;
      if (opts.active !== undefined) body.is_active = opts.active === 'true';

      const data = await api.put(`/directories/${dir}/tags/${id}`, body);
      spinner.stop();
      printSuccess(`Tag updated: ${data.data?.title || data.title}`);
    } catch (err) {
      spinner.stop();
      printError(err.message);
      process.exit(1);
    }
  });

tags
  .command('delete <id>')
  .description('Delete a tag')
  .option('-d, --directory <id>', 'Directory ID')
  .action(async (id, opts) => {
    const spinner = ora('Deleting tag...').start();
    try {
      const dir = resolveDirectory(opts);
      await api.delete(`/directories/${dir}/tags/${id}`);
      spinner.stop();
      printSuccess(`Tag ${id} deleted.`);
    } catch (err) {
      spinner.stop();
      printError(err.message);
      process.exit(1);
    }
  });

export default tags;

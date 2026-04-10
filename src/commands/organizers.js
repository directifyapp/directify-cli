import { Command } from 'commander';
import { api, resolveDirectory } from '../utils/api.js';
import { printTable, printJson, printSuccess, printError } from '../utils/output.js';
import ora from 'ora';

const organizers = new Command('organizers').alias('orgs').description('Manage organizers');

organizers
  .command('list')
  .alias('ls')
  .description('List all organizers')
  .option('-d, --directory <id>', 'Directory ID')
  .option('--json', 'Output as JSON')
  .action(async (opts) => {
    const spinner = ora('Fetching organizers...').start();
    try {
      const dir = resolveDirectory(opts);
      const data = await api.get(`/directories/${dir}/organizers`);
      spinner.stop();
      if (opts.json) {
        printJson(data.data || data);
      } else {
        printTable(data.data || data, [
          { key: 'id', label: 'ID' },
          { key: 'name', label: 'Name', maxWidth: 30 },
          { key: 'slug', label: 'Slug', maxWidth: 25 },
          { key: 'email', label: 'Email', maxWidth: 30 },
          { key: 'is_active', label: 'Active' },
          { key: 'user_id', label: 'User ID' },
        ]);
      }
    } catch (err) {
      spinner.stop();
      printError(err.message);
      process.exit(1);
    }
  });

organizers
  .command('get <id>')
  .description('Get a specific organizer')
  .option('-d, --directory <id>', 'Directory ID')
  .action(async (id, opts) => {
    try {
      const dir = resolveDirectory(opts);
      const data = await api.get(`/directories/${dir}/organizers/${id}`);
      printJson(data.data || data);
    } catch (err) {
      printError(err.message);
      process.exit(1);
    }
  });

organizers
  .command('create')
  .description('Create a new organizer')
  .requiredOption('--name <name>', 'Organizer name')
  .option('--slug <slug>', 'URL slug (auto-generated from name if not provided)')
  .option('--description <text>', 'Description')
  .option('--email <email>', 'Contact email')
  .option('--phone <phone>', 'Contact phone')
  .option('--website <url>', 'Website URL')
  .option('--user-id <id>', 'Assign to a user (submitter) by ID')
  .option('--inactive', 'Create as inactive')
  .option('--order <n>', 'Sort order', '0')
  .option('-d, --directory <id>', 'Directory ID')
  .action(async (opts) => {
    const spinner = ora('Creating organizer...').start();
    try {
      const dir = resolveDirectory(opts);
      const body = {
        name: opts.name,
        ...(opts.slug && { slug: opts.slug }),
        ...(opts.description && { description: opts.description }),
        ...(opts.email && { email: opts.email }),
        ...(opts.phone && { phone: opts.phone }),
        ...(opts.website && { website_url: opts.website }),
        ...(opts.userId && { user_id: Number(opts.userId) }),
        is_active: !opts.inactive,
        order: Number(opts.order),
      };
      const data = await api.post(`/directories/${dir}/organizers`, body);
      spinner.stop();
      printSuccess(`Organizer created: ${data.data?.name || data.name} (ID: ${data.data?.id || data.id})`);
    } catch (err) {
      spinner.stop();
      printError(err.message);
      process.exit(1);
    }
  });

organizers
  .command('update <id>')
  .description('Update an organizer')
  .option('--name <name>', 'Organizer name')
  .option('--slug <slug>', 'URL slug')
  .option('--description <text>', 'Description')
  .option('--email <email>', 'Contact email')
  .option('--phone <phone>', 'Contact phone')
  .option('--website <url>', 'Website URL')
  .option('--user-id <id>', 'Assign to a user (submitter) by ID')
  .option('--active <bool>', 'Active status (true/false)')
  .option('--order <n>', 'Sort order')
  .option('-d, --directory <id>', 'Directory ID')
  .action(async (id, opts) => {
    const spinner = ora('Updating organizer...').start();
    try {
      const dir = resolveDirectory(opts);
      const body = {};
      if (opts.name) body.name = opts.name;
      if (opts.slug) body.slug = opts.slug;
      if (opts.description) body.description = opts.description;
      if (opts.email) body.email = opts.email;
      if (opts.phone) body.phone = opts.phone;
      if (opts.website) body.website_url = opts.website;
      if (opts.userId) body.user_id = Number(opts.userId);
      if (opts.active !== undefined) body.is_active = opts.active === 'true';
      if (opts.order !== undefined) body.order = Number(opts.order);

      const data = await api.put(`/directories/${dir}/organizers/${id}`, body);
      spinner.stop();
      printSuccess(`Organizer updated: ${data.data?.name || data.name}`);
    } catch (err) {
      spinner.stop();
      printError(err.message);
      process.exit(1);
    }
  });

organizers
  .command('delete <id>')
  .description('Delete an organizer')
  .option('-d, --directory <id>', 'Directory ID')
  .action(async (id, opts) => {
    const spinner = ora('Deleting organizer...').start();
    try {
      const dir = resolveDirectory(opts);
      await api.delete(`/directories/${dir}/organizers/${id}`);
      spinner.stop();
      printSuccess(`Organizer ${id} deleted.`);
    } catch (err) {
      spinner.stop();
      printError(err.message);
      process.exit(1);
    }
  });

export default organizers;

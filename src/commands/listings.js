import { Command } from 'commander';
import { api, resolveDirectory } from '../utils/api.js';
import { printTable, printJson, printSuccess, printError } from '../utils/output.js';
import { readFileSync } from 'fs';
import ora from 'ora';

const listings = new Command('listings').description('Manage listings (projects)');

listings
  .command('list')
  .alias('ls')
  .description('List all listings (paginated)')
  .option('-d, --directory <id>', 'Directory ID')
  .option('--page <n>', 'Page number', '1')
  .option('--json', 'Output as JSON')
  .action(async (opts) => {
    const spinner = ora('Fetching listings...').start();
    try {
      const dir = resolveDirectory(opts);
      const data = await api.get(`/directories/${dir}/projects?page=${opts.page}`);
      spinner.stop();
      if (opts.json) {
        printJson(data);
      } else {
        const items = data.data || data;
        printTable(items, [
          { key: 'id', label: 'ID' },
          { key: 'name', label: 'Name', maxWidth: 35 },
          { key: 'slug', label: 'Slug', maxWidth: 25 },
          { key: 'is_active', label: 'Active' },
          { key: 'is_featured', label: 'Featured' },
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

listings
  .command('get <id>')
  .description('Get a specific listing')
  .option('-d, --directory <id>', 'Directory ID')
  .action(async (id, opts) => {
    try {
      const dir = resolveDirectory(opts);
      const data = await api.get(`/directories/${dir}/projects/${id}`);
      printJson(data.data || data);
    } catch (err) {
      printError(err.message);
      process.exit(1);
    }
  });

listings
  .command('create')
  .description('Create a new listing')
  .requiredOption('--name <name>', 'Listing name')
  .option('--url <url>', 'Website URL')
  .option('--slug <slug>', 'URL slug')
  .option('--description <text>', 'Short description')
  .option('--content <text>', 'Full content (markdown)')
  .option('--image-url <url>', 'Cover image URL')
  .option('--logo-url <url>', 'Logo URL')
  .option('--phone <number>', 'Phone number')
  .option('--email <email>', 'Email address')
  .option('--address <address>', 'Physical address')
  .option('--lat <n>', 'Latitude', parseFloat)
  .option('--lng <n>', 'Longitude', parseFloat)
  .option('--categories <ids>', 'Category IDs (comma-separated)')
  .option('--tags <ids>', 'Tag IDs (comma-separated)')
  .option('--featured', 'Mark as featured')
  .option('--inactive', 'Create as inactive')
  .option('--field <key=value...>', 'Custom field values (repeatable)', collect, [])
  .option('-d, --directory <id>', 'Directory ID')
  .action(async (opts) => {
    const spinner = ora('Creating listing...').start();
    try {
      const dir = resolveDirectory(opts);
      const body = { name: opts.name };
      if (opts.url) body.url = opts.url;
      if (opts.slug) body.slug = opts.slug;
      if (opts.description) body.description = opts.description;
      if (opts.content) body.content = opts.content;
      if (opts.imageUrl) body.image_url = opts.imageUrl;
      if (opts.logoUrl) body.logo_url = opts.logoUrl;
      if (opts.phone) body.phone_number = opts.phone;
      if (opts.email) body.email = opts.email;
      if (opts.address) body.address = opts.address;
      if (opts.lat) body.latitude = opts.lat;
      if (opts.lng) body.longitude = opts.lng;
      if (opts.categories) body.categories = opts.categories.split(',').map(Number);
      if (opts.tags) body.tags = opts.tags.split(',').map(Number);
      if (opts.featured) body.is_featured = true;
      if (opts.inactive) body.is_active = false;

      // Custom fields
      for (const field of opts.field) {
        const [key, ...rest] = field.split('=');
        body[key] = rest.join('=');
      }

      const data = await api.post(`/directories/${dir}/projects`, body);
      spinner.stop();
      const result = data.data || data;
      printSuccess(`Listing created: ${result.name} (ID: ${result.id})`);
    } catch (err) {
      spinner.stop();
      printError(err.message);
      process.exit(1);
    }
  });

listings
  .command('update <id>')
  .description('Update a listing')
  .option('--name <name>', 'Listing name')
  .option('--url <url>', 'Website URL')
  .option('--slug <slug>', 'URL slug')
  .option('--description <text>', 'Short description')
  .option('--content <text>', 'Full content (markdown)')
  .option('--image-url <url>', 'Cover image URL')
  .option('--logo-url <url>', 'Logo URL')
  .option('--phone <number>', 'Phone number')
  .option('--email <email>', 'Email address')
  .option('--address <address>', 'Physical address')
  .option('--lat <n>', 'Latitude', parseFloat)
  .option('--lng <n>', 'Longitude', parseFloat)
  .option('--categories <ids>', 'Category IDs (comma-separated)')
  .option('--tags <ids>', 'Tag IDs (comma-separated)')
  .option('--featured <bool>', 'Featured status (true/false)')
  .option('--active <bool>', 'Active status (true/false)')
  .option('--field <key=value...>', 'Custom field values (repeatable)', collect, [])
  .option('-d, --directory <id>', 'Directory ID')
  .action(async (id, opts) => {
    const spinner = ora('Updating listing...').start();
    try {
      const dir = resolveDirectory(opts);
      const body = {};
      if (opts.name) body.name = opts.name;
      if (opts.url) body.url = opts.url;
      if (opts.slug) body.slug = opts.slug;
      if (opts.description) body.description = opts.description;
      if (opts.content) body.content = opts.content;
      if (opts.imageUrl) body.image_url = opts.imageUrl;
      if (opts.logoUrl) body.logo_url = opts.logoUrl;
      if (opts.phone) body.phone_number = opts.phone;
      if (opts.email) body.email = opts.email;
      if (opts.address) body.address = opts.address;
      if (opts.lat) body.latitude = opts.lat;
      if (opts.lng) body.longitude = opts.lng;
      if (opts.categories) body.categories = opts.categories.split(',').map(Number);
      if (opts.tags) body.tags = opts.tags.split(',').map(Number);
      if (opts.featured !== undefined) body.is_featured = opts.featured === 'true';
      if (opts.active !== undefined) body.is_active = opts.active === 'true';

      for (const field of opts.field) {
        const [key, ...rest] = field.split('=');
        body[key] = rest.join('=');
      }

      const data = await api.put(`/directories/${dir}/projects/${id}`, body);
      spinner.stop();
      printSuccess(`Listing updated: ${data.data?.name || data.name}`);
    } catch (err) {
      spinner.stop();
      printError(err.message);
      process.exit(1);
    }
  });

listings
  .command('delete <id>')
  .description('Delete a listing')
  .option('-d, --directory <id>', 'Directory ID')
  .action(async (id, opts) => {
    const spinner = ora('Deleting listing...').start();
    try {
      const dir = resolveDirectory(opts);
      await api.delete(`/directories/${dir}/projects/${id}`);
      spinner.stop();
      printSuccess(`Listing ${id} deleted.`);
    } catch (err) {
      spinner.stop();
      printError(err.message);
      process.exit(1);
    }
  });

listings
  .command('exists')
  .description('Check if a listing with a given URL exists')
  .requiredOption('--url <url>', 'URL to check')
  .option('-d, --directory <id>', 'Directory ID')
  .action(async (opts) => {
    try {
      const dir = resolveDirectory(opts);
      const data = await api.post(`/directories/${dir}/projects/exists`, { url: opts.url });
      printSuccess(data.message);
    } catch (err) {
      printError(err.message);
      process.exit(1);
    }
  });

listings
  .command('bulk-create')
  .description('Bulk create listings from a JSON file')
  .requiredOption('--file <path>', 'Path to JSON file with listings array')
  .option('-d, --directory <id>', 'Directory ID')
  .action(async (opts) => {
    const spinner = ora('Creating listings...').start();
    try {
      const dir = resolveDirectory(opts);
      const content = readFileSync(opts.file, 'utf-8');
      const listings = JSON.parse(content);
      const body = { listings: Array.isArray(listings) ? listings : listings.listings };

      const data = await api.post(`/directories/${dir}/projects/bulk`, body);
      spinner.stop();
      printSuccess(`Created: ${data.total_created}, Errors: ${data.total_errors}`);
      if (data.errors && data.errors.length > 0) {
        console.log('\nErrors:');
        for (const err of data.errors) {
          printError(`  [${err.index}] ${err.name}: ${err.error}`);
        }
      }
    } catch (err) {
      spinner.stop();
      printError(err.message);
      process.exit(1);
    }
  });

function collect(value, previous) {
  return previous.concat([value]);
}

export default listings;

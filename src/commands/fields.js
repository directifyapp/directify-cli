import { Command } from 'commander';
import { api, resolveDirectory } from '../utils/api.js';
import { printTable, printJson, printSuccess, printError } from '../utils/output.js';
import ora from 'ora';

const fields = new Command('fields').description('Manage custom fields');

const FIELD_TYPES = 'text, number, date, file_upload, url, email, rich_editor, markdown, textarea, checkbox, rating, select, list, multi_select, button, javascript, html';

fields
  .command('list')
  .alias('ls')
  .description('List all custom fields for a directory')
  .option('-d, --directory <id>', 'Directory ID')
  .option('--json', 'Output as JSON')
  .action(async (opts) => {
    const spinner = ora('Fetching custom fields...').start();
    try {
      const dir = resolveDirectory(opts);
      const data = await api.get(`/directories/${dir}/custom-fields`);
      spinner.stop();
      const items = data.data || data;
      if (opts.json) {
        printJson(items);
      } else {
        printTable(items, [
          { key: 'id', label: 'ID' },
          { key: 'name', label: 'Name', maxWidth: 25 },
          { key: 'label', label: 'Label', maxWidth: 25 },
          { key: 'type', label: 'Type' },
          { key: 'is_required', label: 'Required' },
          { key: 'filterable', label: 'Filterable' },
          { key: 'show_on_card', label: 'On Card' },
        ]);
      }
    } catch (err) {
      spinner.stop();
      printError(err.message);
      process.exit(1);
    }
  });

fields
  .command('get <id>')
  .description('Get a specific custom field')
  .option('-d, --directory <id>', 'Directory ID')
  .action(async (id, opts) => {
    try {
      const dir = resolveDirectory(opts);
      const data = await api.get(`/directories/${dir}/custom-fields/${id}`);
      printJson(data.data || data);
    } catch (err) {
      printError(err.message);
      process.exit(1);
    }
  });

fields
  .command('create')
  .description('Create a new custom field definition')
  .requiredOption('--label <label>', 'Human-readable field label')
  .requiredOption('--type <type>', `Field type (${FIELD_TYPES})`)
  .option('--name <name>', 'Machine name/key (auto-derived from label if omitted)')
  .option('--fieldable-type <type>', 'What the field attaches to: listing, organizer, article (default: listing)')
  .option('--placeholder <text>', 'Input placeholder text')
  .option('--description <text>', 'Help text shown under the field')
  .option('--default <value>', 'Default value')
  .option('--prefix <value>', 'Prefix shown before the value (e.g. $)')
  .option('--suffix <value>', 'Suffix shown after the value (e.g. /mo)')
  .option('--options <values>', 'Options for select/multi_select/list types (comma-separated)')
  .option('--required', 'Mark the field as required')
  .option('--filterable', 'Allow filtering listings by this field')
  .option('--on-card', 'Show the value on listing cards')
  .option('--public', 'Show the field on the public submission form')
  .option('--hidden', 'Hide the field from the listing page')
  .option('--order <n>', 'Sort order', parseInt)
  .option('-d, --directory <id>', 'Directory ID')
  .action(async (opts) => {
    const spinner = ora('Creating custom field...').start();
    try {
      const dir = resolveDirectory(opts);
      const body = { label: opts.label, type: opts.type };
      if (opts.name) body.name = opts.name;
      if (opts.fieldableType) body.fieldable_type = opts.fieldableType;
      if (opts.placeholder) body.placeholder = opts.placeholder;
      if (opts.description) body.description = opts.description;
      if (opts.default) body.default_value = opts.default;
      if (opts.prefix) body.value_prefix = opts.prefix;
      if (opts.suffix) body.value_suffix = opts.suffix;
      if (opts.options) body.options = opts.options.split(',').map((o) => o.trim());
      if (opts.required) body.is_required = true;
      if (opts.filterable) body.filterable = true;
      if (opts.onCard) body.show_on_card = true;
      if (opts.public) body.show_on_public_submission = true;
      if (opts.hidden) body.is_visible = false;
      if (opts.order !== undefined) body.order = opts.order;

      const data = await api.post(`/directories/${dir}/custom-fields`, body);
      spinner.stop();
      const result = data.data || data;
      printSuccess(`Custom field created: ${result.label} (${result.name}, ID: ${result.id})`);
    } catch (err) {
      spinner.stop();
      printError(err.message);
      process.exit(1);
    }
  });

fields
  .command('update <id>')
  .description('Update a custom field definition')
  .option('--label <label>', 'Human-readable field label')
  .option('--type <type>', `Field type (${FIELD_TYPES})`)
  .option('--name <name>', 'Machine name/key')
  .option('--fieldable-type <type>', 'What the field attaches to: listing, organizer, article')
  .option('--placeholder <text>', 'Input placeholder text')
  .option('--description <text>', 'Help text shown under the field')
  .option('--default <value>', 'Default value')
  .option('--prefix <value>', 'Prefix shown before the value')
  .option('--suffix <value>', 'Suffix shown after the value')
  .option('--options <values>', 'Options for select/multi_select/list types (comma-separated)')
  .option('--required <bool>', 'Required status (true/false)')
  .option('--filterable <bool>', 'Filterable status (true/false)')
  .option('--on-card <bool>', 'Show on cards (true/false)')
  .option('--public <bool>', 'Show on public submission form (true/false)')
  .option('--visible <bool>', 'Visible on the listing page (true/false)')
  .option('--order <n>', 'Sort order', parseInt)
  .option('-d, --directory <id>', 'Directory ID')
  .action(async (id, opts) => {
    const spinner = ora('Updating custom field...').start();
    try {
      const dir = resolveDirectory(opts);
      const body = {};
      if (opts.label) body.label = opts.label;
      if (opts.type) body.type = opts.type;
      if (opts.name) body.name = opts.name;
      if (opts.fieldableType) body.fieldable_type = opts.fieldableType;
      if (opts.placeholder) body.placeholder = opts.placeholder;
      if (opts.description) body.description = opts.description;
      if (opts.default) body.default_value = opts.default;
      if (opts.prefix) body.value_prefix = opts.prefix;
      if (opts.suffix) body.value_suffix = opts.suffix;
      if (opts.options) body.options = opts.options.split(',').map((o) => o.trim());
      if (opts.required !== undefined) body.is_required = opts.required === 'true';
      if (opts.filterable !== undefined) body.filterable = opts.filterable === 'true';
      if (opts.onCard !== undefined) body.show_on_card = opts.onCard === 'true';
      if (opts.public !== undefined) body.show_on_public_submission = opts.public === 'true';
      if (opts.visible !== undefined) body.is_visible = opts.visible === 'true';
      if (opts.order !== undefined) body.order = opts.order;

      const data = await api.put(`/directories/${dir}/custom-fields/${id}`, body);
      spinner.stop();
      printSuccess(`Custom field updated: ${data.data?.label || data.label}`);
    } catch (err) {
      spinner.stop();
      printError(err.message);
      process.exit(1);
    }
  });

fields
  .command('delete <id>')
  .description('Delete a custom field definition (also removes its values from all listings)')
  .option('-d, --directory <id>', 'Directory ID')
  .action(async (id, opts) => {
    const spinner = ora('Deleting custom field...').start();
    try {
      const dir = resolveDirectory(opts);
      await api.delete(`/directories/${dir}/custom-fields/${id}`);
      spinner.stop();
      printSuccess(`Custom field ${id} deleted.`);
    } catch (err) {
      spinner.stop();
      printError(err.message);
      process.exit(1);
    }
  });

export default fields;

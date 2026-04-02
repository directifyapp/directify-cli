import { Command } from 'commander';
import { api, resolveDirectory } from '../utils/api.js';
import { printTable, printJson, printError } from '../utils/output.js';
import ora from 'ora';

const fields = new Command('fields').description('List custom fields');

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

export default fields;

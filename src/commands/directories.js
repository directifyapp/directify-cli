import { Command } from 'commander';
import { api } from '../utils/api.js';
import { printTable, printJson, printError } from '../utils/output.js';
import ora from 'ora';

const directories = new Command('directories')
  .alias('dirs')
  .description('List your directories');

directories
  .command('list')
  .alias('ls')
  .description('List all directories you own')
  .option('--json', 'Output as JSON')
  .action(async (opts) => {
    const spinner = ora('Fetching directories...').start();
    try {
      const data = await api.get('/directories');
      spinner.stop();
      if (opts.json) {
        printJson(data.data || data);
      } else {
        printTable(data.data || data, [
          { key: 'id', label: 'ID' },
          { key: 'name', label: 'Name', maxWidth: 40 },
        ]);
      }
    } catch (err) {
      spinner.stop();
      printError(err.message);
      process.exit(1);
    }
  });

export default directories;

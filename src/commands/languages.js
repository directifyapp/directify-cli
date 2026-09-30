import { Command } from 'commander';
import { api, resolveDirectory } from '../utils/api.js';
import { printTable, printJson, printError } from '../utils/output.js';
import ora from 'ora';

const languages = new Command('languages')
  .alias('langs')
  .description("Show a directory's languages (multi-language directories)");

languages
  .command('list')
  .alias('ls')
  .description('List the languages a directory is published in')
  .option('-d, --directory <id>', 'Directory ID')
  .option('--json', 'Output as JSON')
  .action(async (opts) => {
    const spinner = ora('Fetching languages...').start();
    try {
      const dir = resolveDirectory(opts);
      const data = await api.get(`/directories/${dir}/languages`);
      spinner.stop();
      const result = data.data || data;
      if (opts.json) {
        printJson(result);
        return;
      }
      printTable(result.languages || [], [
        { key: 'code', label: 'Code' },
        { key: 'tag', label: 'Tag' },
        { key: 'name', label: 'Name', maxWidth: 25 },
        { key: 'native_name', label: 'Native Name', maxWidth: 25 },
        { key: 'default', label: 'Default' },
        { key: 'rtl', label: 'RTL' },
        { key: 'url', label: 'URL', maxWidth: 50 },
      ]);
      console.log(`\nDefault language: ${result.default || '-'}`);
      console.log(`Auto-translate: ${formatList(result.auto_translate)}`);
      console.log(`Do not translate: ${formatList(result.do_not_translate)}`);
    } catch (err) {
      spinner.stop();
      printError(err.message);
      process.exit(1);
    }
  });

function formatList(value) {
  if (!Array.isArray(value) || value.length === 0) return '-';
  return value.map((v) => (typeof v === 'object' && v !== null ? JSON.stringify(v) : v)).join(', ');
}

export default languages;

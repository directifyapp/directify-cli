import { Command } from 'commander';
import { getDefaultDirectory, setDefaultDirectory } from '../utils/api.js';
import { printSuccess, printInfo } from '../utils/output.js';

const config = new Command('config').description('Manage CLI configuration');

config
  .command('set-directory <id>')
  .description('Set the default directory ID (used when --directory is not specified)')
  .action((id) => {
    setDefaultDirectory(id);
    printSuccess(`Default directory set to ${id}`);
  });

config
  .command('get-directory')
  .description('Show the current default directory ID')
  .action(() => {
    const dir = getDefaultDirectory();
    if (dir) {
      printInfo(`Default directory: ${dir}`);
    } else {
      printInfo('No default directory set. Use: directify config set-directory <id>');
    }
  });

export default config;

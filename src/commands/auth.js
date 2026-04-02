import { Command } from 'commander';
import { setToken, clearToken, getToken, api } from '../utils/api.js';
import { printSuccess, printError, printInfo } from '../utils/output.js';
import ora from 'ora';

const auth = new Command('auth').description('Manage authentication');

auth
  .command('login <token>')
  .description('Authenticate with your Directify API token')
  .action(async (token) => {
    const spinner = ora('Verifying token...').start();
    try {
      setToken(token);
      const data = await api.get('/user');
      spinner.stop();
      printSuccess(`Authenticated as ${data.name} (${data.email})`);
    } catch (err) {
      clearToken();
      spinner.stop();
      printError(`Authentication failed: ${err.message}`);
      process.exit(1);
    }
  });

auth
  .command('logout')
  .description('Remove stored authentication token')
  .action(() => {
    clearToken();
    printSuccess('Logged out successfully.');
  });

auth
  .command('status')
  .description('Check current authentication status')
  .action(async () => {
    const token = getToken();
    if (!token) {
      printInfo('Not authenticated. Run: directify auth login <token>');
      return;
    }
    const spinner = ora('Checking...').start();
    try {
      const data = await api.get('/user');
      spinner.stop();
      printSuccess(`Authenticated as ${data.name} (${data.email})`);
    } catch (err) {
      spinner.stop();
      printError(`Token invalid: ${err.message}`);
    }
  });

export default auth;

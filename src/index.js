#!/usr/bin/env node

import { Command } from 'commander';
import auth from './commands/auth.js';
import config from './commands/config.js';
import directories from './commands/directories.js';
import categories from './commands/categories.js';
import tags from './commands/tags.js';
import fields from './commands/fields.js';
import listings from './commands/listings.js';
import articles from './commands/articles.js';
import pages from './commands/pages.js';
import organizers from './commands/organizers.js';
import languages from './commands/languages.js';

const program = new Command();

program
  .name('directify')
  .description('Official CLI for Directify - manage your directory websites from the command line.')
  .version('1.6.0');

program.addCommand(auth);
program.addCommand(config);
program.addCommand(directories);
program.addCommand(languages);
program.addCommand(categories);
program.addCommand(tags);
program.addCommand(fields);
program.addCommand(listings);
program.addCommand(articles);
program.addCommand(pages);
program.addCommand(organizers);

program.parse();

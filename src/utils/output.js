import chalk from 'chalk';

export function printJson(data) {
  console.log(JSON.stringify(data, null, 2));
}

export function printTable(items, columns) {
  if (!items || items.length === 0) {
    console.log(chalk.dim('  No results found.'));
    return;
  }

  // Calculate column widths
  const widths = {};
  for (const col of columns) {
    const key = col.key || col;
    const label = col.label || key;
    widths[key] = Math.max(label.length, ...items.map((item) => String(getValue(item, key) ?? '').length));
    widths[key] = Math.min(widths[key], col.maxWidth || 50);
  }

  // Header
  const header = columns
    .map((col) => {
      const label = col.label || col.key || col;
      const key = col.key || col;
      return label.toUpperCase().padEnd(widths[key]);
    })
    .join('  ');
  console.log(chalk.bold(header));
  console.log(chalk.dim('-'.repeat(header.length)));

  // Rows
  for (const item of items) {
    const row = columns
      .map((col) => {
        const key = col.key || col;
        let val = String(getValue(item, key) ?? '');
        if (val.length > (col.maxWidth || 50)) {
          val = val.slice(0, (col.maxWidth || 50) - 3) + '...';
        }
        return val.padEnd(widths[key]);
      })
      .join('  ');
    console.log(row);
  }

  console.log(chalk.dim(`\n${items.length} item(s)`));
}

function getValue(obj, path) {
  return path.split('.').reduce((o, k) => (o ? o[k] : undefined), obj);
}

export function printSuccess(message) {
  console.log(chalk.green(`\u2713 ${message}`));
}

export function printError(message) {
  console.error(chalk.red(`\u2717 ${message}`));
}

export function printInfo(message) {
  console.log(chalk.blue(`\u2139 ${message}`));
}

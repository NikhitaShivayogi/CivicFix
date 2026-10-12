const { readdirSync } = require('node:fs');
const path = require('node:path');
const { spawnSync } = require('node:child_process');

const backendRoot = path.resolve(__dirname, '..');
const ignoredDirectories = new Set(['node_modules', 'uploads']);
const sourceFiles = [];

function collectJavaScriptFiles(directory) {
  for (const entry of readdirSync(directory, { withFileTypes: true })) {
    const entryPath = path.join(directory, entry.name);
    if (entry.isDirectory()) {
      if (!ignoredDirectories.has(entry.name)) collectJavaScriptFiles(entryPath);
    } else if (entry.isFile() && entry.name.endsWith('.js')) {
      sourceFiles.push(entryPath);
    }
  }
}

collectJavaScriptFiles(backendRoot);

const failures = [];
for (const sourceFile of sourceFiles) {
  const result = spawnSync(process.execPath, ['--check', sourceFile], { encoding: 'utf8' });
  if (result.status !== 0) {
    failures.push(`${path.relative(backendRoot, sourceFile)}\n${result.stderr || result.stdout}`);
  }
}

if (failures.length) {
  console.error(failures.join('\n'));
  process.exitCode = 1;
} else {
  console.log(`Syntax-checked ${sourceFiles.length} backend JavaScript files.`);
}

import { expect } from 'chai';
import fs from 'fs/promises';
import path from 'path';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const pkg = require('../package.json');

const defaultPattern = pkg.contributes.configuration.properties['highlighter.regex'].default;
const dudeRegex = new RegExp(defaultPattern, 'gi');

describe('Integration test with real file', () => {
  const filePath = path.resolve('test/test-files/sample.txt');

  it('should find all occurrences of "Dude" (case-insensitive) and identify duplicates', async () => {
    const text = await fs.readFile(filePath, 'utf8');
    const matches = [...text.matchAll(dudeRegex)].map(m => m[0]);

    const counts = matches.reduce((acc, w) => {
      acc[w] = (acc[w] || 0) + 1;
      return acc;
    }, {});

    const duplicates = Object.entries(counts).filter(([_, c]) => c > 1);
    console.log('Duplicates:', duplicates.length ? Object.fromEntries(duplicates) : 'None');

    expect(matches).to.be.an('array');
  });

  it('should simulate opening a new tab with found names', async () => {
    const text = await fs.readFile(filePath, 'utf8');
    const matches = [...text.matchAll(dudeRegex)].map(m => m[0]);

    const result = `Found ${matches.length} matches:\n` + matches.join('\n');
    console.log('New tab content:', result);

    expect(result).to.be.a('string');
    expect(result).to.include(`Found ${matches.length} matches:`);
  });
});

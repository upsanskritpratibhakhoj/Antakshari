import XLSX from 'xlsx';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Read the Excel file
const workbook = XLSX.readFile(path.join(__dirname, '..', 'sholka.xlsx'));
const sheetName = workbook.SheetNames[0];
const worksheet = workbook.Sheets[sheetName];

// Convert to JSON
const data = XLSX.utils.sheet_to_json(worksheet, { header: ['shloka', 'nextChar'] });

// Skip header row if present and process the data
const shlokas = data
  .slice(1) // Skip header row
  .filter(row => row.shloka && row.nextChar) // Filter valid rows
  .map(row => ({
    text: String(row.shloka).trim(),
    nextChar: String(row.nextChar).trim()
  }));

console.log(`Extracted ${shlokas.length} shlokas from Excel file`);

// Preview first few entries
console.log('\nFirst 3 entries:');
shlokas.slice(0, 3).forEach((s, i) => {
  console.log(`${i + 1}. Shloka: ${s.text.substring(0, 50)}...`);
  console.log(`   Next Char: ${s.nextChar}`);
});

// Write to JSON file
const outputPath = path.join(__dirname, '..', 'data', 'shlokaDatabase.json');

// Create data directory if it doesn't exist
const dataDir = path.join(__dirname, '..', 'data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

fs.writeFileSync(outputPath, JSON.stringify(shlokas, null, 2), 'utf-8');
console.log(`\nSaved to: ${outputPath}`);

// Also create a TypeScript-friendly version that can be imported
const tsOutput = `// Auto-generated shloka database
// Generated on: ${new Date().toISOString()}
// Total shlokas: ${shlokas.length}

export interface ShlokaEntry {
  text: string;
  nextChar: string;
}

export const SHLOKA_DATABASE: ShlokaEntry[] = ${JSON.stringify(shlokas, null, 2)};
`;

const tsOutputPath = path.join(__dirname, '..', 'data', 'shlokaDatabase.ts');
fs.writeFileSync(tsOutputPath, tsOutput, 'utf-8');
console.log(`Saved TypeScript version to: ${tsOutputPath}`);

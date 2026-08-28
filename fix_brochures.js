const fs = require('fs');
let content = fs.readFileSync('app/actions/brochures.ts', 'utf8');
content = content.replace('export async function createBrochure(data: { nombre: string, file_url: string }) {', 'export async function createBrochure(data: { nombre: string, file_url: string, file_base64?: string }) {');
content = content.replace('file_url: data.file_url,', 'file_url: data.file_url,\n      file_base64: data.file_base64,');
fs.writeFileSync('app/actions/brochures.ts', content);
console.log('Modified actions');


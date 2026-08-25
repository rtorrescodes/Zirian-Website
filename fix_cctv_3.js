const fs = require('fs');
let lines = fs.readFileSync('app/actions/cctvToQuote.ts', 'utf-8').split('\n');

const modelNamesStr = `
const modelNames: Record<string, string> = {
  'cam-2.8mm': 'Domo 2MP Lente 2.8mm',
  'cam-4mm': 'Bala 4MP Lente 4mm',
  'cam-ptz': 'PTZ 25x',
  'cam-ezviz-cscb54k': 'EZVIZ Solar 4K',
  'wifi-ubiquiti-u6': 'Ubiquiti U6-Mesh',
  'wifi-ruijie-rgrap': 'Ruijie RGRAP52ODSEC',
  'wifi-ruijie-rgrap6260g': 'Ruijie RGRAP6260(G)',
  'wifi-tplink-bridge': 'TP-Link Bridge 5km'
};
`;

let content = fs.readFileSync('app/actions/cctvToQuote.ts', 'utf-8');

// Remove existing declarations
content = content.replace(/const modelNames: Record<string, string> = \{[\s\S]*?\};/g, "");

// Add it to the top after imports
const importEnd = content.indexOf('export async function');
content = content.substring(0, importEnd) + modelNamesStr + '\n' + content.substring(importEnd);

fs.writeFileSync('app/actions/cctvToQuote.ts', content, 'utf-8');

const fs = require('fs');
const searchKeywordsStr = `
const searchKeywords: Record<string, string> = {
  'cam-2.8mm': '2.8mm',
  'cam-4mm': '4mm',
  'cam-ptz': 'PTZ',
  'cam-ezviz-cscb54k': '4K Wi-Fi',
  'wifi-ubiquiti-u6': 'U6-Mesh',
  'wifi-ruijie-rgrap': 'RGRAP52ODSEC',
  'wifi-ruijie-rgrap6260g': 'RGRAP6260',
  'wifi-tplink-bridge': 'EAP215'
};
`;

let content = fs.readFileSync('app/actions/cctvToQuote.ts', 'utf-8');
content = content.replace(/const searchKeywords: Record<string, string> = \{[\s\S]*?\};\r?\n/g, "");

const importEnd = content.indexOf('export async function');
content = content.substring(0, importEnd) + searchKeywordsStr + '\n' + content.substring(importEnd);

fs.writeFileSync('app/actions/cctvToQuote.ts', content, 'utf-8');

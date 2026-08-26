const fs = require('fs');
let c = fs.readFileSync('lib/pdf/BaseQuotePdf.tsx', 'utf-8');

c = c.replace(
  /<View key=\{`sec-\$\{idx\}`\} style=\{\{ backgroundColor: '#e2e8f0', padding: '3px 12px', borderBottom: '1px solid #cbd5e1' \}\}>/g,
  "<View key={`sec-${idx}`} style={{ backgroundColor: '#e2e8f0', padding: '3px 12px', borderBottom: '1px solid #cbd5e1' }} wrap={false}>"
);

c = c.replace(
  /<View key=\{idx\} style=\{\[styles\.tableRow, idx % 2 === 0 \? styles\.tableRowAlt : \{\}\]\}>/g,
  "<View key={idx} style={[styles.tableRow, idx % 2 === 0 ? styles.tableRowAlt : {}]} wrap={false}>"
);

fs.writeFileSync('lib/pdf/BaseQuotePdf.tsx', c, 'utf-8');
console.log('Success');

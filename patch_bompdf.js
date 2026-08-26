const fs = require('fs');
let c = fs.readFileSync('lib/pdf/BomPdf.tsx', 'utf-8');

c = c.replace(
  /<View key=\{idx\} style=\{styles\.tableRow\}>/g,
  "<View key={idx} style={styles.tableRow} wrap={false}>"
);

fs.writeFileSync('lib/pdf/BomPdf.tsx', c, 'utf-8');
console.log('Success');

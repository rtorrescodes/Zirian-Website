const fs = require('fs');
let c = fs.readFileSync('lib/pdf/BaseQuotePdf.tsx', 'utf-8');

// Fix "1 LOTE" to 1
c = c.replace(/qty: "1 LOTE",/g, "qty: 1,");

// Add wrap={false} to totalsWrapper
c = c.replace(
  /<View style=\{styles\.totalsWrapper\}>/,
  "<View style={styles.totalsWrapper} wrap={false}>"
);

fs.writeFileSync('lib/pdf/BaseQuotePdf.tsx', c, 'utf-8');
console.log('Success');

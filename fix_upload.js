const fs = require('fs');
let content = fs.readFileSync('app/api/upload/route.ts', 'utf8');
content = content.replace('return NextResponse.json({ url: fileUrl });', 'return NextResponse.json({ url: fileUrl, base64: buffer.toString(\'base64\') });');
fs.writeFileSync('app/api/upload/route.ts', content);
console.log('Modified api/upload');


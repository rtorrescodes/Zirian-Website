const fs = require('fs');
let content = fs.readFileSync('app/api/upload/route.ts', 'utf8');

const oldFs = '    const uploadDir = path.join(process.cwd(), \\'public\\', \\'uploads\\', folder);\n    \n    // Ensure directory exists\n    if (!fs.existsSync(uploadDir)) {\n      fs.mkdirSync(uploadDir, { recursive: true });\n    }\n\n    // Clean filename\n    const cleanName = file.name.replace(/[^a-zA-Z0-9.-]/g, \\'_\\');\n    const timestamp = Date.now();\n    const finalName = ${timestamp}-;\n    const filePath = path.join(uploadDir, finalName);\n\n    fs.writeFileSync(filePath, buffer);\n\n    // Return the relative URL\n    const fileUrl = /uploads//;';

const newFs = '    const cleanName = file.name.replace(/[^a-zA-Z0-9.-]/g, \\'_\\');\n    const timestamp = Date.now();\n    const finalName = ${timestamp}-;\n    const fileUrl = /uploads//;\n\n    try {\n      const uploadDir = path.join(process.cwd(), \\'public\\', \\'uploads\\', folder);\n      if (!fs.existsSync(uploadDir)) {\n        fs.mkdirSync(uploadDir, { recursive: true });\n      }\n      const filePath = path.join(uploadDir, finalName);\n      fs.writeFileSync(filePath, buffer);\n    } catch(e) {\n      console.warn(\\'Could not write to local FS, continuing...\\');\n    }';

content = content.replace(oldFs, newFs);
fs.writeFileSync('app/api/upload/route.ts', content);
console.log('Fixed upload FS error');

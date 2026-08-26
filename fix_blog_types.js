const fs = require('fs');
let c = fs.readFileSync('app/actions/blog.ts', 'utf-8');

c = c.replace(/template\?: string \| null/g, "template?: string");

// If they pass null anyway at runtime, ensure it becomes undefined
c = c.replace(
  "    const post = await prisma.post.create({\n      data: {\n        ...data,\n        slug,\n        publishedAt: data.status === 'Published' ? new Date() : null\n      }\n    });",
  "    const { template, ...rest } = data;\n    const post = await prisma.post.create({\n      data: {\n        ...rest,\n        ...(template ? { template } : {}),\n        slug,\n        publishedAt: data.status === 'Published' ? new Date() : null\n      }\n    });"
);

c = c.replace(
  "    const post = await prisma.post.update({\n      where: { id },\n      data: {\n        ...data,\n        slug,\n        publishedAt: newPublishedAt\n      }\n    });",
  "    const { template, ...rest } = data;\n    const post = await prisma.post.update({\n      where: { id },\n      data: {\n        ...rest,\n        ...(template ? { template } : {}),\n        slug,\n        publishedAt: newPublishedAt\n      }\n    });"
);

fs.writeFileSync('app/actions/blog.ts', c, 'utf-8');

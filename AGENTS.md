<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# Next.js and Prisma Decimal Serialization

## Problem
In Next.js App Router (versions 13+), Server Components and Server Actions frequently throw the following error when passing Prisma `Decimal` objects to Client Components (`'use client'`):
`Only plain objects can be passed to Client Components from Server Components. Decimal objects are not supported.`

This happens because Prisma represents Decimal fields as instances of `Decimal.js` (an object prototype), which Next.js's JSON serialization boundary cannot safely stringify and pass to the client.

## Rule: ALWAYS Serialize Prisma Decimals
Whenever you query a Prisma model that contains `Decimal` fields in a Server Component or Server Action AND that object will be passed to a Client Component, **you MUST explicitly map all `Decimal` fields to standard JavaScript `Number` types** before returning or passing the object.

### Implementation Pattern
Create a serialization helper in your actions file (e.g., `serializeQuote`, `serializeProduct`) and run your Prisma results through it:

```typescript
function serializeModel(obj: any) {
  if (!obj) return obj;
  return {
    ...obj,
    precio: obj.precio ? Number(obj.precio) : 0,
    costo: obj.costo ? Number(obj.costo) : 0,
    // Do not forget nested objects!
    items: obj.items ? obj.items.map((item: any) => ({
      ...item,
      cantidad: item.cantidad ? Number(item.cantidad) : 0,
    })) : undefined
  };
}
```

### Important Watchouts
1. **Nested Arrays and Objects**: If your `include` block pulls in related models (e.g. `items` inside `quote`, or `product` inside `quote.items`), you MUST serialize the Decimals inside those nested relationships as well.
2. **React-PDF**: `@react-pdf/renderer` will also crash if you pass Prisma Decimal objects to it (`TypeError: Cannot read properties of null (reading 'props')`). You must serialize the Prisma objects before passing them to the `<Document>` component.
3. **Do not use `JSON.parse(JSON.stringify(obj))`** as it will drop `Date` objects and convert `Decimal` objects into strange strings instead of numbers. Always map manually.

const fs = require('fs');
let c = fs.readFileSync('components/cotizador/quote-cart.tsx', 'utf-8');

c = c.replace(
  "import React, { useRef } from 'react';",
  "import { useRef, useState } from 'react';"
);

c = c.replace(/React\.useState/g, "useState");

fs.writeFileSync('components/cotizador/quote-cart.tsx', c, 'utf-8');

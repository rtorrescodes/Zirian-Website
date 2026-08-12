import { searchSyscomProducts } from './lib/syscom'; searchSyscomProducts('aufit').then(r => console.log('Found AUFIT:', r.length)).catch(console.error);

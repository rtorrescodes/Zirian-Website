import { searchSyscomProducts } from './lib/syscom'; searchSyscomProducts('ecoflow').then(r => console.log('Found:', r.length)).catch(console.error);

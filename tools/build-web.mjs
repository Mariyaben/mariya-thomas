import { cp, mkdir } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
const root=new URL('../',import.meta.url);
await mkdir(new URL('public/',root),{recursive:true});
await cp(new URL('app/src/main/assets/',root),new URL('public/',root),{recursive:true});
await mkdir(new URL('public/downloads/',root),{recursive:true});
await cp(new URL('downloads/Mariya-and-Thomas.apk',root),new URL('public/downloads/Mariya-and-Thomas.apk',root));
console.log('Web app built at '+fileURLToPath(new URL('public/',root)));

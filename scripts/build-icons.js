import {readFileSync,readdirSync,mkdirSync,writeFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {fileURLToPath} from 'node:url';
import {join} from 'node:path';

// Original SVG sources exported alongside the approved Figma icon library.
const root=fileURLToPath(new URL('../',import.meta.url)),source=join(root,'assets/icons');
const files=readdirSync(source).filter(name=>/^se-[a-z-]+\.svg$/.test(name)).sort();
const names=[],symbols=[];
for(const file of files){
 const svg=readFileSync(join(source,file),'utf8');
 if(!svg.includes('viewBox="0 0 24 24"')||/<script|<foreignObject|\bon\w+=/i.test(svg))throw new Error('Invalid icon source: '+file);
 const name=file.slice(3,-4),body=svg.replace(/^\s*<svg\b[^>]*>/,'').replace(/<\/svg>\s*$/,'').replaceAll('#0068B7','currentColor');
 names.push(name);symbols.push(`<symbol id="se-${name}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.65" stroke-linecap="round" stroke-linejoin="round">${body}</symbol>`);
}
const sprite=`<svg xmlns="http://www.w3.org/2000/svg">\n${symbols.join('\n')}\n</svg>\n`,version=createHash('sha256').update(sprite).digest('hex').slice(0,12);
mkdirSync(join(root,'public/icons'),{recursive:true});writeFileSync(join(root,'public/icons/se-icons.svg'),sprite);
// Template-only integration lets the development launcher pick up artwork
// without restarting server-side JavaScript or changing application records.
writeFileSync(join(root,'views/partials/icon-sprite.ejs'),`/icons/se-icons.svg?v=${version}`);
writeFileSync(join(root,'views/partials/icon.ejs'),`<% const chosenName=${JSON.stringify(names)}.includes(name)?name:'catalogue';const chosenSize=typeof size==='string'&&['small','large'].includes(size)?' se-icon--'+size:''; %><svg class="se-icon<%= chosenSize %>" width="24" height="24" aria-hidden="true" focusable="false"><use href="/icons/se-icons.svg?v=${version}#se-<%= chosenName %>"></use></svg>`);
console.log(`Built ${names.length} original icons; sprite ${Buffer.byteLength(sprite)} bytes; version ${version}.`);

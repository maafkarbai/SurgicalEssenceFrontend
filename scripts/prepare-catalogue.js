import {readFileSync,lstatSync,mkdirSync,writeFileSync,realpathSync} from 'node:fs';
import {resolve,join,relative,isAbsolute,dirname,basename,sep} from 'node:path';
import {prepareCatalogue} from '../src/catalogue-staging.js';
import {IMPORT_LIMITS,scanZip,digest} from '../src/cms/import-utils.js';

try{
 const args=process.argv.slice(2),options={};
 for(let i=0;i<args.length;i++){
  const key=args[i];if(key==='--check'){options.check=true;continue;}
  if(!['--source-dir','--output-dir'].includes(key)||!args[i+1]||args[i+1].startsWith('--')||options[key])throw new Error('Usage: node scripts/prepare-catalogue.js --source-dir DIR [--output-dir NEW_DIR] [--check]');
  options[key]=args[++i];
 }
 if(!options['--source-dir']||!options.check&&!options['--output-dir'])throw new Error('Provide --source-dir and a fresh --output-dir, or use --check.');
 const input=realpathSync(resolve(options['--source-dir'])),requested=options['--output-dir']?resolve(options['--output-dir']):null;
 const output=requested?resolve(realpathSync(dirname(requested)),basename(requested)):null;
 if(output){const rel=relative(input,output);if(!rel||rel!=='..'&&!rel.startsWith('..'+sep)&&!isAbsolute(rel))throw new Error('Output must be outside the original source package.');}
 const files={},hashes={};
 for(const name of ['all-products-import.csv','product-sources.csv','review-needed.csv','page-coverage.csv','all-products-images.zip']){
  const path=join(input,name),limit=name.endsWith('.zip')?IMPORT_LIMITS.zipBytes:IMPORT_LIMITS.csvBytes;
  if(!lstatSync(path).isFile()||lstatSync(path).size>limit)throw new Error(`Invalid or oversized package file: ${name}`);
  files[name]=readFileSync(path);hashes[name]={bytes:files[name].length,sha256:digest(files[name])};
 }
 const imageEntries=await scanZip(files['all-products-images.zip'],{onEntry:(entry,bytes)=>{entry.sha256=digest(bytes);}});
 const prepared=prepareCatalogue({products:files['all-products-import.csv'],sources:files['product-sources.csv'],reviews:files['review-needed.csv'],coverage:files['page-coverage.csv'],imageEntries});
 prepared.report.inputs=hashes;
 if(!options.check){
  // Exclusive fresh directory + completion report last: no source or previous result is overwritten.
  mkdirSync(output);mkdirSync(join(output,'imports'));
  for(const file of prepared.files)writeFileSync(join(output,file.path),file.content,{flag:'wx'});
  writeFileSync(join(output,'withheld.csv'),prepared.withheldCsv,{flag:'wx'});
  writeFileSync(join(output,'provenance.json'),JSON.stringify(prepared.provenance,null,2)+'\n',{flag:'wx'});
  writeFileSync(join(output,'README.md'),'# Unreviewed catalogue staging\n\nImport only files inside imports/ through the existing authenticated CMS wizard in Add New mode. Use the original all-products-images.zip. All output products are drafts; no source approval is granted. Review withheld.csv and provenance.json privately; they are evidence/report files, not import files. report.json is written last and marks a complete run. These import files preserve exact source text: use the CMS preview, not spreadsheet execution, to inspect them.\n',{flag:'wx'});
  writeFileSync(join(output,'report.json'),JSON.stringify(prepared.report,null,2)+'\n',{flag:'wx'});
 }
 console.log(JSON.stringify({...prepared.report.counts,importFiles:prepared.files.length,checkOnly:Boolean(options.check)},null,2));
}catch(error){console.error('Catalogue staging failed: '+error.message);process.exitCode=1;}

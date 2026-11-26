const NAMESPACE='http://www.sitemaps.org/schemas/sitemap/0.9';
const DECLARATION='<?xml version="1.0" encoding="UTF-8"?>';
const CHUNK_SIZE=10000;
const PRIVATE_PATHS=new Set(['/quote-list','/request-quote']);
const privatePath=path=>PRIVATE_PATHS.has(path.split('?')[0].toLowerCase())||/^\/(?:admin|internal|account|my-account|newsletter)(?:[/?]|$)/i.test(path);
const xml=value=>String(value).replace(/[<>&"']/g,char=>({'<':'&lt;','>':'&gt;','&':'&amp;','"':'&quot;',"'":'&apos;'}[char]));
function modified(value){
 const timestamp=typeof value==='number'?value:Date.parse(value);
 return Number.isFinite(timestamp)&&timestamp>0&&timestamp<=Date.now()?new Date(timestamp).toISOString():null;
}
function urlset(entries){return DECLARATION+`<urlset xmlns="${NAMESPACE}">`+entries.map(entry=>`<url><loc>${xml(entry.url)}</loc>${modified(entry.updatedAt)?`<lastmod>${modified(entry.updatedAt)}</lastmod>`:''}</url>`).join('')+'</urlset>';}

export function createSeo({cms,siteUrl,publicPaths,extraEntries=async()=>[],env=process.env}){
 const preview=Boolean(env.VERCEL_ENV&&env.VERCEL_ENV!=='production');
 function middleware(req,res,next){
  res.locals.previewNoindex=preview;
  const writeHead=res.writeHead;
  res.writeHead=function(...args){
   if(preview||this.statusCode>=400||privatePath(req.path))this.setHeader('X-Robots-Tag','noindex, follow');
   return writeHead.apply(this,args);
  };
  next();
 }
 async function inventory(){
  const [categories,products,summary]=await Promise.all([cms.categories(),cms.products({light:true,limit:1}),cms.catalogueSummary()]);
  const entries=[...new Set(publicPaths.filter(path=>!privatePath(path)))].map(path=>({url:siteUrl+path}));
  for(const category of categories.filter(category=>summary.categoryCounts[category.slug]>0))entries.push({url:siteUrl+'/products?category='+encodeURIComponent(category.slug)});
  const seen=new Set(entries.map(entry=>entry.url));
  for(const entry of await extraEntries()){
   if((!entry.status||entry.status==='published')&&typeof entry.path==='string'&&entry.path.startsWith('/')&&!entry.path.startsWith('//')&&!privatePath(entry.path)&&!seen.has(siteUrl+entry.path)){entries.push({url:siteUrl+entry.path,updatedAt:entry.updatedAt});seen.add(siteUrl+entry.path);}
  }
  return {entries,total:entries.length+products.total};
 }
 async function chunk(entries,total,index){
  const start=index*CHUNK_SIZE,end=Math.min(start+CHUNK_SIZE,total),result=entries.slice(start,end);
  const productStart=Math.max(0,start-entries.length),productEnd=Math.max(0,end-entries.length);
  // Fetch only the one or two database pages intersecting this sitemap shard.
  if(productEnd>productStart){
   const first=Math.floor(productStart/CHUNK_SIZE),last=Math.floor((productEnd-1)/CHUNK_SIZE);
   for(let page=first;page<=last;page++){
    const batch=await cms.products({light:true,limit:CHUNK_SIZE,page:page+1});
    const from=Math.max(0,productStart-page*CHUNK_SIZE),to=Math.min(CHUNK_SIZE,productEnd-page*CHUNK_SIZE);
    result.push(...batch.items.slice(from,to).map(product=>({url:siteUrl+'/products/'+encodeURIComponent(product.slug),updatedAt:product.updatedAt})));
   }
  }
  return urlset(result);
 }
 async function sitemap(req,res){
  const {entries,total}=await inventory();
  if(total<=CHUNK_SIZE)return res.type('application/xml').send(await chunk(entries,total,0));
  const count=Math.ceil(total/CHUNK_SIZE);
  res.type('application/xml').send(DECLARATION+`<sitemapindex xmlns="${NAMESPACE}">`+Array.from({length:count},(_,index)=>`<sitemap><loc>${xml(siteUrl+'/sitemaps/'+(index+1)+'.xml')}</loc></sitemap>`).join('')+'</sitemapindex>');
 }
 async function shard(req,res){
  const {entries,total}=await inventory(),number=Number(req.params.number);
  if(!/^[1-9]\d*$/.test(req.params.number)||number>Math.ceil(total/CHUNK_SIZE))return res.status(404).type('text/plain').send('Sitemap not found.');
  res.type('application/xml').send(await chunk(entries,total,number-1));
 }
 function robots(req,res){res.type('text/plain').send(`User-agent: *\nAllow: /\nDisallow: /admin/\nDisallow: /internal/\nSitemap: ${siteUrl}/sitemap.xml\n`);}
 return {middleware,sitemap,shard,robots,preview};
}

export function listingMetadata({siteUrl,category,q,type,page,result,selectedCategory}){
 const params=new URLSearchParams();
 if(q)params.set('q',q);if(category)params.set('category',selectedCategory?.slug||category);if(type)params.set('type',type);
 const pageUrl=number=>{const copy=new URLSearchParams(params);if(number>1)copy.set('page',String(number));return '/products'+(copy.size?'?'+copy:'');};
 const suffix=page>1?` | Page ${page}`:'';
 const metadata={pageUrl,canonical:siteUrl+pageUrl(page),noindex:Boolean(q||type||result.total===0)};
 if(selectedCategory)Object.assign(metadata,{label:selectedCategory.name,title:`${selectedCategory.seoTitle||selectedCategory.name+' Catalogue'}${suffix} | Surgical Essence`,description:selectedCategory.metaDescription||`Browse ${selectedCategory.name} from Surgical Essence. Review catalogue references and request a business quotation for your sourcing requirements.`});
 else if(page>1)metadata.title=`Surgical Instrument Catalogue${suffix} | Surgical Essence`;
 return metadata;
}

import {z} from 'zod';
import {products} from './catalogue.js';
const text=(max)=>z.string().trim().max(max);
export const buyerTypes=['Distributor','Importer / wholesaler','OEM / private-label brand','Procurement manager','Sourcing company','Other business'];
const schema=z.object({
 name:text(120).min(2,'Enter your full name.'),company:text(180).min(2,'Enter your company name.'),
 email:text(254).email('Enter a valid business email.'),country:text(100).min(2,'Enter your country.'),
 buyerType:z.enum(buyerTypes,{error:'Select your buyer type.'}),products:text(5000).default(''),quantities:text(1000).default(''),
 oem:text(3000).default(''),message:text(8000).default(''),website:text(0).default(''),
 requestId:z.uuid().optional(),items:z.array(z.object({code:z.string().refine(c=>products.some(p=>p.code===c),'Unknown instrument.'),quantity:z.number().int().min(1).max(1000000).nullable()})).max(50).default([])
}).superRefine((v,ctx)=>{if(!v.products && !v.items.length) ctx.addIssue({code:'custom',path:['products'],message:'Enter product names or reference numbers, or add an instrument to your quote list.'});});
export function validateRfq(body) {
 let items=[];
 try { items=typeof body.items==='string'?JSON.parse(body.items||'[]'):(body.items||[]); } catch { return {errors:{items:'Your quote list could not be read. Review the list and try again.'}}; }
 const result=schema.safeParse({...body,items});
 if(!result.success) return {errors:Object.fromEntries(result.error.issues.map(i=>[i.path[0],i.message]))};
 if(new Set(result.data.items.map(i=>i.code)).size!==result.data.items.length) return {errors:{items:'Remove duplicate instruments from your quote list.'}};
 return {data:result.data};
}

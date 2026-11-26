import {createHash} from 'node:crypto';

function invalid(message){throw Object.assign(new Error(message),{code:'VALIDATION',status:400});}
function stable(value){return Array.isArray(value)?value.map(stable):value&&typeof value==='object'?Object.fromEntries(Object.keys(value).sort().map(k=>[k,stable(value[k])])):value;}
export function sourceFingerprint(product){
 const fields=['code','name','categoryId','type','length','pattern','shortDescription','description','specifications','material','variations','notes','page','alt','sourceDocument','sourcePage','imageEvidence','reviewNotes'];
 const facts=Object.fromEntries(fields.map(k=>[k,product[k]??'']));
 facts.images=(product.images||[]).map(i=>({url:i.url,smallUrl:i.smallUrl,mediumUrl:i.mediumUrl,alt:i.alt}));
 return createHash('sha256').update(JSON.stringify(stable(facts))).digest('hex');
}
export function isSourceReviewed(product){
 const review=product.verification;
 return review?.status==='verified'&&Boolean(review.reviewedBy)&&Number.isSafeInteger(review.reviewedAt)&&review.fingerprint===sourceFingerprint(product);
}
export function assertSourceReviewed(product){if(!isSourceReviewed(product))invalid('Review the product source evidence before publishing. Save as draft to make unreviewed changes.');}
export function sourceReview(product,previous,action,actor){
 if(!['keep','verify','revoke'].includes(action))invalid('Choose a valid source review action.');
 if(action==='verify'){
  if(typeof actor!=='string'||!actor.trim())invalid('A source reviewer is required.');
  if(!product.sourceDocument||!product.sourcePage||!product.imageEvidence||!product.reviewNotes)invalid('Source document, page, image evidence and review notes are required for source review.');
  if(!product.images?.length)invalid('Add a source-matched product image before recording source review.');
  return {status:'verified',reviewedBy:actor,reviewedAt:Date.now(),fingerprint:sourceFingerprint(product)};
 }
 return action==='keep'&&isSourceReviewed({...product,verification:previous})?previous:{status:'unreviewed'};
}

export const categories = [
 {id:'surgical',name:'Surgical instruments',description:'Scalpel handles, scissors and general surgical instrumentation.',image:'surgical',pdf:'surgical.pdf',pages:307},
 {id:'dental',name:'Dental instruments',description:'Explore the supplied dental instrument catalogue.',image:'dental',pdf:'dental.pdf',pages:193},
 {id:'ophthalmic',name:'Ophthalmic instruments',description:'A dedicated catalogue for ophthalmic instrument sourcing.',image:'ophthalmic',pdf:'Ophthalmic.pdf',pages:52},
 {id:'beauty',name:'Beauty & personal care',description:'Instruments for professional beauty and personal care supply.',image:'beauty',pdf:'beauty.pdf',pages:40},
 {id:'single-use',name:'Single-use instruments',description:'Discuss single-use requirements using our supplied catalogue.',image:null,pdf:'singleuse.pdf',pages:34}
];
export const products = [
 ['003-004-00','Scalpel handle No. 4','Scalpel handles','13.5 cm',5,'No. 4'],
 ['003-004-01','Scalpel handle No. 4L','Scalpel handles','21.0 cm',5,'No. 4L'],
 ['003-008-00','Scalpel handle No. 8','Scalpel handles','13.5 cm',5,'No. 8'],
 ['003-009-00','Scalpel handle No. 9','Scalpel handles','14.5 cm',5,'No. 9'],
 ['010-070-13','Grazil dissecting scissors','Scissors','13.0 cm',18,'010-070'],
 ['010-071-13','Grazil dissecting scissors','Scissors','13.0 cm',18,'010-071'],
 ['010-072-13','Grazil dissecting scissors','Scissors','13.0 cm',18,'010-072'],
 ['010-073-13','Grazil dissecting scissors','Scissors','13.0 cm',18,'010-073']
].map(([code,name,type,length,page,pattern])=>({code,name,type,length,page,pattern,category:'surgical',image:`/images/optimized/${code}.webp`}));
export function searchProducts(query='',category='',type='') {
 const terms=query.toLowerCase().trim().split(/\s+/);
 return products.filter(p=>(!category||p.category===category)&&(!type||p.type===type)&&terms.every(t=>`${p.name} ${p.code} ${p.type} ${p.pattern}`.toLowerCase().includes(t)));
}

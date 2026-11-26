// All users of one SQLite connection share the CMS queue, so asynchronous
// operations cannot accidentally join (or be rolled back with) another transaction.
export const databaseQueues=new WeakMap();
export function withDatabase(db,operation){
 const work=(databaseQueues.get(db)||Promise.resolve()).then(operation);
 databaseQueues.set(db,work.catch(()=>{}));
 return work;
}

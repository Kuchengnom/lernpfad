// Shared IndexedDB profile reader for browser specs (was copy-pasted 11x across 6 files).
export const readProfile = page => page.evaluate(() => new Promise((resolve, reject) => {
  const open = indexedDB.open('trailbook-local', 1);
  open.onerror = () => reject(open.error);
  open.onsuccess = () => {
    const db = open.result;
    const get = db.transaction('workspace').objectStore('workspace').get('current');
    get.onsuccess = () => { resolve(get.result); db.close(); };
    get.onerror = () => { reject(get.error); db.close(); };
  };
}));

// ponytail: legacy fallback lets pre-migration single-workspace records resolve the same way
// as current multi-book profiles (result.books.find(active).workspace).
export const readWorkspace = async page => {
  const result = await readProfile(page);
  return result?.profileVersion ? result.books.find(book => book.id === result.activeBookId).workspace : result;
};

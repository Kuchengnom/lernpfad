const DB_NAME = 'trailbook-local';
const STORE = 'workspace';

function openDatabase() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, 1);
    request.onupgradeneeded = () => request.result.createObjectStore(STORE);
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(new Error('Der lokale Speicher konnte nicht geöffnet werden. Bitte erlaube Browser-Speicher.'));
    request.onblocked = () => reject(new Error('Bitte schließe andere Lernpfad-Tabs und lade diese Seite neu.'));
  });
}

async function transact(mode, action) {
  const db = await openDatabase();
  try {
    return await new Promise((resolve, reject) => {
      const transaction = db.transaction(STORE, mode);
      const request = action(transaction.objectStore(STORE));
      transaction.oncomplete = () => resolve(request.result);
      transaction.onerror = () => reject(new Error('Speichern fehlgeschlagen. Bitte lade eine Sicherung herunter, bevor du diese Seite schließt.'));
      transaction.onabort = () => reject(new Error('Speichern wurde abgebrochen. Dein bisheriger Lernstand bleibt erhalten.'));
    });
  } finally { db.close(); }
}

// One record/transaction keeps course and progress consistent even on interruption.
export const loadWorkspace = () => transact('readonly', store => store.get('current'));
export const saveWorkspace = workspace => transact('readwrite', store => store.put(workspace, 'current'));

// Hold an origin-wide writer lock for this tab; other tabs stay read-only until reloaded.
export async function acquireWriter() {
  // A single-writer guarantee matters more than quietly losing progress on old browsers.
  if (!navigator.locks) throw new Error('Dieser Browser unterstützt die sichere Tab-Sperre nicht. Bitte verwende einen aktuellen Browser.');
  return new Promise(resolve => {
    navigator.locks.request('trailbook-writer', { ifAvailable: true }, lock => {
      resolve(Boolean(lock));
      if (lock) return new Promise(() => {});
    }).catch(() => resolve(false));
  });
}

/**
 * Utility for storing and retrieving CCTV offline map extracts and project states
 * using IndexedDB with fallback to LocalStorage.
 */

export interface OfflineMapExtract {
  id: string;
  name: string;
  timestamp: number;
  center: { lat: number; lng: number };
  zoom: number;
  bounds: {
    north: number;
    south: number;
    east: number;
    west: number;
  };
  imageDataUrl: string; // base64 satellite snapshot
  width: number;
  height: number;
  camerasCount?: number;
}

export interface OfflineProjectData {
  id?: number;
  nombre: string;
  clientId: string;
  mapState: any;
  lastUpdated: number;
  pendingSync: boolean;
}

const DB_NAME = 'zirian_cctv_offline_db';
const DB_VERSION = 1;
const STORE_EXTRACTS = 'map_extracts';
const STORE_PROJECTS = 'offline_projects';

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined' || !window.indexedDB) {
      reject(new Error('IndexedDB not supported'));
      return;
    }

    const req = window.indexedDB.open(DB_NAME, DB_VERSION);

    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(STORE_EXTRACTS)) {
        db.createObjectStore(STORE_EXTRACTS, { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains(STORE_PROJECTS)) {
        db.createObjectStore(STORE_PROJECTS, { keyPath: 'id' });
      }
    };

    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

// -------------------------------------------------------------
// Offline Map Extracts API
// -------------------------------------------------------------

export async function saveOfflineExtract(extract: OfflineMapExtract): Promise<void> {
  try {
    const db = await openDB();
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(STORE_EXTRACTS, 'readwrite');
      const store = tx.objectStore(STORE_EXTRACTS);
      const req = store.put(extract);
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });

    // Also remember the active extract ID in localStorage
    localStorage.setItem('cctv_active_offline_extract_id', extract.id);
  } catch (err) {
    console.warn('IndexedDB failed, attempting localStorage fallback for metadata', err);
    try {
      const { imageDataUrl, ...meta } = extract;
      localStorage.setItem(`cctv_offline_extract_meta_${extract.id}`, JSON.stringify(meta));
      localStorage.setItem('cctv_active_offline_extract_id', extract.id);
    } catch (e) {
      console.error('Failed to save in localStorage fallback', e);
    }
  }
}

export async function getOfflineExtract(id: string): Promise<OfflineMapExtract | null> {
  try {
    const db = await openDB();
    return await new Promise<OfflineMapExtract | null>((resolve, reject) => {
      const tx = db.transaction(STORE_EXTRACTS, 'readonly');
      const store = tx.objectStore(STORE_EXTRACTS);
      const req = store.get(id);
      req.onsuccess = () => resolve(req.result || null);
      req.onerror = () => reject(req.error);
    });
  } catch (err) {
    console.warn('Error reading from IndexedDB', err);
    return null;
  }
}

export async function getLatestOfflineExtract(): Promise<OfflineMapExtract | null> {
  const activeId = typeof window !== 'undefined' ? localStorage.getItem('cctv_active_offline_extract_id') : null;
  if (activeId) {
    const extract = await getOfflineExtract(activeId);
    if (extract) return extract;
  }

  const all = await listOfflineExtracts();
  if (all.length > 0) {
    return all[0];
  }
  return null;
}

export async function listOfflineExtracts(): Promise<OfflineMapExtract[]> {
  try {
    const db = await openDB();
    return await new Promise<OfflineMapExtract[]>((resolve, reject) => {
      const tx = db.transaction(STORE_EXTRACTS, 'readonly');
      const store = tx.objectStore(STORE_EXTRACTS);
      const req = store.getAll();
      req.onsuccess = () => {
        const list = (req.result || []) as OfflineMapExtract[];
        list.sort((a, b) => b.timestamp - a.timestamp);
        resolve(list);
      };
      req.onerror = () => reject(req.error);
    });
  } catch (err) {
    console.warn('Error listing extracts from IndexedDB', err);
    return [];
  }
}

export async function deleteOfflineExtract(id: string): Promise<void> {
  try {
    const db = await openDB();
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(STORE_EXTRACTS, 'readwrite');
      const store = tx.objectStore(STORE_EXTRACTS);
      const req = store.delete(id);
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
    if (localStorage.getItem('cctv_active_offline_extract_id') === id) {
      localStorage.removeItem('cctv_active_offline_extract_id');
    }
  } catch (err) {
    console.error('Error deleting offline extract', err);
  }
}

// -------------------------------------------------------------
// Offline Project Buffer API
// -------------------------------------------------------------

export function saveOfflineProjectBuffer(project: OfflineProjectData): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem('cctv_offline_project_buffer', JSON.stringify({
      ...project,
      lastUpdated: Date.now(),
      pendingSync: true
    }));
  } catch (e) {
    console.error('Error buffering offline project', e);
  }
}

export function getOfflineProjectBuffer(): OfflineProjectData | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem('cctv_offline_project_buffer');
    if (!raw) return null;
    return JSON.parse(raw);
  } catch (e) {
    return null;
  }
}

export function clearOfflineProjectBuffer(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem('cctv_offline_project_buffer');
}

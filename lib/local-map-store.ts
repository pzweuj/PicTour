import type { ImageSize, MapCoordinate } from "./types"

const DB_NAME = "pictour-local-data"
const DB_VERSION = 1
const STORE_NAME = "map-state"
const STATE_KEY = "current"

export interface SavedMapState {
  mapImage: string
  imageSize: ImageSize
  orientation: number
  scale: number
  referencePosition: MapCoordinate
  updatedAt: number
}

const canUseIndexedDB = () => typeof window !== "undefined" && "indexedDB" in window

function openDatabase(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (!canUseIndexedDB()) {
      reject(new Error("IndexedDB is not available."))
      return
    }

    const request = window.indexedDB.open(DB_NAME, DB_VERSION)

    request.onupgradeneeded = () => {
      const db = request.result
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME)
      }
    }

    request.onsuccess = () => resolve(request.result)
    request.onerror = () => reject(request.error)
  })
}

export async function loadSavedMapState(): Promise<SavedMapState | null> {
  if (!canUseIndexedDB()) return null

  const db = await openDatabase()
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, "readonly")
    const store = transaction.objectStore(STORE_NAME)
    const request = store.get(STATE_KEY)

    request.onsuccess = () => resolve((request.result as SavedMapState | undefined) ?? null)
    request.onerror = () => reject(request.error)
    transaction.oncomplete = () => db.close()
  })
}

export async function saveMapState(state: SavedMapState): Promise<void> {
  if (!canUseIndexedDB()) return

  const db = await openDatabase()
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, "readwrite")
    const store = transaction.objectStore(STORE_NAME)
    const request = store.put(state, STATE_KEY)

    request.onerror = () => reject(request.error)
    transaction.oncomplete = () => {
      db.close()
      resolve()
    }
    transaction.onerror = () => reject(transaction.error)
  })
}

export async function clearSavedMapState(): Promise<void> {
  if (!canUseIndexedDB()) return

  const db = await openDatabase()
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, "readwrite")
    const store = transaction.objectStore(STORE_NAME)
    const request = store.delete(STATE_KEY)

    request.onerror = () => reject(request.error)
    transaction.oncomplete = () => {
      db.close()
      resolve()
    }
    transaction.onerror = () => reject(transaction.error)
  })
}

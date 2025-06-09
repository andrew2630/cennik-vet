export const DATA_UPDATED_EVENT = 'dataUpdated'

export function notifyDataUpdated() {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event(DATA_UPDATED_EVENT))
  }
}

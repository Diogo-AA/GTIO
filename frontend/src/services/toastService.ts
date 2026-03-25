export type ToastType = 'success' | 'error' | 'info'

export let addToastFn: ((message: string, type: ToastType) => void) | null = null

export function setAddToastFn(fn: ((message: string, type: ToastType) => void) | null) {
  addToastFn = fn
}

export function showToast(message: string, type: ToastType = 'info') {
  addToastFn?.(message, type)
}
const namespace = 'examforge'

export function readCollection(key, fallback = []) {
  const raw = localStorage.getItem(`${namespace}:${key}`)
  return raw ? JSON.parse(raw) : fallback
}

export function writeCollection(key, value) {
  localStorage.setItem(`${namespace}:${key}`, JSON.stringify(value))
}

export function readItem(key, fallback = null) {
  const raw = localStorage.getItem(`${namespace}:${key}`)
  return raw ? JSON.parse(raw) : fallback
}

export function writeItem(key, value) {
  localStorage.setItem(`${namespace}:${key}`, JSON.stringify(value))
}

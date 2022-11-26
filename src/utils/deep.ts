export function deepDelete(obj: any, newObj: any) {
  for (const key in obj) {
    const val = newObj[key]
    if (!(key in newObj)) {
      delete (obj as any)[key]
    }

    if (val !== null && typeof val === 'object') {
      deepDelete(obj[key], newObj[key])
    }
  }
}

export function deepAssign(obj: any, newObj: any) {
  for (const key in newObj) {
    const val = newObj[key]
    if (val !== null && typeof val === 'object') {
      deepAssign(obj[key], val)
    }
    else {
      obj[key] = val
    }
  }
}

export function isObject(obj) {
    return obj!==null&&typeof obj==='object';
}


export function hasOwn(obj, key) {
    return Object.prototype.hasOwnProperty.call(obj, key)
}


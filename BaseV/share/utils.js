export function isObject(obj) {
    return obj!==null&&typeof obj==='object';
}


export function hasOwn(obj, key) {
    return Object.prototype.hasOwnProperty.call(obj, key)
}

export function remove (arr, item) {
    if (arr.length) {
        const index = arr.indexOf(item)
        if (index > -1) {
            return arr.splice(index, 1)
        }
    }
}
export { _parseHTML } from '../../share/parse.js';
export { 
    _parseVFor, 
    _parseVIf
 } from '../../share/resolveTemp.js';
import { errorTip } from './debugger.js';

export function deepClone(obj, cache = []){// grade : <=1
    if (obj === null || typeof obj !== 'object') {
        return obj
    }
    const hit = cache.filter(c => c.original === obj)[0]
    if (hit) {
        return hit.copy
    }
    const copy = Array.isArray(obj) ?  [] :   {}
    cache.push({
        original: obj,
        copy
    })
    Object.keys(obj).forEach(key => {
        copy[key] = deepClone(obj[key], cache)
    })
    return copy
}

export function parsePath(path, obj) {
    let segments = path.split('.');
    try {
        for(let i=0; i<segments.length; i++) {
            if(!obj) return;
            obj = obj[segments[i]];
        }
        return obj
    } catch (err) {
        errorTip(`Not found ${segments.join('.')} in obj`);
    }
}
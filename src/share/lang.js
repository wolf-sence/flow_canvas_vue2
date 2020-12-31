import { errorTip } from '../debugger/index.js';

export function parsePath(path) {
    let segments = path.split('.');
    return function(obj) {
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
}

export function noop() {}

export function def(obj, key, val, enumerable) {
    Object.defineProperty(obj, key, {
        value: val,
        enumerable: enumerable,
        writable: true,
        configurable: true,
    })
}

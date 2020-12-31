import { def } from '../share/lang.js';
import { observe } from './index.js';

const arrayProto = Array.prototype;

export const arrayMethods = Object.create(arrayProto);

const methodsToPatch = [
    'push',
    'pop',
    'shift',
    'unshift',
    'splice',
    'sort',
    'reverse'
]

methodsToPatch.forEach(function (method) {
    const original = arrayMethods[method];

    def(arrayMethods, method, function mutator(...args) {
        const result = original.apply(this, args);
        const fc = this.__fc__;
        let inserted;
        switch (method) {
            case 'push':
            case 'unshift':
                inserted = args;
                break;
            case 'splice':
                inserted = args.slice(2);
                break;
        }
        if(inserted) fc.observeArray(inserted);

        fc.dep.notify();
        return result;
    })
    
    
})
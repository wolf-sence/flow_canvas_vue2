import { Dep } from '../dep/index.js';
import { defineReactive } from '../defineReactive/index.js';
import { protoAugment } from '../share/share.js';
import { arrayMethods } from './array.js';

export class Observe {
    constructor(value) {
        this.value = value;
        this.dep = new Dep();

        def(value, '__fc__', this);

        if(Array.isArray(value)) {
            protoAugment(value, arrayMethods);
            this.observeArray(value);
        }else {
            this.walk(value);
        }
    }

    observeArray(value) {
        for(let i=0;i<value.length;i++) {
            observe(value[i]);
        }
    }
    walk(obj) {
        const keys = Object.keys(obj);
        for(let i=0;i<keys.length;i++) {
            defineReactive(obj, keys[i]);
        }
    }
}


function protoAugment(target, proto) {
    target.__proto__ = proto;
}
import { isObject } from '../share/utils.js';
import { VNode } from '../vnode/index.js';
import { Dep } from '../dep/index.js';
import { arrayMethods } from './array.js';
import {
    hasOwn,
} from '../share/utils.js';
import {
    def,
} from '../share/lang.js';
import { defineReactive } from '../core/defineReactive.js';

export function observe(value) {
    if(!isObject(value) || value instanceof VNode) {
        return ;
    }
    let fc = null;
    if(hasOwn(value, '__fc__')&&value.__fc__ instanceof Observe) {
        fc = value.__fc__;
    }else {
        fc = new Observe(value);
    }

    return fc;
}


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
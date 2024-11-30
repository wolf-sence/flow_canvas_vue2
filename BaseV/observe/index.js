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

export function defineReactive (obj, key, val) {
    let dep = new Dep();
    let property = Object.getOwnPropertyDescriptor(obj, key);

    if(property&&property.configurable === false) {
        return;
    }

    let getter = property&&property.get;
    let setter = property&&property.set;

    if((!getter || setter) && arguments.length === 2) {
        val = obj[key];
    }
    let childOb = observe(val);

    observe(val);
    Object.defineProperty(obj, key, {
        enumerable: true,
        configurable: true,
        get: function reactiveGetter() {
            const value = getter ? getter.call(obj) : val;
            Dep.Target && dep.depend();
            if(childOb) {
                childOb.dep.depend();
                if(Array.isArray(value)) {
                    dependArray(value);
                }
            }
            return value;
        },
        set: function reactiveSetter(newVal) {
            const value = getter ? getter.call(obj) : val;
            if(newVal===value||(newVal!==newVal&&value!==value)) {
                return ;
            }

            if(setter) {
                setter.call(val, newVal);
            }else {
                val = newVal;
            }

            dep.notify();
        }
    })
}

function dependArray (value) {
    for (let e, i = 0, l = value.length; i < l; i++) {
      e = value[i]
      e && e.__fc__ && e.__fc__.dep.depend()
      if (Array.isArray(e)) {
        dependArray(e)
      }
    }
  }
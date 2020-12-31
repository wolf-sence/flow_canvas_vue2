import { Dep } from '../dep/index.js';
import { observe } from '../observe/index.js';

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
            Dep.target && dep.depend();
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
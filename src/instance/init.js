import { observe } from '../observe/index.js';
import Watcher from '../watcher/index.js';
import { warnTip } from '../debugger/index.js';
import { 
    hasOwn,
    isObject,
} from '../share/utils.js';
import {
    noop,
} from '../share/lang.js';

let uid = 0;

const sharedPropertyDefinition = {
    enumerable: true,
    configurable: true,
    get: noop,
    set: noop
}

export function initMixin(FCV) {
    FCV.prototype._init = function (options) {
        const vm = this;
        vm._uid = uid++;
        vm.$options = options;

        initState(vm);
    }
}

function initState(vm) {
    let opts = vm.$options;
    if(opts.props) initProps(vm, opts.props);

    if(opts.methods) initMethods(vm, opts.methods);

    if(opts.data) initData(vm);

    if(opts.computed) initComputed(vm, opts.computed);

    if(opts.watch) initWatch(vm, opts.watch);
}

function initProps(vm, props) {

}

function initMethods(vm, methods) {
    let props = vm.$options.props;
    for(let key in methods) {
        if(typeof methods[key] !== 'function') {
            warnTip(`Methods [${key}] isn't function`);
        }
        if(props && hasOwn(props, key)) {
            warnTip(`Methods [${key}] has already defined as a prop`);
        }
        if(key in vm) {
            warnTip(`Methods [${key}] already existing`);
        }
        vm[key] = typeof methods[key]!=='function' ? noop : methods[key];
    }
}

function initData(vm) {
    let data = vm.$options.data;
    data = vm._data = data.call(vm, vm);

    let keys = Object.keys(data);

    const props = vm.$options.props;
    const methods = vm.$options.methods;

    for(let i=0;i<keys.length;i++) {
        if(methods && hasOwn(methods, keys[i])) {
            warnTip(`data [${key}] has already defined as a methods`);
        }
        if(props && hasOwn(props, keys[i])) {
            warnTip(`data [${key}] has already defined as a prop`);
        } else {
            proxy(vm, '_data', keys[i]);
        }
    }

    observe(data);
}

function proxy(target, sourceKey, key) {
    sharedPropertyDefinition.get = function proxyGetter () {
        return this[sourceKey][key]
    }
    sharedPropertyDefinition.set = function proxySetter (val) {
        this[sourceKey][key] = val
    }
    Object.defineProperty(target, key, sharedPropertyDefinition)
}

function initComputed(vm, computed) {
    const watchers = vm._computedWatchers = Object.create(null)
    
    for(let key in computed) {
        const funDef = computed[key];
        const getter = typeof funDef === 'function' ? funDef : funDef.get;

        watchers[key] = new Watcher(
            vm,
            getter || noop,
            noop,
        )
        if(!(key in vm)) {
            defineComputed(vm, key, funDef);
        } else {
            warnTip(`the computed property "${key}" is already defined`);
        }
    }
}

function defineComputed(vm, key ,func) {
    
    if(typeof func === 'function') {
        sharedPropertyDefinition.get = createComputedGetter(key);
        sharedPropertyDefinition.set = noop;
    }else {
        sharedPropertyDefinition.get = createComputedGetter(key)
        sharedPropertyDefinition.set = func.set || noop;
    }

    Object.defineProperty(vm, key, sharedPropertyDefinition);
    
}

function createComputedGetter(key) {
    return function computedGetter() {
        const watcher = this._computedWatchers&&this._computedWatchers[key];
        if(watcher) {
            watcher.depend();
        }
        return watcher.value;
    }
}

function initWatch(vm, watch) {
    for(let key in watch) {
        let handler = watch[key];
        createWatcher(vm, key, handler);
    }
}
export function createWatcher(vm, key, handler, options) {
    if(isObject(handler)) {
        options = handler;
        handler = handler.handler;
    }
    return vm.$watch(key, handler, options);
}
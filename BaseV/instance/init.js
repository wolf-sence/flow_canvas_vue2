import { observe } from '../observe/index.js';
import Watcher from '../watcher/index.js';
import { warnTip, errorTip } from '../debugger/index.js';
import { 
    hasOwn,
    isObject,
    _parseHTML,
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
    FCV.prototype._init_ = function (attr) {
        const vm = this;
        vm.$uid = uid++;
        vm.$options = attr.options;
        vm.$type = attr.type;
        vm.$parent = attr.parent;
        vm.$children = this.children = [];
        vm._watchers = []; // 为垃圾回收机制服务
        vm.$props = vm._props = {};
        // 解析props
        mountProps(vm, attr);

        initState(vm);
    }
    
}

function mountProps(vm, attr) { // 将外部传入的props挂载至实例;
    let propsData = attr.propsData || {};
    let propsKey = attr.options.props || [];

    let keys = Object.keys(propsData);
    for(let key of keys) {
        if(propsKey.indexOf(key) !== -1) {
            vm.$props[key] = propsData[key];
        }else if(propsData[key] instanceof Function) {
            vm.$props[key] = propsData[key];
        }
    }
}
function initState(vm) {
    let opts = vm.$options;
    if(opts.template) initTemplate(vm, opts.template);

    initProps(vm, opts.props);

    initLifecycle(vm, opts);
    
    vm.$beforeCreated && vm.$beforeCreated();

    if(opts.methods) initMethods(vm, opts.methods);

    if(opts.data) initData(vm);

    if(opts.computed) initComputed(vm, opts.computed);

    if(opts.watch) initWatch(vm, opts.watch);

    vm.$created && vm.$created();
}

function initTemplate(vm, template) {
    let attrs = _parseHTML(template);
    vm.$template = vm._template =attrs;
}

function initLifecycle(vm, opts) {
    if (typeof opts.beforeCreated === 'function') {
        vm.$beforeCreated = opts.beforeCreated;
    }
    if (typeof opts.created === 'function') {
        vm.$created = opts.created;
    }
    if (typeof opts.mounted === 'function') {
        vm.$mounted = opts.mounted;
    }
    if (typeof opts.beforeDestroy === 'function') {
        vm.$beforeDestroy = opts.beforeDestroy;
    }
    if (typeof opts.isHere === 'function') {
        vm.$isHere = opts.isHere;
    }
    if(typeof opts.draw === 'function') {
        vm.$draw = opts.draw;
    }
    if(typeof opts.hover === 'function') {
        vm.$hover = vm.hover = opts.hover;
    }
    if(typeof opts.click === 'function') {
        vm.$click = vm.click = opts.click;
    }
    if(typeof opts.dblclick === 'function') {
        vm.$dblclick = vm.dblclick = opts.dblclick;
    }
    if(typeof opts.selected === 'function') {
        vm.$selected = vm.selected = opts.selected;
    }
    if(typeof opts.mousedown === 'function') {
        vm.$mousedown = vm.mousedown = opts.mousedown;
    }
    if(typeof opts.mouseup === 'function') {
        vm.$mouseup = vm.mouseup = opts.mouseup;
    }
}


function initProps(vm) {
    let props = vm.$props;
    let keys = Object.keys(props);
    let parent = vm.$parent;

    for(let i=0; i<keys.length; i++) {
        if(typeof props[keys[i]] === 'function') {
            vm[keys[i]] = () => {
                props[keys[i]].apply(parent, arguments);
            };
        }else {
            proxy(vm, '_props', keys[i]);
        }
    }
    observe(props);
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
    // data = vm._data = data.call(vm, vm);
    data = vm._data = typeof data === 'function'
        ? data.call(vm, vm)
        : data || {}

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
    for(let key in watchers) {
        vm._watchers.push(watchers[key]);
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
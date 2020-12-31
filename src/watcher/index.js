import { warnTip, errorTip } from '../debugger/index.js';
import { noop, parsePath } from '../share/lang.js';
import { Dep, pushTarget, popTarget } from '../dep/index.js';
let uid = 0;

export default class Watcher {
    constructor(vm, expOrFn, callback, option) {
        this.$id = uid++;
        this.vm = vm;
        this.callback = callback;
        if(option) {
            this.user = !!option.user;
        }else {
            this.user = false;
        }
        this.deps =  [];
        this.depIds = new Set();
        this.expOrFn = expOrFn;
        if(typeof expOrFn === 'function') { // render
            this.getter = expOrFn;
        } else {
            this.getter = parsePath(expOrFn);
            if(!this.getter) {
                this.getter = noop;
            }
        }

        this.value = this.get();
    }
    get() {
        pushTarget(this);
        let value;
        const vm = this.vm;
        try {
            value = this.getter.call(vm, vm);
        } catch (e) {
            if(this.user) {
                errorTip(`getter for watcher "${this.expOrFn}"`)
            }else {
                throw e;
            }
        } finally {
            popTarget();
        }
        return value;
    }
    addDep(dep) {
        // 为这个watcher增加dep
        const id = dep.$id;
        if(!this.depIds.has(id)) {
            this.depIds.add(id);
            this.deps.push(dep);

            dep.addWatch(this);
        }
    }
    depend() {
        // 让每个关联的dep都增加这个watch
        if(Dep.target) {
            let i = this.deps.length;
            while(i--) {
                this.deps[i].depend();
            }
        }
    }
    update() {
        this.run();
    }
    run() {
        const value = this.get();
        if(value !== this.value) {
            const oldValue = this.value;
            this.value = value;
            if(this.user) {
                try{
                    this.callback.call(this.vm, value, oldValue);
                } catch(e) {
                    errorTip(`callback for watcher "${this.expOrFn}"`)
                }
            }else {
                this.callback.call(this.vm, value, oldValue);
            }
        }
    }
}


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
            this.isFirstRender = true; // 确保生命周期方法仅被执行一次
            this.user = !!option.user;
            // 定义第一次触发watcher更新时触发的生命周期
            this.before = option.before || '';
            this.after = option.after || '';
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
    get() { // 仅触发一次
        pushTarget(this);
        let value;
        const vm = this.vm;
        try {
            // 由于 engine 中的 draw 是有10ms时延，watch将会绑定失败，所以在watch中引入
            // 生命周期，强制在首次演示渲染之前渲染一次，从而使watcher成功绑定
            if(typeof this.before === 'function' && this.isFirstRender) {
                this.before.call(vm, vm);
            }

            value = this.getter.call(vm, vm);

            if(typeof this.after === 'function' && this.isFirstRender) {
                this.after.call(vm, vm);
            }

            this.isFirstRender = false;
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
        if(Dep.Target) {
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


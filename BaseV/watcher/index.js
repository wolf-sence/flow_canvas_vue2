import { warnTip, errorTip } from '../debugger/index.js';
import { noop, parsePath } from '../share/lang.js';
import { Dep, pushTarget, popTarget } from '../dep/index.js';
import { remove } from '../share/utils.js';
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
        this.active = true;
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
                errorTip(`getter for watcher "${this.expOrFn}" wrong`)
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
        if(this.active) {
            try {
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
            }catch (e) {
                // if(e instanceof TypeError) {
                    // 此错误通常为实例被清除,所以此处清除所有被此watcher绑定的响应式系统
                    // 当然也不排除未发现的错误,但是此处  为了垃圾清理机制 暂时忽略；
                    // 暂时取消
                    this.teardown();
                // }else {
                    throw e;
                // }
            }
            
        }
    }
    teardown () {
        if (this.active) {
          let i = this.deps.length
          while (i--) {
            this.deps[i].removeSub(this);
          }
          this.active = false;
        }
    }
    destroy() {
        // 绑定的属性被销毁时，需要手动触发此事件
        // 目前在每个实例的节点 统一销毁
        this.teardown();
        let keys = Object.keys(this);
        for(let i=0;i<keys.length;i++) {
            this[keys[i]] = null;
        }

    }
}


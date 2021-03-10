import { remove } from '../share/utils.js';

let uid = 0;

export class Dep {
    constructor() {
        this.$id = uid++;
        this.watchs = [];
    }
    depend() {
        if(Dep.Target) {
            Dep.Target.addDep(this);
        }
    }
    removeSub (sub) {
        remove(this.watchs, sub)
    }
    addWatch(watch) {
        this.watchs.push(watch);
    }
    notify() {
        for(let i=0; i<this.watchs.length; i++) {
            this.watchs[i].update();
        }
    }
    destroy() {
        let length = this.watchs.length;
        for(let i=length-1; i>=0; i--) {
            let watch = this.watchs[i];
            watch.removeDep(this);
        }
    }
}

Dep.Target = null;

export function pushTarget(target) {
    Dep.Target = target;
}

export function popTarget() {
    Dep.Target = null;
}
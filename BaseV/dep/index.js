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
    addWatch(watch) {
        this.watchs.push(watch);
    }
    notify() {
        for(let i=0; i<this.watchs.length; i++) {
            this.watchs[i].update();
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
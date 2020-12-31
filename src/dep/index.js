let uid = 0;

export class Dep {
    constructor() {
        this.$id = uid++;
        this.watchs = [];
    }
    depend() {
        if(Dep.target) {
            Dep.target.addDep(this);
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

Dep.target = null;

export function pushTarget(target) {
    Dep.target = target;
}

export function popTarget() {
    Dep.target = null;
}
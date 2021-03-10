import { 
    isObject,
} from '../share/utils.js';
import { createWatcher } from './init.js';
import Watcher from '../watcher/index.js';

export function stateMixin(FCV) {
    FCV.prototype.$watch = function (key, callback, options) {
        let vm = this;
        if(isObject(callback)) {
            return createWatcher(vm, key, callback, options);
        }
        options = options || {};
        options.user = true;
        let watch = new Watcher(vm, key, callback, options);
        vm._watchers.push(watch);
    }
    FCV.prototype.$on = function (name, fn) {
        if (typeof fn !== 'function') {
            return ;
        }
        if (!this.events) {
            this.events = {};
        }
        if (!this.events[name]) {
            this.events[name] = [];
        }
        this.events[name].push(fn);
    }
    FCV.prototype.$off = function (name, fn) {
        if (typeof fn !== 'function') {
            return ;
        }
        if (!this.events) {
            this.events = {};
        }
        if (!this.events[name]) {
            this.events[name] = [];
        }
        this.events[name].splice(this.events[name].indexOf(fn), 1);
    }
    FCV.prototype.$emit =function (name, ...data) {
        if (this.events && this.events[name]) {
            this.events[name].forEach(item => {
                if (typeof item === 'function') {
                    item.call(this.$parent, ...data);
                }
            })
        }
    }
}
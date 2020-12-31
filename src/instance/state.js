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
        new Watcher(vm, key, callback, options);
    }
}
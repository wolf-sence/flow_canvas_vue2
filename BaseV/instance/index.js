import { initMixin } from './init.js';
import { stateMixin } from './state.js';
function BaseV(attr) {  // flow-canvas-vue
    this._init_(attr);
}
// class BaseV {
//     constructor(attr) {
//         console.log('befor basev')
//         this._init(attr);
//     }
// }

initMixin(BaseV);
stateMixin(BaseV);


export default BaseV
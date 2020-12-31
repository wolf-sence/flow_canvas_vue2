import { initMixin } from './init.js';
import { stateMixin } from './state.js';

function FCV(options) {  // flow-canvas-vue
    this._init(options);
}

initMixin(FCV);
stateMixin(FCV);


export default FCV
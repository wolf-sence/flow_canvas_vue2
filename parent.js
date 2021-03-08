// import {doing} from './tool';

// export default class parent {
//     constructor() {
//         this.init();
//     }
//     init() {
//         doing();
//     }
// }
import son from './son';
// import {doing} from './tool';

export default class parent {
    constructor(val) {
        this.init(val);
    }
    init(val) {
        if(val) {
            new son();
        }
    }
}
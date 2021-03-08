import parent from './parent.js';

export default class son extends parent {
    constructor(val) {
        super(val);
        console.log('done constructor')
    }
    say() {
        console.log('say something')
    }
}

let s = new son(false)
s.say();
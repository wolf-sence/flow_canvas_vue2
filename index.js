import BaseV from './BaseV/instance/index';

let app = new BaseV({
    data: function() {
        return {
            name: 'tom',
            age: 12,
            obj: {
                a: 'q',
                b: 'w',
                c: [1,2,3],
            }
        }
    }
})
let keys = Object.keys(app)

// console.log('BaseV', BaseV);

console.log('app', app);

console.log('keys', keys);

console.log('data.name', app.name);
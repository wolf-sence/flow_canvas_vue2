export function warnTip(msg, vm) {
    let warnFunc = vm&&vm.config.warning; // overwrite fucntion from outside 
    if(warnFunc && typeof warnFunc === 'function') {
        warnFunc.call(null, msg);
    } else {
        console.warn(`[Flow warn]: ${msg}`);
    }
}

export function errorTip(msg, vm = null) {
    let errorFunc = vm&&vm.config.warning; // overwrite fucntion from outside 
    if(errorFunc && typeof errorFunc === 'function') {
        errorFunc.call(null, msg);
    } else {
        console.error(`[Flow warn]: ${msg}`);
    }
}
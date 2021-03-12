// import UnitF from '../Engine/instance/UnitF.js';
// 先删除children中原有的，由v-for/v-if动态生成的节点，再重新推入

// 解析v-for 子节点
export function _parseVFor(vm, attr) {
    let children = vm.$children;
    let root = vm.$uae;
    for(let i=children.length-1; i>=0; i--) {
        if(children[i].$vForItem) {
            children.splice(i, 1);
        }
    }
    // (item, index) in data.output

    // let vForPath = attr.attrMap['v-for'];
    let items = attr.attrMap['v-for'].split('in ');
    let args = items[0].trim();
    if (args.startsWith('(')) {
        args = args.substring(1, args.length-1);
    }
    let argArr = args.split(',').map(item => {
        return item.trim();
    })
    let parentValue = new Function('vm', `with(vm) {return vm.${items[1].trim()}}`).call(vm, vm);

    let obj = {
        [argArr[0]]: null,
        [argArr[1]?argArr[1]:argArr[1]='_index']: 0,
    }
    for(;obj[argArr[1]]<parentValue.length;obj[argArr[1]]++) {
        obj[argArr[0]] = parentValue[obj[argArr[1]]];

        let propsData = mountProps(obj, attr);
        root.createNode({
            type: attr.tag,
            parent: vm,
            vForItem: true,
            ...propsData,
        })
    }
}
// 解析v-if 子节点
export function _parseVIf(vm, attr) {
    let children = vm.$children;
    let root = vm.$uae;
    for(let i=children.length-1; i>=0; i--) {
        if(children[i].$vIfItem) {
            children.splice(i, 1);
        }
    }

    let valuePath = attr.attrMap['v-if'];

    let bool = new Function('vm', `with(vm) {return vm.${valuePath}}`).call(vm, vm);

    if(bool) {
        let propsData = mountProps(vm, attr);
        console.log('from resolve propsData', propsData)
        root.createNode({
            type: attr.tag,
            parent: vm,
            vIfItem: true,
            ...propsData,
        })
    }
}
// 解析 普通子节点
export function _parse(vm, attr) {
    let children = vm.$children;
    let root = vm.$uae;
    // console.log('vm, attr', vm, attr);
    for(let i=children.length-1; i>=0; i--) {
        if(!children[i].$vIfItem && !children[i].$vForItem) {
            children.splice(i, 1);
        }
    }
    
    let propsData = mountProps(vm, attr);
    console.log('from _parse normal propsData', propsData);
    root.createNode({
        type: attr.tag,
        parent: vm,
        ...propsData,
    })
}
function mountProps(vm, attr) {
    console.log('-----重新生成子节点----');
    let propsMap = attr.attrMap;
    let ret = {}
    for(let key in propsMap) {
        if(key.indexOf('v-for')===-1&&key.indexOf('v-if')===-1) {
            let k = key;
            if(key.startsWith(':')) {
                k = key.slice(1);
                ret[k] = new Function('vm', `with(vm) {return vm.${propsMap[key]}}`).call(vm, vm);
            } else {
                ret[k] = propsMap[k];
            }
            
        }
    }
    return ret;
}
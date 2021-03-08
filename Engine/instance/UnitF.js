import BaseV from '../../BaseV/instance/index.js';
import Watcher from '../../BaseV/watcher/index.js';
import { 
    _parseVFor, 
    _parseVIf
} from '../../share/resolveTemp.js';
import GridWrap from '../grid/grid.js';

let Grid = GridWrap.getInstance();

class UnitF extends BaseV {
    constructor(attr) {
        super(attr); // 挂载 ctx,options,uae,

        const vm = this;
        const opts = vm.$options;
        vm.$ctx = vm.ctx = attr.ctx;
        vm.$uae = vm._uae = attr.uae;
        vm.$vIfItem = attr.vIfItem;
        vm.$vForItem = attr.vForItem;

        vm.$cursor = opts.cursor;

        Grid.handleUpdate(vm);
        // 此时 声明周期已经走完 mounted,但未渲染,

        this.initChildren(vm);

        this.initRender(vm);

        vm.$render();

        vm.$mounted && vm.$mounted();
    }
    initRender(vm) {
        vm.render = vm.$render = () => {
            let option = {
                after: () => {
                    console.log('enter afater ', vm.$type);
                    vm.$draw&&vm.$draw();
                }
            }
            new Watcher(vm, () => {
                vm.$uae&&vm.$uae.draw(); // 通知父级渲染
            }, null, option);
        }
    }

    initChildren(vm) {
        if(!vm.$template) return;
        for(let i=0; i<vm.$template.length; i++) {
            let attr = vm.$template[i];
            if(attr.attrMap['v-if']&&attr.attrMap['v-for']) {
                errorTip(`we're not support v-for and v-if been use in same component!`);
            }else if(attr.attrMap['v-if']) {
                new Watcher(vm, () => {
                    _parseVIf(vm, attr);
                    vm.$uae.draw();
                })
            }else if(attr.attrMap['v-for']) {
                new Watcher(vm, () => {
                    _parseVFor(vm, attr);
                    vm.$uae.draw();
                })
            }
        }   
    }
    
}

export default UnitF;
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
        
        vm.$dragable = vm.dragable = opts.dragable || true;
        vm.$cursor = opts.cursor || 'pointer'; // hover时的鼠标指针
        vm.$block = 'block' in opts ? opts.block : true; // 是否计入障碍物地图
        vm.$link = 'link' in opts ? opts.link : true; // 是否可以被线条连接
        // vm.$sync = 'sync' in opts ? opts.sync : false; // 初始化时是否异步渲染
        vm._distance = {
            dx: null,
            dy: null,
        }

        Grid.handleUpdate(vm);

        this.initChildren(vm);

        this.initRender(vm);
        
        this.initDrag(vm);

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
        console.log('-----enter init initChildren')
        if(!vm.$template) return;
        for(let i=0; i<vm.$template.length; i++) {
            let attr = vm.$template[i];
            if(attr.attrMap['v-if']&&attr.attrMap['v-for']) {
                errorTip(`we're not support v-for and v-if been use in same component!`);
            }else if(attr.attrMap['v-if']) {
                new Watcher(vm, () => {
                    _parseVIf(vm, attr);
                    console.log('-------触发 v-if  watcher ')
                    // vm.$uae.draw();
                })
            }else if(attr.attrMap['v-for']) {
                new Watcher(vm, () => {
                    console.log('--------触发 v-for wathcer')
                    _parseVFor(vm, attr);
                    // vm.$uae.draw();
                })
            }
        }   
    }

    initDrag(vm) {
        let opts = vm.$options;
        if(vm.dragable) {
            if(typeof opts.dragstart === 'function') {
                vm.$dragstart = vm.dragstart = opts.dragstart;
            }else {
                vm.$dragstart = vm.dragstart = this._dragStart;
            }

            if(typeof opts.drag === 'function') {
                vm.$drag = vm.drag = opts.drag;
            }else {
                vm.$drag = vm.drag = this._drag;
            }

            if(typeof opts.dragend === 'function') {
                vm.$dragend = vm.dragend = opts.dragend;
            }else {
                vm.$dragend = vm.dragend = this._dragend;
            }
        }
    }
    _dragStart(x, y) {
        this._distance.dx = x - this.bounds.x;
        this._distance.dy = y - this.bounds.y;
        this.recordDragStart(this);
    }
    _drag(x, y) {
        this.data.bounds.x = x - this._distance.dx;
        this.data.bounds.y = y - this._distance.dy;
    }
    _dragend(x, y) {
        this.data.bounds.x = x - this._distance.dx;
        this.data.bounds.y = y - this._distance.dy;
        this.recordDragEnd(this);
    }
    recordDragStart(comp) {
        Grid.handleDelete(comp);
    }
    recordDragEnd(comp) {
        Grid.handleUpdate(comp);
    }
    
}

export default UnitF;
import BaseV from '../../BaseV/instance/index.js';
import Watcher from '../../BaseV/watcher/index.js';
import { 
    _parseVFor, 
    _parseVIf,
    _parse
} from '../../share/resolveTemp.js';
import GridWrap from '../grid/grid.js';

let Grid = GridWrap.getInstance();

function initDrag(vm) {
    let opts = vm.$options;
    if(vm.dragable) {
        if(typeof opts.dragstart === 'function') {
            vm.$dragstart = vm.dragstart = opts.dragstart;
        }else {
            vm.$dragstart = vm.dragstart = (x, y) => {
                _dragStart.call(vm, x, y)
            };
        }

        if(typeof opts.drag === 'function') {
            vm.$drag = vm.drag = opts.drag;
        }else {
            vm.$drag = vm.drag = (x, y) => {
                _drag.call(vm, x, y);
            };
        }

        if(typeof opts.dragend === 'function') {
            vm.$dragend = vm.dragend = opts.dragend;
        }else {
            vm.$dragend = vm.dragend = (x, y) => {
                _dragend.call(vm, x, y);
            };
        }
    }
}
function destroy() {
    // 缺少清除响应式
    let parent = this.$parent;
    let uae = this.$uae;
    if(this.$block) Grid.handleDelete(this); // 删除障碍物地图
    
    for(let i=0;i<this.$children.length;i++) {
        this.$children[i].$destroy();
        i--;
    }
    // 销毁过程不可能，如果需要可逆，可以在此处修改返回值，判断是否继续销毁
    this.$beforeDestroy && this.$beforeDestroy();
    
    for(let i=0;i<uae.$children.length;i++) {
        let c = uae.$children[i];
        if(this.id === c.id) {
            uae.$children.splice(i, 1);
            delete uae._nodeMap[this.id];
            break;
        }
    }
    for(let i=0;i<parent.$children.length;i++) {
        let c = parent.$children[i];
        if(this.id === c.id) {
            parent.$children.splice(i, 1);
            delete uae._nodeMap[this.id];
            break;
        }
    }
    let keys = Object.keys(this);
    let _watchers = this._watchers;

    for(let i=0;i<keys.length;i++) {
        try{
            if(keys[i] in this && this[keys[i]]) delete this[keys[i]];
        } catch(e) {
            // 销毁过程，由于响应式的proxy，所以可能出现删除元数据，倒是proxy-key读不了，所以此处捕捉不做处理
        }
    }

    // 清除所有 响应式
    for(let i=0;i<_watchers.length;i++) {
        _watchers[i].destroy();
    }
    _watchers = null;
}
function _dragStart(x, y) {
    this._distance.dx = x - this.bounds.x;
    this._distance.dy = y - this.bounds.y;
    this.recordDragStart(this);
}
function _drag(x, y) {
    let fx = x - this._distance.dx;
    let fy = y - this._distance.dy;
    if(!this.isBorderX(fx)) {
        this.data.bounds.x = fx
    }
    if(!this.isBorderY(fy)) {
        this.data.bounds.y = fy
    }
}
function _dragend(x, y) {
    let fx = x - this._distance.dx;
    let fy = y - this._distance.dy;
    if(!this.isBorderX(fx)) {
        this.data.bounds.x = fx
    }
    if(!this.isBorderY(fy)) {
        this.data.bounds.y = fy
    }

    this.recordDragEnd(this);
}

function initRender(vm) {
    vm.render = vm.$render = () => {
        let option = {
            after: () => {
                vm.$draw&&vm.$draw();
            }
        }
        let watch = new Watcher(vm, () => {
            vm.$uae&&vm.$uae.draw(); // 通知父级渲染
        }, null, option);
        vm._watchers.push(watch)
    }
}

function initChildren(vm) {
    if(!vm.$template) return;
    for(let i=0; i<vm.$template.length; i++) {
        let attr = vm.$template[i];
        if(attr.attrMap['v-if']&&attr.attrMap['v-for']) {
            errorTip(`we're not support v-for and v-if been use in same component!`);
        }else if(attr.attrMap['v-if']) {
            let watch = new Watcher(vm, () => {
                _parseVIf(vm, attr);
                // vm.$uae.draw();
            })
            vm._watchers.push(watch);
        }else if(attr.attrMap['v-for']) {
            let watch = new Watcher(vm, () => {
                _parseVFor(vm, attr);
                // vm.$uae.draw();
            })
            vm._watchers.push(watch);
        }else {
            let watch = new Watcher(vm, () => {
                _parse(vm, attr);
            })
            vm._watchers.push(watch);
        }
    }   
}
class UnitF extends BaseV {
    constructor(attr) {
        super(attr); // 挂载 ctx,options,uae,

        const vm = this;
        const opts = vm.$options;
        vm.$ctx = vm.ctx = attr.ctx;
        vm.$uae = vm._uae = attr.uae;
        vm.$vIfItem = attr.vIfItem;
        vm.$vForItem = attr.vForItem;
        
        vm.$dragable = vm.dragable = 'dragable' in opts ? opts.dragable : true;
        vm.$cursor = opts.cursor || 'pointer'; // hover时的鼠标指针
        vm.$block = 'block' in opts ? opts.block : true; // 是否计入障碍物地图
        vm.$link = 'link' in opts ? opts.link : true; // 是否可以被线条连接
        // vm.$sync = 'sync' in opts ? opts.sync : false; // 初始化时是否异步渲染
        vm._distance = {
            dx: null,
            dy: null,
        }

        Grid.handleUpdate(vm);

        this._init(vm);

        vm.$render();
        vm.$mounted && vm.$mounted();
        
    }
    _init(vm) {
        initChildren(vm);

        initRender(vm);
        
        initDrag(vm);

        vm.$destroy = () => {
            destroy.call(vm);
        };
    }
    
    recordDragStart(comp) {
        Grid.handleDelete(comp);
    }
    recordDragEnd(comp) {
        Grid.handleUpdate(comp);
    }
    isBorderX(x) {
        if(x<2 || x > (this.$uae.canvas.width-this.bounds.width)) {
            return true;
        }
        return false;
    }
    isBorderY(y) {
        if(y<2 || y > (this.$uae.canvas.height-this.bounds.height-2)) {
            return true;
        }
        return false;
    }
}

export default UnitF;
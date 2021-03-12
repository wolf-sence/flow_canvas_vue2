import BaseV from '../../BaseV/instance/index.js';
import UnitF from './UnitF.js';
import { errorTip, deepClone } from '../share/share.js';
import GridWrap from '../grid/grid.js';
import RenderSequence from '../render/sequence.js';

let Grid = GridWrap.getInstance();

export default class Engine extends BaseV{
    constructor(def) {
        super(def);

        this.$templateClass = {}; // 画布注册的节点类型

        this._nodeMap = {};

        this._drawing = false; // 判断 是否 正在渲染中

        this.sc = 1; // canvas伸缩比例
        this.tx = 0; // translate x/y的距离
        this.ty = 0;

        this.$canvas = this.canvas = def.options.canvas;
        this.$ctx = this.ctx = this.$canvas.getContext('2d');
        this.RS = new RenderSequence(this);
        this.selecteds = [];
        this.dockeydown = null;
        this._init(def);

        this.$mounted && this.$mounted();
        
        this.Grid = Grid;
        
    }
    // 注册节点类型 (根据mixinName父类型创建子类型)
    registerComp(component) {
        let name = component.name;
        let mixinName = component.mixin;
        let compF = component;
        if(mixinName) {
            if(this.$templateClass[mixinName]) {
                compF = this.$templateClass[mixinName]&&this.mixinComp(component, this.$templateClass[mixinName])
            }else {
                errorTip(`we cann't find mixin-template: ${mixinName} when we're trying to register ${name}`);
            }
        }
        this.$templateClass[name] = compF
    }
    // 根据类型创建节点
    createNode(def) {
        let { 
            type,
            parent,
            vForItem,
            vIfItem,
            ...data
        } = def;

        let temp = this.getTemplate(type);
        let node = new UnitF({
            options: temp,
            type: type,
            propsData: data,
            ctx: this.$ctx,
            uae: this,
            parent: parent || this,
            vForItem,
            vIfItem,
        }); // 动态响应化

        let children = parent ? parent.$children : this.$children;

        children.push(node);

        this._nodeMap[node.id] = node;

        return node;
        // Grid.handleCreate(node);
    }
    mixinComp(comp, mixin) {
        let ret = Object.assign({}, comp, mixin);
        ret.data = Object.assign({}, (mixin || {}).data || {}, (comp || {}).data || {});
        ret.methods = Object.assign({}, (mixin || {}).methods || {}, (comp || {}).methods || {});
        ret.watch = Object.assign({}, (mixin || {}).watch || {}, (comp || {}).watch || {});
        ret.computed = Object.assign({}, (mixin || {}).computed || {}, (comp || {}).computed || {});
        ret.props = [].concat((mixin || {}).props || []).concat(comp.props || []);
        return ret;
    }
    getTemplate(type) {
        if(this.$templateClass[type]) {
            return deepClone(this.$templateClass[type]);
        }else {
            errorTip(`error: we cann't find tempalte ${type}`);
            return {};
        }
    }
    _init(def) {
        this._bind();
    }
    _bind() {
        let canvas = this.$canvas;
        canvas.addEventListener('click', e => {
            let x = e.offsetX,
                y = e.offsetY,
                cx = this._toCanvasX(e.offsetX),
                cy = this._toCanvasY(e.offsetY);
            let comp = this.getCompByPoint(x, y, cx, cy);
            if (comp) {
                comp.$click && comp.$click(cx, cy);
            }
            this.$emit('click', {
                e,
                x: this._toCanvasX(x),
                y: this._toCanvasY(y),
                comp,
            })
        })
        canvas.addEventListener('dblclick', e => {
            let x = e.offsetX,
                y = e.offsetY,
                cx = this._toCanvasX(e.offsetX),
                cy = this._toCanvasY(e.offsetY),
                comp = this.getCompByPoint(x, y, cx, cy);
            if (comp) {
                comp.$dblclick && comp.$dblclick(cx, cy);
            }
            this.$emit('dblclick', {
                e,
                x: this._toCanvasX(x),
                y: this._toCanvasY(y),
                comp,
            });
        })
        canvas.addEventListener('mousemove', e => {
            let x = e.offsetX,
                y = e.offsetY,
                cx = this._toCanvasX(e.offsetX),
                cy = this._toCanvasY(e.offsetY);
            let comp = this.getCompByPoint(x, y, cx, cy);
            if (comp) {
                canvas.style.cursor = comp.$cursor;

                comp.isHover = true;
                comp.$hover && comp.$hover(cx, cy);
                this.clearHover([comp.id]);
            }else {
                this.clearHover();
                canvas.style.cursor = 'default';
            }
            this.$emit('mousemove', {
                e,
                x: this._toCanvasX(x),
                y: this._toCanvasY(y),
                comp,
            })
        })
        canvas.addEventListener('mousedown', e => {
            let x1 = this._toCanvasX(e.offsetX),
                y1 = this._toCanvasY(e.offsetY),
                dragstart = false,
                comp = this.getCompByPoint(e.offsetX, e.offsetY, x1, y1, false),
                mousemove = e => {
                    let x2 = this._toCanvasX(e.offsetX),
                        y2 = this._toCanvasY(e.offsetY),
                        dx = x2 - x1,
                        dy = y2 - y1;
                    
                    if (!dx && !dy) {
                        return ;
                    }
                    if (!dragstart) {
                        dragstart = true;
                        if(this.selecteds.length>0) {
                            // x1&x2几乎处于同一位置，可以忽视差别
                            this.selecteds.forEach(item => {
                                this._nodeMap[item].$dragstart && this._nodeMap[item].$dragstart(x2, y2); // 鼠标的定位
                            })
                        }
                        this.$emit('dragstart', {
                            e,
                            x: x1,
                            y: y1,
                            comp: comp,
                        })
                    }
                    if(this.selecteds.length>0) {
                        this.selecteds.forEach(item => {
                            this._nodeMap[item].$drag && this._nodeMap[item].$drag(x2, y2);
                        })
                    }
                    this.$emit('drag', {
                        e,
                        x: x2,
                        y: y2,
                        dx: dx,
                        dy: dy,
                    })
                },
                mouseup = e => {
                    canvas.removeEventListener('mousemove', mousemove);
                    canvas.removeEventListener('mouseup', mouseup);
                    let x2 = e.offsetX,
                        y2 = e.offsetY,
                        dx = x2 - x1,
                        dy = y2 - y1;
                    if(dragstart) {
                        if(this.selecteds.length>0) {
                            this.selecteds.forEach(item => {
                                this._nodeMap[item].$dragend && this._nodeMap[item].$dragend(x2, y2);
                            })
                        }
                        this.$emit('dragend', {
                            e,
                            x: x2,
                            y: y2,
                            dx: dx,
                            dy: dy,
                        })
                    }
                    
                };
                if(comp && this.selecteds.indexOf(comp.id) === -1) {
                    this.clearSelected([comp.id]);
                    console.log('进入 选中 但 不属于多选', this.selecteds)
                } else if(!comp) {
                    this.clearSelected();
                }

            canvas.addEventListener('mousemove', mousemove);
            canvas.addEventListener('mouseup', mouseup);
        })
        canvas.addEventListener('mouseenter', e => {
            this.$emit('mouseenter', {
                e,
                x: this._toCanvasX(e.offsetX),
                y: this._toCanvasY(e.offsetY)
            });
        })
        canvas.addEventListener('mouseleave', e => {
            this.$emit('mouseleave', {
                e,
                x: this._toCanvasX(e.offsetX),
                y: this._toCanvasY(e.offsetY)
            });
        })
        canvas.addEventListener('contextmenu', e => {
            let cx = this._toCanvasX(e.offsetX),
                cy = this._toCanvasY(e.offsetY),
                comp = this.getCompByPoint(e.offsetX, e.offsetY, cx, cy);
            if (comp) {
                comp.$contextmenu && comp.$contextmenu()
            }
            this.$emit('contextmenu', {
                e,
                x: cx,
                y: cy,
                comp,
            });
        })
        document.addEventListener('keydown', this.dockeydown = e => {
            this.$emit('keydown', e);

            if(e.keyCode === 46) {
                this.deleteSelected();
            }
        })
    }
    draw() {
        if(this._drawing) {
            return;
        }
        this._drawing = true;
        let _draw = function (comps) {
            for(let i=0,comp; i<comps.length,comp=comps[i]; i++) {
                // 渲染过程从大到小，从外到里
                comp.$draw && comp.$draw();
                // _renderTemplate(comp);
                if(comp.$children&&comp.$children.length>0) {
                    _draw(comp.$children);
                }
            }
        }
        let time = setTimeout(() => { // 10ms内 重新绘制整个画布中的内容
            clearTimeout(time);
            this._drawing = false;
            let children = this.RS.getSequence(); // 拿到渲染队列
            this.ctx.clearRect(0, 0, this.$canvas.width, this.$canvas.height);
            _draw(children);
        }, 10)
    }
    // isRoot: 是否只返回单个根节点
    // 返回该点最后被绘制的节点，即最顶层的节点
    getCompByPoint(x, y, cx, cy, isRoot = true) {
        let nodeIds = Grid.checkPoint(cx, cy);

        if(nodeIds && Array.isArray(nodeIds)) {
            return this._nodeMap[nodeIds.slice(-1)];
        }else if(nodeIds) {
            return this._nodeMap[nodeIds];
        } else { // 非block元素,不存在于障碍物地图,使用老方法判断
            return this.getEdgeByPoint(cx, cy); // 暂时只对edge处理
        }
    }
    getEdgeByPoint(x, y) { // 特例：通过point获取edge或其子元素
        let _findEdge = function (childrens) {
            for(let i=0,item; i<childrens.length,item=childrens[i]; i++) {
                if(item.$children) {
                    let t = _findEdge(x, y);
                    if(t) {
                        console.log('---getEdgeByPoint',)
                        return t;
                    }
                }
                if(item.$isHere && item.$isHere(x, y)) {
                    return item;
                }
            }
        }

        for(let key in this._nodeMap) {
            let item = this._nodeMap[key];
            if(item.$type === 'edge' && !item.$block) {
                if(item.$children && item.$children.length>0) {
                    let t = _findEdge(item.$children);
                    if(t) {
                        return t;
                    }
                }
                if(item.$isHere && item.$isHere(x, y)) {
                    return item;
                }
            }
        }
    }
    // 根据range范围 获取其内的子节点(仅限根目录下的节点)
    getChildByRange(x1, y1, x2, y2) {
        let ids = this.Grid.checkRange(x1, y1, x2, y2);
        let childrens = this.$children.filter(item => {
            return ids.indexOf(''+item.id)>-1
        })
        this.selecteds = childrens.map(item => item.id);
        return childrens;
    }
    deleteSelected() {
        this.selecteds.forEach(id => {
            let node = this._nodeMap[id];
            node.$destroy();
        })
        this.selecteds = [];
        this.repaint();
    }
    clearHover(ids = []) { // 除ids中以外的节点，清空hover状态
        this.$children.forEach(node => {
            if(ids.indexOf(node.id) === -1) {
                // node.isHover = false;
                node.$hover && node.$hover(false);
            }
        })
        for(let key in this._nodeMap) {
            let node = this._nodeMap[key];
            if(node.$type === 'edge' && ids.indexOf(node.id) === -1) {
                node.$hover && node.$hover(false);
            }
        }
    }
    clearSelected(ids = []) { // 除ids中以外的节点，清空selected状态
        this.$children.forEach(node => {
            if(ids.indexOf(node.id) === -1) {
                // node.isSelect = false;
                node.$selected && node.$selected(false);
            }
        })
        for(let key in this._nodeMap) {
            let node = this._nodeMap[key];
            // console.log('node.id', node.id);
            if(node.$type === 'edge' && ids.indexOf(node.id) === -1) {
                node.$selected && node.$selected(false);
            }
        }
        this.selecteds = ids;
    }
    repaint() {
        this.draw();
    }
    scale(rate) {
        this.ctx.scale(rate, rate);
        this.repaint();
        this.sc = rate;
    }
    translateX(tx) {
        this.ctx.translate(tx - this.tx, 0);
        this.tx = tx;
        this.repaint();
    }
    translateY(ty) {
        this.ctx.translate(0, ty - this.ty);
        this.ty = ty;
        this.repaint();
    }
    _toCanvasX(x) {
        return x / this.sc - this.tx;
    }
    _toCanvasY(y) {
        return y / this.sc - this.ty;
    }
}

import BaseV from '../../BaseV/instance/index.js';
import UnitF from './UnitF.js';
import { errorTip, deepClone } from '../share/share.js';
import GridWrap from '../grid/grid.js';
import FlowData from './FlowData.js';
import Drill from '../drill/Drill.js';
import Historys from '../history/History.js';
import RenderSequence from '../render/sequence.js';

let Grid = GridWrap.getInstance();

// 分析 实现画布 高精度
function _analysis(vm) {
    let canvas = vm.$canvas,
        ctx = vm.$ctx;
    let devicePixelRatio = window.devicePixelRatio || 1;
    let backingStoreRatio = ctx.webkitBackingStorePixelRatio ||
        ctx.mozBackingStorePixelRatio ||
        ctx.msBackingStorePixelRatio ||
        ctx.oBackingStorePixelRatio ||
        ctx.backingStorePixelRatio || 1;
    let ratio = devicePixelRatio / backingStoreRatio;

    canvas.style.width = canvas.width+"px";
    canvas.style.height = canvas.height+"px";

    canvas.width = canvas.width * ratio;
    canvas.height = canvas.height * ratio;
    ctx.scale(ratio, ratio)
    return ratio; // 返回 高精度 后缩小的比例
}
// 初始化 增加ctx中的绘图方法
function _initCtx(vm) {
    vm.ctx.roundRect = function (x, y, width, height, radius) {
        let ctx = this;
        ctx.moveTo(x + radius, y);
        ctx.lineTo(x + width - radius, y);
        radius && ctx.arcTo(x + width, y, x + width, y + radius, radius);
        ctx.lineTo(x + width, y + height - radius);
        radius && ctx.arcTo(x + width, y + height, x + width - radius, y + height, radius);
        ctx.lineTo(x + radius, y + height);
        radius && ctx.arcTo(x, y + height, x, y + height - radius, radius);
        ctx.lineTo(x, y + radius);
        radius && ctx.arcTo(x, y, x + radius, y, radius);
    }
}

export default class Engine extends BaseV{
    constructor(def) {
        super(def);

        this.$templateClass = {}; // 画布注册的节点类型

        this._nodeMap = {};

        this._drawing = false; // 判断 是否 正在渲染中

        this.sc = 1; // canvas伸缩比例
        this.ratio = def.ratio || 1; // 高精度比例
        this.tx = 0; // translate x/y的距离
        this.ty = 0;
        // this.$autoAdsorpt = def.autoAdsorpt || false; // 是否根据准线自动吸附

        this.$canvas = this.canvas = def.options.canvas;
        this.$ctx = this.ctx = this.$canvas.getContext('2d');
        this.RS = new RenderSequence(this);
        this.selecteds = [];
        this.dockeydown = null;
        this._init(def);

        this.Grid = Grid;
        this.flowData = FlowData.getInstance();
        this.drill = new Drill(this);
        this.historys = new Historys(this);

        this.$mounted && this.$mounted();
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
    // comp为主节点，mixin为混入数据，冲突数据以comp原数据为准
    mixinComp(comp, mixin) {
        if(mixin.mixin) { // 嵌套混入
            let mixinName = mixin.mixin;
            if(mixinName) {
                if(this.$templateClass[mixinName]) {
                    mixin = this.$templateClass[mixinName]&&this.mixinComp(mixin, this.$templateClass[mixinName])
                }else {
                    errorTip(`we cann't find mixin-template: ${mixinName} when we're trying to register ${mixin.name}`);
                }
            }
        }
        let ret = Object.assign({}, mixin, comp);
        ret.data = Object.assign({}, (mixin || {}).data || {}, (comp || {}).data || {});
        ret.methods = Object.assign({}, (mixin || {}).methods || {}, (comp || {}).methods || {});
        ret.watch = Object.assign({}, (mixin || {}).watch || {}, (comp || {}).watch || {});
        ret.computed = Object.assign({}, (mixin || {}).computed || {}, (comp || {}).computed || {});
        ret.props = [].concat((mixin || {}).props || []).concat(comp.props || []);
        return ret;
    }
    loopNodeList(list) {
        this.flowData.pushDatas(list);
        for(let i=0; i<list.length; i++) {
            let node = list[i];
            
            this.createNode({
                type: node.nodeType,
                data: node,
            })
        }
    }
    // isRecord: 是否将此次创建记录在历史记录
    // 根据类型创建节点
    createNode(def, isRecord = false) {
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
        this._nodeMap[node.$uid] = node;
        if(isRecord) {
            this.historys.recordCreate(data);
        }
        return node;
        // Grid.handleCreate(node);
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
        this.ratio = _analysis(this);
        this._bind();
        _initCtx(this);
        
    }
    _bind() {
        let canvas = this.$canvas;
        let copyNodeIds; // 复制节点数据
        canvas.addEventListener('click', e => {
            let x = e.offsetX,
                y = e.offsetY,
                cx = this._toCanvasX(e.offsetX),
                cy = this._toCanvasY(e.offsetY);
            let comp = this.getCompByPoint(x, y, cx, cy);
            // if (comp) {
            //     this.clearSelected([comp.$uid])
            // }else {
            //     this.clearSelected([])
            // }
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
                comp.$hover && comp.$hover(true);
                this.clearHover([comp.$uid]);
            }else {
                this.clearHover();
                canvas.style.cursor = 'default';
            }
            this.$emit('mousemove', {
                e,
                x: cx,
                y: cy,
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
                            if(this.selecteds.length>0) this.historys.recordMove(this.selecteds);
                        }
                        let event = {
                            e,
                            x: x1,
                            y: y1,
                            comp: comp,
                        }
                        // this.$dragstart && this.$dragstart(event)
                        this.$emit('dragstart', event)
                    }
                    if(this.selecteds.length>0) {
                        canvas.style.cursor = 'pointer';
                        this.selecteds.forEach(item => {
                            this._nodeMap[item].$drag && this._nodeMap[item].$drag(x2, y2);
                        })
                    }
                    let event = {
                        e,
                        x: x2,
                        y: y2,
                        comp: comp,
                        dx: dx,
                        dy: dy,
                    };
                    // this.$drag && this.$drag(event);
                    this.$emit('drag', event)
                },
                mouseup = e => {
                    canvas.removeEventListener('mousemove', mousemove);
                    canvas.removeEventListener('mouseup', mouseup);
                    canvas.removeEventListener('mouseleave', mouseup);
                    let x2 = this._toCanvasX(e.offsetX),
                        y2 = this._toCanvasY(e.offsetY),
                        dx = x2 - x1,
                        dy = y2 - y1;
                    if(dragstart) {
                        if(this.selecteds.length>0) {
                            this.selecteds.forEach(item => {
                                this._nodeMap[item].$dragend && this._nodeMap[item].$dragend(x2, y2);
                                this._nodeMap[item].$mouseup && this._nodeMap[item].$mouseup();
                            })
                        }
                        let event = {
                            e,
                            x: x2,
                            y: y2,
                            dx: dx,
                            dy: dy,
                        };
                        // this.$dragend && this.$dragend(event);
                        this.$emit('dragend', event)
                    }
                    
                };
                if(comp && this.selecteds.indexOf(comp.$uid) === -1) {
                    this.clearSelected([comp.$uid]);
                } else if(!comp) {
                    this.clearSelected();
                }
                if(comp) {
                    comp.$mousedown && comp.$mousedown()
                }

            canvas.addEventListener('mousemove', mousemove);
            canvas.addEventListener('mouseup', mouseup);
            canvas.addEventListener('mouseleave', mouseup);
        })
        canvas.addEventListener('mouseup', e => {
            this.$emit('mouseup', {
                e,
                x: this._toCanvasX(e.offsetX),
                y: this._toCanvasY(e.offsetY)
            });
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
            // this.$emit('keydown', e);
            // if(this.isReadOnly()) {
            //     return;
            // } else 
            if (e.keyCode == 90 && (navigator.platform.match("Mac") ? e.metaKey : e.ctrlKey)) {
                // ctrl + z
                this.historys.restore();
            }else if (e.keyCode == 89 && (navigator.platform.match("Mac") ? e.metaKey : e.ctrlKey)) {
                // ctrl + y
                // this.historys.forward();
            } else if (e.keyCode == 46){
                // delete
                this.deleteSelected();
            } else if(e.keyCode == 65 && (navigator.platform.match("Mac") ? e.metaKey : e.ctrlKey)) {
                // ctrl + a
                let ids = [];
                this.$children.forEach(item => {
                    if(item.$block) ids.push(item.$uid);
                });
                this.clearSelected(ids)
                e.preventDefault();
            } else if (e.keyCode == 67 && (navigator.platform.match("Mac") ? e.metaKey : e.ctrlKey)) {
                // ctrl + c
                copyNodeIds = this.selecteds;
                console.log('copyNodeids', copyNodeIds);
            } else if (e.keyCode == 86 && (navigator.platform.match("Mac") ? e.metaKey : e.ctrlKey)) {
                // ctrl + v
                if(copyNodeIds) {
                    let list = [];
                    copyNodeIds.forEach(id => {
                        let node = this._nodeMap[id];
                        let data = deepClone(node.data);
                        data.bounds.x += 20;
                        data.bounds.x += 20;
                        list.push(data);
                    })
                    this.loopNodeList(list);
                }
                copyNodeIds = null;
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
            this._renderBg(); // 渲染背景
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
            let ex = x*this.ratio,
                ey = y*this.ratio;
            return this.getEdgeByPoint(ex, ey); // 暂时只对edge处理
        }
    }
    getEdgeByPoint(x, y) { // 特例：通过point获取edge或其子元素
        let _findEdge = function (childrens) {
            for(let i=0,item; i<childrens.length,item=childrens[i]; i++) {
                if(item.$children && item.$block) {
                    let t = _findEdge(x, y);
                    if(t) {
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
            if(!item.$block && item.$isHere) {
                if(item.$children && item.$children.length>0) {
                    let t = _findEdge(item.$children);
                    if(t) {
                        return t;
                    }
                }

                if(item.$isHere(x, y)) {
                    return item;
                }
            }
        }
    }
    // 根据range范围 获取其内的子节点(仅限根目录下的节点)
    getChildByRange(x1, y1, x2, y2) {
        let ids = this.Grid.checkRange(x1, y1, x2, y2);
        let childrens = this.$children.filter(item => {
            return ids.indexOf(''+item.$uid)>-1
        })
        this.selecteds = childrens.map(item => item.$uid);
        return childrens;
    }
    deleteSelected() {
        this.historys.recordDelete(this.selecteds);
        this.selecteds.forEach(uid => {
            let node = this._nodeMap[uid];
            this.flowData.delData(node.data);
            node.$destroy();
        })
        this.selecteds = [];
        this.repaint();
    }
    clearHover(ids = []) { // 除ids中以外的节点，清空hover状态
        this.$children.forEach(node => {
            if(ids.indexOf(node.$uid) === -1) {
                // node.isHover = false;
                node.$hover && node.$hover(false);
            }
        })
        for(let key in this._nodeMap) {
            let node = this._nodeMap[key];
            if(node.$type === 'edge' && ids.indexOf(node.$uid) === -1) {
                node.$hover && node.$hover(false);
            }
        }
    }
    clearSelected(ids = []) { // 除ids中以外的节点，清空selected状态
        this.$children.forEach(node => {
            if(ids.indexOf(node.$uid) === -1) {
                node.$click && node.$click(false);
            }else {
                node.$click && node.$click(true);
            }
        })
        for(let key in this._nodeMap) {
            let node = this._nodeMap[key];
            if(!node.$block && node.$isHere && ids.indexOf(node.$uid) === -1) {
                node.$click && node.$click(false);
            }else if(!node.$block && node.$isHere) {
                node.$click && node.$click(true);
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
        this.sc = this.sc * rate;
    }
    translate(tx, ty) {
        this.ctx.translate(tx, ty);
        this.tx = tx;
        this.ty = ty;
        this.repaint();
    }
    translateX(tx) {
        this.ctx.translate(tx, 0);
        this.tx = tx;
        this.repaint();
    }
    translateY(ty) {
        this.ctx.translate(0, ty);
        this.ty = ty;
        this.repaint();
    }
    _getWidth() {
        return this.canvas.width/this.ratio;
    }
    _getHeight() {
        return this.canvas.height/this.ratio;
    }
    _toCanvasX(x) {
        return x / this.sc - this.tx;
    }
    _toCanvasY(y) {
        return y / this.sc - this.ty;
    }
    _renderBg() {
        if(this.isRenderBg) {
            let ctx = this.ctx;
            ctx.beginPath();
            let width = this.$canvas.width;
            let height = this.$canvas.height;
            let steps = 10;
            ctx.lineWidth = 1;
            for (let i = 0.5; i < width; i += steps) {
                ctx.moveTo(i, 0); ctx.lineTo(i, height); 
            } 
            for(let i = 0.5; i < height; i += steps) {
                ctx.moveTo(0, i);
                ctx.lineTo(width, i); 
            } 
            ctx.strokeStyle = '#eee'; 
            ctx.stroke();

            this.ctx.closePath();
        }
    }
}

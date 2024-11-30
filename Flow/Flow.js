import Engine from '../Engine/instance/engine.js';
import units from './units/index.js';
import uae from './uae.js';

function _initData(vm) {
    vm.selRect = null; // 拖动多选框
    vm.guideLine = null; // 引导线
    vm.events = {};
    vm.readyNode = null; // 待放置的节点
    vm._toCanvasX = (...args) => {
        vm.uae._toCanvasX.apply(vm.uae, args)
    };
    vm._toCanvasY = (...args) => {
        vm.uae._toCanvasY.apply(vm.uae, args)
    };
}
function _registerUnit(vm) {
    for(let i=0; i<units.length; i++) {
        let unit = units[i];
        vm.uae.registerComp(unit);
    }
}
function _initUnit(vm) {
    vm.selRect = vm.uae.createNode({
        type: 'selRect',
    })
    vm.guideLine = vm.uae.createNode({
        type: 'guideLine',
    })
    vm.returnBtu = vm.uae.createNode({
        type: 'return',
    })
    vm.dragMap = vm.uae.createNode({
        type: 'dragMap',
    })
}

export default class FlowUnion {
    constructor(canvas, isNode, isBcpt) {
        uae.canvas = canvas;
        
        this.uae = new Engine({
            options: uae,
        })
        this.uae.isNode = isNode;
        this.uae.isBcpt = isBcpt;
        this._init();
    }
    loopNodeList(nodeList) {
        this.uae.loopNodeList(nodeList);
    }
    getNodeList() {
        return this.uae.$children.filter(node => {
            return node.$block;
        });
    }
    // isClick 是否单击放置节点模式
    handleReadNode(data, isClick=false) {
        this.readyNode = data;
        this.isClick = isClick;
    }
    handleCreateNode(data) {
        return this.uae.createNode({
            type: data.nodeType,
            data: data,
        }, true);
    }
    _init() {
        _initData(this);

        _registerUnit(this);

        _initUnit(this);

        this._bind();
    }
    
    _bind() {
        this.uae.$on('dragstart', (event) => {
            this.handleDragStart(event);
        });
        this.uae.$on('drag', (event) => {
            this.handleDrag(event);
        });
        this.uae.$on('dragend', (event) => {
            this.handleDragEnd(event);
        });
        this.uae.$on('click', event => {
            this.handleClick(event);
        })
        this.uae.$on('dblclick', event => {
            // this.handleDblclick(event);
        })
        this.uae.$on('keydown', e => {
            this.handleKeyDown(e);
        })
        this.uae.$on('mouseenter', e => {
            this.handleMouseEnter(e);
        })
    }
    /**
     * @param  {
     *  e, // 鼠标事件
     *  x, // canvas中的坐标
     *  y,
     *  comp, // 坐标下触发的节点
     * } event
     */
    handleDragStart(event) {
        if(!event.comp) {
            this.selRect.handleDragStart(event.x, event.y);
        }
    }
    handleDrag(event) {
        if(!event.comp) {
            this.selRect.handleDrag(event.x, event.y);
        } else if(event.comp.$block && event.comp.$link){
            this.guideLine.calcGuideLine(event.comp);
        }
        
    }
    handleDragEnd(event) {
        this.selRect.handleDragEnd(event.x, event.y);
        this.guideLine.clearGuideLine(event.comp);
    }
    handleClick(event) {
        if(event.comp) {
            console.log('click comp', event.comp);
            this.trigger('click', event.comp);
        }
    }
    handleMouseEnter(event) {
        let node;
        let mousemove = e => {
            if(!this.isClick) {
                node.drag && node.drag(e.x, e.y);
            }
        }
        let mouseup = e => {
            this.uae.$off('mousemove', mousemove);
            this.uae.$off('mouseup', mouseup);
            if(this.isClick) {
                this.readyNode.bounds.x = e.x-60;
                this.readyNode.bounds.y = e.y-15;
                this.handleCreateNode(this.readyNode);
            }else {
                console.log('end e.x, e.y', e.x, e.y)
                node.dragend && node.dragend(e.x, e.x);
            }
            this.readyNode = null;
            this.isClick = null;
            
        }
        if(this.readyNode && this.isClick) {
            this.uae.$on('mouseup', mouseup);
        }else if(this.readyNode){
            // 拖拽进入节点模式
            this.readyNode.bounds.x = event.x;
            this.readyNode.bounds.y = event.y;

            node = this.handleCreateNode(this.readyNode);
            // engine传来的x,y是已经转义过的
            node.dragstart && node.dragstart(event.x, event.y);
            this.uae.$on('mousemove', mousemove);
            this.uae.$on('mouseup', mouseup);
        }
    }
    handleKeyDown(e) {
        if(e.keyCode === 46) {
            this.uae.deleteSelected();
        }
    }
    
    on (name, fn) {
        if (typeof fn !== 'function') {
            return ;
        }
        if (!this.events) {
            this.events = {};
        }
        if (!this.events[name]) {
            this.events[name] = [];
        }
        this.events[name].push(fn);
    }
    trigger(name, comp) {
        if (this.events && this.events[name]) {
            this.events[name].forEach(item => {
                if (typeof item === 'function') {
                    item(comp);
                }
            })
        }
    }
}
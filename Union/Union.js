import Engine from '../Engine/instance/Engine.js';
import units from './units/index.js';
import uae from './uae.js';

export default class FlowUnion {
    constructor(canvas, ratio=1) {
        uae.canvas = canvas;
        
        this.uae = new Engine({
            options: uae,
        })

        // this.uae.scale(1/ratio);
        // this.uae.sc = ratio;
        this._init();
    }
    _init() {
        this._initData();

        this._registerUnit();

        this._initUnit();

        this._bind();
    }
    _initData() {
        this.selRect = null; // 拖动多选框
    }
    _registerUnit() {
        for(let i=0; i<units.length; i++) {
            let unit = units[i];
            this.uae.registerComp(unit);
        }
    }
    _initUnit() {
        this.selRect = this.uae.createNode({
            type: 'selRect',
        })
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
        this.selRect.handleDrag(event.x, event.y);
    }
    handleDragEnd(event) {
        this.selRect.handleDragEnd(event.x, event.y);
    }

    loopNodeList(nodeList) {
        for(let i=0; i<nodeList.length; i++) {
            let node = nodeList[i]
            this.uae.createNode({
                type: node.type,
                data: node,
            })
        }
    }
}
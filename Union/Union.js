import Engine from '../Engine/instance/Engine.js';
import units from './units/index.js';
import uae from './uae.js';

export default class FlowUnion {
    constructor(canvas, ratio=1) {
        uae.canvas = canvas;
        
        this.uae = new Engine({
            options: uae,
            ratio,
        })
        this.uae.ratio = ratio;

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
        this.guideLine = null; // 引导线
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
        this.guideLine = this.uae.createNode({
            type: 'guideLine',
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

    loopNodeList(nodeList) {
        for(let i=0; i<nodeList.length; i++) {
            let node = nodeList[i]
            this.uae.createNode({
                type: node.nodeType,
                data: node,
            })
        }
    }
}
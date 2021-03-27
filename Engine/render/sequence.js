import Engine from '../instance/Engine.js';

// 引入渲染队列机制
export default class RenderSequence { 
    // 方案1：记录每次操作的节点，从而更新节点渲染队列
    // 方案2：每次渲染前将 hover、selected的节点渲染延后(采用)
    constructor(uae) {
        this.uae = uae;
        this.$children = uae.$children;
        this._nodeMap = uae._nodeMap;

        this.sequence = [];

        this.initSeq();
    }
    initSeq() {
        this.sequence = this.$children.map(item => item.id);
    }
    getSequence() { // 拿到渲染队列
        // 渲染优先级: children >> parent;
        //              hover > select > noStatus;
        
        let select = this.getSelect();
        let hover = this.getHover();
        let noStatus = this.$children.filter(item => (select.indexOf(item)===-1) && (hover.indexOf(item)===-1))

        return noStatus.concat(hover, select);
    }
    getSelect() {
        let select = []
        let nodeMap = this._nodeMap;
        Object.keys(nodeMap).forEach(key => {
            if(nodeMap[key].isSelect) {
                select.push(this._findParent(nodeMap[key]));
            }
        })
        return select;
    }
    getHover() {
        let hover = []
        let nodeMap = this._nodeMap;
        Object.keys(nodeMap).forEach(key => {
            if(nodeMap[key].isHover) {
                hover.push(this._findParent(nodeMap[key]));
            }
        })
        return hover;
    }
    // handleCreate(comp) {
    //     this.sequence.push(comp.id);
    // }
    // handleDelete(comp) {
    //     let index = this.sequence.indexOf(comp.id);
    //     if(index !== -1) {
    //         this.sequence.splice(index, 1);
    //     }
    // }
    // handleUpdata(comp) {
    //     comp = this._findParent(comp);
    //     let index = this.sequence.index(comp.id);
    //     if(index !== -1) {
    //         let i = this.sequence.splice(index, 1);
    //         this.sequence.push(i);
    //     }
    // }
    _findParent(comp) {
        if(comp.$parent instanceof Engine) {
            return comp;
        }else if(!comp.$parent) {
            return null;
        }else {
            return this._findParent(comp.$parent);
        }
    }

}
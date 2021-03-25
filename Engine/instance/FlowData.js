class FlowData {
    constructor() {
        this.list = [];
        this.map = {};
    }
    pushData(node) {
        this.list.push(node);
        this.map[node.id] = node;
    }
    pushDatas(nodes) {
        if(Array.isArray) {
            this.list.push(...nodes);
            for(let i=0;i<nodes.length;i++) {
                let node = nodes[i];
                this.map[node.id] = node;
            }
        }
    }
    delData(node) {
        let index = this.list.indexOf(node);
        if(index !== -1) {
            this.list.splice(this.list.indexOf(node), 1);
            delete this.map[node.id];
        }
    }
    delDatas(nodes) {
        nodes.forEach(node => {
            let index = this.list.indexOf(node);
            if(index !== -1) {
                this.list.splice(this.list.indexOf(node), 1);
                delete this.map[node.id];
            }
        })
    }
    getDataById(id) {
        return this.map[id];
    }
}
FlowData.getInstance = (function() {
    let instance = null;
    return function() {
        if(!instance) instance = new FlowData();
        return instance;
    }
})()

export default FlowData;
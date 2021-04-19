export default class Drill {
    // 下钻原则：销毁节点，保存数据，每次下钻或者上探都根据数据生成节点；
    constructor(uae) {
        this.uae = uae;
        this.stack = [];
    }
    // 下钻
    drillUae(address) {
        let children = this.uae.$children;
        let datas = [];

        // 清除nodeMap
        // this.clearNodeMap(children.filter(item => item.$block));
        // 清空现有画布
        for(let i=children.length-1; i>=0; i--) {
            let node = children[i];
            if(node.$block) {
                // nodes.push(children.splice(i, 1)[0]);
                datas.push(node.data);
                node.$destroy(false);
            }
        }
        // 清空历史记录
        this.uae.historys.clearHistory();
        // 清空障碍物地图
        this.uae.Grid.clearGrid();
        // 推入缓存栈
        this.stack.push(datas)
        this.uae.isNode = true;
        // 根据子节点生成下钻后的画布
        this.uae.loopNodeList(address);
        this.uae.repaint();
    }
    // 还原
    popUae() {
        if(this.stack.length>0) {
            let children = this.uae.$children;
            // 清空现有画布
            for(let i=children.length-1; i>=0; i--) {
                let node = children[i];
                if(node.$block) {
                    node.$destroy(false);
                }
            }
            // 清空历史记录
            this.uae.historys.clearHistory();
            // 插入上次保存的数据
            let list = this.stack.pop();
            // 根据list生成还原后的画布
            this.uae.loopNodeList(list);
            // 还原nodeMap
            // this.setNodeMap(list);
            // 还原children
            // children.push(...list);
            // 还原grid地图
            // this.uae.Grid.loopAllNodes(list);
            this.uae.repaint();
        }
        if(this.stack.length === 0) this.uae.isNode = false;
    }
    clearNodeMap(list) {
        let nodeMap = this.uae._nodeMap;
        for(let i=0;i<list.length;i++) {
            delete nodeMap[list[i].$uid];

            if(list[i].$children && list[i].$children.length>0) {
                this.clearNodeMap(list[i].$children);
            }
        }
    }
    setNodeMap(list) {
        let nodeMap = this.uae._nodeMap;
        for(let i=0;i<list.length;i++) {
            nodeMap[list[i].$uid] = list[i];

            if(list[i].$children && list[i].$children.length>0) {
                this.setNodeMap(list[i].$children);
            }
        }
    }
}
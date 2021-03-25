export default class Drill {
    constructor(uae) {
        this.uae = uae;
        this.stack = [];
    }
    // 下钻
    drillUae(comp) {
        let children = this.uae.$children;
        let ret = [];
        let data = comp.data;
        // 清空现有画布
        for(let i=children.length-1; i>=0; i--) {
            let node = children[i];
            if(node.$block) {
                ret.push(children.splice(i, 1)[0]);
            }
        }
        // 清空历史记录
        this.uae.histroys.clearHistory();
        // 清空障碍物地图
        this.uae.Grid.clearGrid();
        // 推入缓存栈
        this.stack.push(ret)
        // 清除nodeMap
        this.clearNodeMap(ret);
        // 判断子节点
        if(!data.implementation) data.implementation = { node: [] };
        else if(!Array.isArray(data.implementation.node)) data.implementation.node = [];
        // 根据子节点生成下钻后的画布
        this.uae.loopNodeList(data.implementation.node);
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
                    // children.splice(i, 1);
                    node.$destroy();
                }
            }
            // 清空历史记录
            this.uae.histroys.clearHistory();
            // 插入上次保存的数据
            let list = this.stack.pop();
            // 还原nodeMap
            this.setNodeMap(list);
            // 还原children
            children.push(...list);
            // 还原grid地图
            this.uae.Grid.loopAllNodes(list);
            this.uae.repaint();
        }
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
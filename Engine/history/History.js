export default class History {
    /**
     * @历史记录  {
     *  type, 类型：delete,move
     *  ids, 操作的节点的$uid
     *  data, 操作的对象的引用
     *  from, 操作发生的数据
     *  to, 操作发生后的数据
     * } event
     */
    constructor(uae) {
        this.historyLow = -1;
        this.historyHigh = -1;
        this.historys = [];
        this.uae = uae;
    }
    restore() {
        if (this.historyLow >= 0) {
            let history = this.historys[this.historyLow--];
            switch (history.type){
                case 'create': 
                    this.restoreCreate(history.data);
                    break;
                case 'delete':
                    this.restoreDelete(history.list);
                    break;
                case 'move':
                    this.restoreMove(history.list);
                    break;
                default: 
                    break;
            };
        }
    }
    forward() {
        if(this.historyLow < this.historyHigh) {
            // let history = this.historys[++this.historyLow];
            // switch (history.type){
            //     case 'create': 
            //         this.forWardCreate(history.list);
            //         break;
            //     case 'delete':
            //         this.forWardDelete(history.list);
            //         break;
            //     case 'move':
            //         this.forWardMove(history.list);
            //         break;
            //     default: 
            //         break;
            // };
        }
    }
    // 记录新增节点
    recordCreate(data) {
        this.historys[++this.historyLow] = {
            type: 'create',
            data: data,
        }
        this.historyHigh = this.historyLow;
    }
    // 记录删除数据
    recordDelete(ids) {
        let history = {
            type: 'delete',
            list: [],
        };
        this.historyLow++;
        for(let i=0; i<ids.length; i++){
            let node = this.uae._nodeMap[ids[i]];
            if(node.$type!=='edge') {
                history.list.push({
                    data: node.data,
                });
            }
            
        }
        this.historys[this.historyLow] = history;
        this.historyHigh = this.historyLow;
    }
    // 记录移动数据
    recordMove(ids) {
        let history = {
            type: 'move',
            list: [],
        };
        this.historyLow++;
        for(let i=0; i<ids.length; i++){
            let node = this.uae._nodeMap[ids[i]];
            // 为了垃圾回收机制，此处不能直接存储node的引用，
            // 存储id可能会出现该节点被删除后新建，id前后不同，
            // 所以此处只能存储data引用
            history.list.push({
                data: node.data,
                origin: {
                    x: node.bounds.x,
                    y: node.bounds.y,
                }
            });
        }
        this.historys[this.historyLow] = history;
        this.historyHigh = this.historyLow;
    }
    // 复原新建
    restoreCreate(data) {
        for(let i=0; i<this.uae.$children.length; i++) {
            if(this.uae.$children[i].data === data) {
                this.uae.$children[i].$destroy();
                break;
            }
        }
    }
    // 复原移动
    restoreMove(list) {
        for(let i=0;i<list.length;i++) {
            let data = list[i].data;
            let origin = list[i].origin;
            for(let i=0; i<this.uae.$children.length; i++) {
                if(this.uae.$children[i].data === data) {
                    let node = this.uae.$children[i];
                    node.recordDragStart();
                    data.bounds.x = origin.x;
                    data.bounds.y = origin.y;
                    node.recordDragEnd();
                    break;
                }
            }
            
        }
    }
    // 复原删除
    restoreDelete(list) {
        
        for(let i=0;i<list.length;i++) {
            let data = list[i].data;
            this.uae.createNode({
                type: data.nodeType,
                data: data,
            })
        }
        
    }
    
    clearHistory() {
        this.historyHigh = -1;
        this.historyLow = -1;
        this.historys = [];
    }
}
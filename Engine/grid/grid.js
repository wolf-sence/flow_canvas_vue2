class Grid {
    // 障碍物地图
    constructor() {
        // 使用二维Map记录障碍物坐标，一维是x，二维是y
        this.grid = new Map();
        // 以10px为一个单位进行记录
        this.rate = 5;
        
        this.startBounds = null;

    }
    // 检查 (x, y)点是否存在节点障碍物
    checkPoint(x, y) {
        let minX = this.getRoundVal(x),
            minY = this.getRoundVal(y);
        if(this.grid.has(minX)) {
            let ids =  this.grid.get(minX).get(minY);
            return ids && ids.split(',');
        }
        return;
    }
    // 处理删除节点事件
    handleDelete(node) {
        let _delChildren = comps => {
            // 字节点坐标也需要更新
            for(let i=0; i<comps.length; i++) {
                let comp = comps[i];
                if (!comp.$block) return;
                let bound = this.getRateBound(comp.bounds);
                this.delete(bound.xs, bound.ys, bound.xe, bound.ye, comp.id);

                if(comp.$children && comp.$children.length>0 ) {
                    _delChildren(comp.$children);
                }
            }
            return;
        }
        if(node.$block) {
            _delChildren([node]);
        }
    }
    // 处理增加节点事件
    handleUpdate(node) {
        let _updateChildren = comps => {
            // 字节点坐标也需要更新
            for(let i=0; i<comps.length; i++) {
                let comp = comps[i];
                if (!comp.$block) return;
                
                let bound = this.getRateBound(comp.bounds);
                if(bound.xs === bound.xe) bound.xe++;
                if(bound.ys === bound.ye) bound.ye++;
                this.create(bound.xs, bound.ys, bound.xe, bound.ye, comp.id);

                if(comp.$children && comp.$children.length>0) {
                    _updateChildren(comp.$children);
                }
            }
            return;
        }
        if(node.$block) {
            _updateChildren([node]);
        }
    }
    // 一次性 循环所有节点的，生成障碍物地图
    loopAllNodes(nodeList) {
        this.clearGrid();
        for(let i=0; i<nodeList.length; i++) {
            let node = nodeList[i];
            let bound = this.getRateBound(node.bounds);

            this.create(bound.xs, bound.ys, bound.xe, bound.ye, node.id);
        }
    }
    // 删除节点
    delete(xs, ys, xe, ye, id) {
        let gridX = this.grid, gridY;

        for(let i=xs; i<=xe; i++) {
            // 拿到x对应的那个YMap
            gridY = gridX.get(i);

            for(let j=ys; j<=ye; j++) {
                let valueY = gridY && gridY.get(j);
                if(valueY) {
                    let arr = valueY.split(',');
                    let index = arr.indexOf('' + id)
                    if(index!==-1) {
                        arr.splice(index, 1);
                    }

                    if(arr.length === 0) gridY.delete(j);
                    else {
                        gridY.set(j, arr.join(','));
                    }
                }
            }
            if(!gridY || gridY.size === 0) gridX.delete(i);
            gridY = null;
        }
    }
    // 增加节点
    create(xs, ys, xe, ye, id) {
        let gridX = this.grid, gridY;

        for(let i=xs; i<=xe; i++) {
            // 拿到x对应的那个YMap
            if(gridX.has(i)) {
                gridY = gridX.get(i);
            }else {
                gridY = new Map();
                gridX.set(i, gridY);
            }
            for(let j=ys; j<=ye; j++) {
                if(!gridY.has(j)) gridY.set(j, `${id}`);
                else {
                    // 该点存在另一个已经被绘制的节点
                    let valueY = gridY.get(j);
                    let arr = valueY.split(',');
                    arr.push(id);
                    gridY.set(j, arr.join(','));
                }
            }
        }
    }
    // 清空障碍物地图
    clearGrid() {
        this.grid = new Map();
    }
    // 根据比例 得到 坐标
    getRateBound(bounds) {
        let xs = this.getMinVal(bounds.x),
            ys = this.getMinVal(bounds.y),
            xe = this.getMaxVal(bounds.x + bounds.width),
            ye = this.getMaxVal(bounds.y + bounds.height);
        return {
            xs,
            ys,
            xe,
            ye,
        }
    }
    getMinVal(val) { // 向下取整
        return Math.floor(val/this.rate);
    }
    getMaxVal(val) { // 向上取整
        return Math.ceil(val/this.rate);
    }
    getRoundVal(val) { // 四舍五入
        return Math.round(val/this.rate);
    }
}
Grid.getInstance = (function() {
    let instance = null;
    return function() {
        if(!instance) instance = new Grid();
        return instance;
    }
})()

export default Grid;
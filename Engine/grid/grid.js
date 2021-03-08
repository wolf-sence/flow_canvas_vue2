class Grid {
    // 障碍物地图
    constructor() {
        // 使用二维Map记录障碍物坐标，一维是x，二维是y
        this.grid = new Map();
        // 以10px为一个单位进行记录
        this.rate = 5;

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
        let bound = this.getRateBound(node.bounds);

        this.delete(bound.xs, bound.ys, bound.xe, bound.ye, node.id);
    }
    // 处理增加节点事件
    handleCreate(node) {
        let bound = this.getRateBound(node.bounds);
        if(bound.xs === bound.xe) bound.xe++;
        if(bound.ys === bound.ye) bound.ye++;
        this.create(bound.xs, bound.ys, bound.xe, bound.ye, node.id);
    }
    // 处理移动节点事件
    handleMove(start, end, comp) {
        let _findChildren = function(comps) {
            // 字节点坐标也需要更新
            let ids = [];
            for(let i=0; i<comps.length; i++) {
                ids.push(comps[i].id);
                if(comps[i].$cildren && comp[i].$children.length>0) {
                    ids = ids.concat(_findChildren(comps[i].$cildren));
                }
            }
            return ids;
        }
        let ids = [comp.id];
        if(comp.$children && comp.$children.length>0) ids = ids.concat(_findChildren(comp.$children));

        this.move(start, end, ids);
        
    }
    move(start, end, ids) {
        console.log('start, end, ids', start, end, ids);
        let startBound = this.getRateBound(start);

        this.delete(startBound.xs, startBound.ys, startBound.xe, startBound.ye, ids);

        let endBound = this.getRateBound(end);
        
        this.create(endBound.xs, endBound.ys, endBound.xe, endBound.ye, ids);
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
    delete(xs, ys, xe, ye, ids) {
        if(!Array.isArray(ids)) ids = [ids];

        let gridX = this.grid, gridY;
        for(let i=xs; i<=xe; i++) {
            // 拿到x对应的那个YMap
            gridY = gridX.get(i);

            for(let j=ys; j<=ye; j++) {
                let valueY = gridY && gridY.get(j);
                if(valueY) {
                    let arr = valueY.split(',');
                    ids.forEach(id => {
                        // console.log('---id', id, arr);
                        let index = arr.indexOf(id)
                        if(index!==-1) arr.splice(index, 1);
                    })
                    if(arr.length === 0) gridY.delete(j);
                    else {
                        gridY.set(j, arr.join(','));
                    }
                }
            }
            if(gridY.size === 0) gridX.delete(i);
            gridY = null;
        }
    }
    // 增加节点
    create(xs, ys, xe, ye, ids) {
        if(!Array.isArray(ids)) ids = [ids];

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
                if(!gridY.has(j)) gridY.set(j, `${ids.join(',')}`);
                else {
                    // 该点存在另一个已经被绘制的节点
                    let valueY = gridY.get(j);
                    let arr = valueY.split(',');
                    // arr.unshift(id); // 绘制越靠后，排序越前
                    // arr.push(id);
                    arr.concat(ids);
                    gridY.set(j, arr.join(','));
                    // if(Array.isArray(valueY)) valueY.unshift(id); 
                    // else valueY = [valueY, id];
                    // gridY.set(j, valueY);
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
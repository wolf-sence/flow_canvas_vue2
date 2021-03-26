// 通用组件

export default {
    name: 'common',
    mixin: 'step',
    dblclick(x, y) {
        // 判断子节点
        let data = this.data;
        if(!data.implementation) data.implementation = { node: [] };
        else if(!Array.isArray(data.implementation.node)) data.implementation.node = [];
        // 将此引用传入 下钻视图内，则下钻后的所有节点操作都基于此引用；
        this.$uae.drill.drillUae(data.implementation.node);
    },
    data: {
        mainColor: '#374E71',
    }
}
// 通用组件

export default {
    name: 'common',
    mixin: 'step',
    dblclick(x, y) {
        this.$uae.drill.drillUae(this);
    },
    data: {
        mainColor: '#374E71',
    }
}
// 通用组件

export default {
    name: 'common',
    mixin: 'step',
    dblclick(event) {
        console.log('common 双击')
    },
    data: {
        mainColor: '#374E71',
    }
}
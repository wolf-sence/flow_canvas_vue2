// 多出口组件

export default {
    name: 'multOutput',
    mixin: 'step',
    data: {
        mainColor: '#07B6B5',
    },
    dblclick(event) {
        console.log('多出口 双击')
    },
}
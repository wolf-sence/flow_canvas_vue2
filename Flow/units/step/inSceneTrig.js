// 场景内部调用

export default {
    name: 'inSceneTrig',
    mixin: 'step',
    data: {
        mainColor: '#0095FF',
    },
    dblclick(event) {
        console.log('内部场景调用 双击')
    },
}
export default {
    canvas: null,
    data: {
        isRenderBg: false, // 是否渲染 背景
        isDrill: false, // 是否处于下钻状态
        autoAdsorpt: false, // 是否自动根据准线吸附
        isNode: false,
        isBcpt: false,
    },
    created() {

    },
    dragstart(event) {

    },
    drag(event) {

    },
    dragend(event) {

    },
    methods: {
        toggleBackground(val) {
            this.isRenderBg = val;
            this.repaint();
        }
    },
}
export default {
    canvas: null,
    data: {
        isRenderBg: false, // 是否渲染 背景
        isDrill: false, // 是否处于下钻状态
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
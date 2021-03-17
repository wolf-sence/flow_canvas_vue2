export default {
    canvas: null,
    data: {
        isRenderBg: false, // 是否渲染 背景
        selRect: null, // 拖动多选框
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
    }
}
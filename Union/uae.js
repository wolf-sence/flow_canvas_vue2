export default {
    canvas: null,
    data: {
        isRenderBg: false, // 是否渲染 背景
    },
    methods: {
        toggleBackground(val) {
            this.isRenderBg = val;
            this.repaint();
        }
    }
}
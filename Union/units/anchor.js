export default {
    template: '<edge v-if="hasEdge"></edge>',
    name: 'anchor',
    props: ['output', 'index'],
    cursor: 'crosshair',
    link: false,
    data: {
        isHover: false,
        color: '#F69E9E',
        hasEdge: false,
        edge: null,
    },
    draw() {
        let ctx = this.ctx;
        ctx.beginPath();
        
        ctx.arc(this.bounds.x+this.bounds.width, this.bounds.y, this.bounds.width, 0, 2 * Math.PI);
        ctx.lineWidth = 2;
        ctx.fillStyle = 'rgb(232, 247, 249)';
        ctx.fill();
        
        ctx.strokeStyle = this.output.status == 'notExecute' ? '#C0C4CC' : this.output.color;
        ctx.stroke();
        ctx.closePath();
    },
    dragstart(x, y) {
        this.hasEdge = false;
        this.hasEdge = true;
        this.edge = this.$children[0];
        this.edge && this.edge.handleDragStart(x, y);
        
    },
    drag(x, y) {
        this.edge && this.edge.handleDrag(x, y);
    },
    dragend(x, y) {
        if(this.edge) {
            this.hasEdge = this.edge.handleDragEnd(x, y);
            this.edge = null;
        }
    },
    methods: {
        calcLocation(node) { // 计算该节点 被线条附着时的 坐标
            let bounds = node.bounds;
            return {
                x: bounds.x + bounds.width/2,
                y: bounds.y - 1,
            }
        },
    },
    computed: {
        'bounds': function() {
            let data = this.$parent.data;
            // let pbounds = data.bounds;
            let pbounds  = this.$parent.bounds;
            let size = parseInt(pbounds.width / (data.output.length + 1));
            let r = 4;
            // 原型绘图，坐标需要 以左上角为单位
            let x = pbounds.x + size * (this.index + 1) - r,
            y = pbounds.y + pbounds.height + 1;
            return {
                x: x,
                y: y,
                width: r,
                height: r,
            }
        },
    },
    watch: {
        hasEdge(newVal, oldVal) {
            console.log('enter watch hasEdge', newVal);
        }
    }
}

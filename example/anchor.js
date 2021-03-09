export default {
    template: '<edge v-if="hasEdge" :start="startPoints" :end="endPoints"></edge>',
    name: 'anchor',
    props: ['output', 'index', 'boundss'],
    cursor: 'crosshair',
    link: false,
    data: {
        isHover: false,
        color: '#F69E9E',
        hasEdge: false,
        endPoints: {
            x: null,
            y: null,
            width: null,
            height: null,
        }
    },
    draw() {
        let ctx = this.ctx;
        let data = this.$parent.data;
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
        this.endPoints.x = x;
        this.endPoints.y = y;
        this.hasEdge = true;
        console.log('---dragStart--- ')
    },
    drag(x, y) {
        let comp = this.$uae.getCompByPoint(x, y, x, y);
        if(comp && comp.$link) {
            this.endPoints = comp.bounds;
        } else {
            this.endPoints.x = x;
            this.endPoints.y = y;
            this.endPoints.width = null;
            this.endPoints.height = null;
        }
    },
    dragend(x, y) {
        let comp = this.$uae.getCompByPoint(x, y, x, y);
        if(!comp || !comp.$link) {
            // 没有/不允许 附着至节点时，取消线条连接
            this.hasEdge = false;
            this.endPoints.width = null;
            this.endPoints.height = null;
        }
    },
    mounted() {
        console.log('重新渲染 anchor')
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
            let pbounds = data.bounds;
            let size = parseInt(data.bounds.width / (data.output.length + 1));
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

export default {
    name: 'dragDot',
    cursor: 'crosshair',
    block: false,
    link: false,
    data: {
        isHover: false,
        endPoints: null,
    },
    draw() {
        let ctx = this.ctx;
        ctx.beginPath();
        this.createPath();
        ctx.lineWidth = 1;
        ctx.fillStyle = '#5688FA';
        ctx.fill();
        ctx.closePath();
    },
    // 注意 canvas 原生isPointInPath无法检测fillRect、strokeRect
    isHere(x, y) {
        this.ctx.beginPath();
        this.createPath();
        for(let i=-1;i<=3;i++) { // 扩大选择范围
            if(this.ctx.isPointInPath(x+i, y)) {
                return true;
            }
            if(this.ctx.isPointInPath(x, y+i)) {
                return true;
            }
        }
        return false;

    },
    dragstart(x, y) {
        this.endPoints = this.$parent.end
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
    methods: {
        createPath() {
            this.ctx.arc(this.bounds.x+this.bounds.width/2, this.bounds.y, this.bounds.width, 0, 2 * Math.PI);
        }
    },
    computed: {
        'bounds': function() {
            let path = this.$parent.path;
            let endPath = path.slice(-1)[0];
            let width = 4, height = 4;
            let x = endPath.x - width/2;
            let y = endPath.y - height;
            return {
                x,
                y,
                width,
                height,
            }
        },
    },
}

export default {
    name: 'dragDot',
    cursor: 'crosshair',
    block: false,
    link: false,
    data: {
        isHover: false,
        isSelect: false,
    },
    draw() {
        let ctx = this.ctx;
        ctx.lineWidth = 1;
        this.createPath();
        if(this.$parent.isSelect) {
            this.drawColor();
        }
        if(this.isSelect) {
            this.drawColor();
        }
        ctx.closePath();
    },
    dragstart(x, y) {
        this.$parent.handleDragStart(x, y, true);
    },
    drag(x, y) {
        this.$parent.handleDrag(x, y);
    },
    dragend(x, y) {
        this.$parent.handleDotDragEnd(x, y);
    },

    methods: {
        createPath() {
            let ctx = this.ctx;
            ctx.beginPath();

            if(!this.bounds) return;

            ctx.rect(this.bounds.x-4, this.bounds.y-8, this.bounds.width, this.bounds.height)
        },
        drawColor() {
            let ctx = this.ctx;
            ctx.fillStyle = '#fff';
            ctx.fill();
            ctx.strokeStyle = 'black'
            ctx.stroke();
        }
    },
    computed: {
        'bounds': function() {
            let path = this.$parent.path;
            if(!path) return null;
            let endPath = path.slice(-1)[0];
            let width = 8, height = 8;
            let x = endPath.x;
            let y = endPath.y;
            return {
                x,
                y,
                width,
                height,
            }
        },
    },
    // 注意 canvas 原生isPointInPath无法检测fillRect、strokeRect
    isHere(x, y) {
        this.ctx.beginPath();
        if(!this.bounds) return false;
        // console.log('此时 dragdot bounds 非空，在判断')
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
    hover(val) {
        this.isHover = val
    },
    click(val) {
        this.isSelect = val;
    },
}

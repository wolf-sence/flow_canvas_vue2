export default {
    name: 'selRect',
    link: false,
    dragable: false,
    block: false,
    data: {
        x1: 0,
        y1: 0,
        x2: 0,
        y2: 0,
        isSelRect: false, // 是否在拖动多选框模式
    },
    draw() {
        if (this.x1 !== this.x2 || this.y1 !== this.y2) {
            this.ctx.beginPath();
            this.ctx.rect(this.x1, this.y1, this.x2 - this.x1, this.y2 - this.y1);
            this.ctx.fillStyle = '#E6E6E8';
            this.ctx.fill();
            // this.ctx.lineWidth = 0.5;
            this.ctx.strokeStyle = 'rgba(100, 100, 100, .3)';
            this.ctx.stroke();
            this.ctx.closePath();
        }
    },
    methods: {
        handleDragStart(x, y) {
            this.x1 = x;
            this.y1 = y;
            this.isSelRect = true;
        },
        handleDrag(x, y) {
            if(this.isSelRect) {
                this.x2 = x;
                this.y2 = y;
            }
        },
        handleDragEnd(x, y) {
            if(this.isSelRect) {
                let uae = this.$uae;
                let minX, maxX, minY, maxY;
                if(this.x1>=this.x2) {
                    maxX = this.x1;
                    minX = this.x2;
                }else {
                    maxX = this.x2;
                    minX = this.x1;
                }
                if(this.y1>=this.y2) {
                    maxY = this.y1;
                    minY = this.y2;
                }else {
                    maxY = this.y2;
                    minY = this.y1;
                }

                let childrens = uae.getChildByRange(minX, minY, maxX, maxY);
                
                childrens.forEach(item => {
                    item.isSelect = true;
                })
            }
            this.isSelRect = false;
            this.x1 = 0;
            this.y1 = 0;
            this.x2 = 0;
            this.y2 = 0;
        },
    },
}
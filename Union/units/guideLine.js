// 引导线
export default {
    name: 'guideLine',
    dragable: false,
    link: false,
    block: false,
    data: {
        guideX: [],
        guideY: [],
        mainColor: 'rgba(0, 144, 255, 0.5)',
    },
    draw() {
        if(this.guideX.length>0) {
            // console.log('渲染guide X');
            this._drawVerticalLine();
        }
        if(this.guideY.length>0) {
            this._drawHorizontalLine();
        }
    },
    methods: {
        _drawVerticalLine() {
            let ctx = this.ctx;
            for(let i=0,x;i<this.guideX.length,x=this.guideX[i];i++) {
                // console.log('params', this.$uae.ty, this.$uae._getHeight(), x)
                ctx.moveTo(x, 0 - this.$uae.ty);
                ctx.lineTo(x, this.$uae._getHeight() - this.$uae.ty);
                ctx.strokeStyle = this.mainColor;
                ctx.lineWidth = 2;
                ctx.stroke();
            }
        },
        _drawHorizontalLine() {
            let ctx = this.ctx;
            for(let i=0,y;i<this.guideY.length,y=this.guideY[i];i++) {
                ctx.moveTo(0 - this.$uae.tx, y);
                ctx.lineTo(this.$uae._getWidth() - this.$uae.tx, y);
                ctx.strokeStyle = this.mainColor;
                ctx.lineWidth = 2;
                ctx.stroke();
            }
            // ctx.beginPath();
            
        },
        calcGuideLine(comp) {
            let selecteds = this.$uae.selecteds;
            let unselecteds = this.$uae.$children.filter(n => n.$block && n.id!==comp.id);
            let verticals = [], horizontals = [];
            selecteds.forEach(id => {
                let item = this.$uae._nodeMap[id];
                let left = item.bounds.x,
                    center = item.bounds.x+item.bounds.width/2, // 中竖
                    right = item.bounds.x+item.bounds.width,
                    top = item.bounds.y,
                    middle = item.bounds.y+item.bounds.height/2,
                    bottom = item.bounds.y+item.bounds.height;
                unselecteds.forEach(item => {
                    let left1 = item.bounds.x,
                        center1 = item.bounds.x+item.bounds.width/2,
                        right1 = item.bounds.x+item.bounds.width,
                        top1 = item.bounds.y,
                        middle1 = item.bounds.y+item.bounds.height/2,
                        bottom1 = item.bounds.y+item.bounds.height;
                    if (center == left1 || center == center1 || center == right1) {
                        verticals.push(center);
                    } else if (left == left1 || left == center1 || left == right1) {
                        verticals.push(left);
                    } else if (right == left1 || right == center1 || right == right1) {
                        verticals.push(right);
                    }
                    if (middle == top1 || middle == middle1 || middle == bottom1) {
                        horizontals.push(middle);
                    } else if (top == top1 || top == middle1 || top == bottom1) {
                        horizontals.push(top);
                    } else if (bottom == top1 || bottom == middle1 || bottom == bottom1) {
                        horizontals.push(bottom);
                    }
                })
            })
            this.clearGuideLine();

            this.guideX = verticals;
            this.guideY = horizontals;
        },
        clearGuideLine() {
            this.guideX.splice(0, this.guideX.length);
            this.guideY.splice(0, this.guideY.length);
        }
    },
}
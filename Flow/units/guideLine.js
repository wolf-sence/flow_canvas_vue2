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
        diffVal: 5, // 自动吸附的差值
    },
    draw() {
        if(this.guideX.length>0) {
            this._drawVerticalLine();
        }
        if(this.guideY.length>0) {
            this._drawHorizontalLine();
        }
    },
    methods: {
        _drawVerticalLine() { // 垂直的线
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
            let autoAdsorpt = this.$uae.autoAdsorpt; // 是否贴边自动吸附;

            this.clearGuideLine();
            if(selecteds.length>1) return;
            selecteds.forEach(id => {
                let itemS = this.$uae._nodeMap[id];
                let left = itemS.bounds.x,
                    center = itemS.bounds.x+itemS.bounds.width/2, // 中竖
                    right = itemS.bounds.x+itemS.bounds.width,
                    top = itemS.bounds.y,
                    middle = itemS.bounds.y+itemS.bounds.height/2,
                    bottom = itemS.bounds.y+itemS.bounds.height;
                unselecteds.forEach(item => {
                    let left1 = item.bounds.x,
                        center1 = item.bounds.x+item.bounds.width/2,
                        right1 = item.bounds.x+item.bounds.width,
                        top1 = item.bounds.y,
                        middle1 = item.bounds.y+item.bounds.height/2,
                        bottom1 = item.bounds.y+item.bounds.height;
                    // 暂时取消 线条吸附
                    // if(autoAdsorpt) {
                    //     let val = this.adsorpt(left,center,right,top,middle,bottom,left1,center1,right1,top1,middle1,bottom1);
                    //     if(val) console.log('val', val, itemS, item);
                    //     if(val && 'x' in val) itemS.bounds.x += val.x;
                    //     if(val && 'y' in val) itemS.bounds.y += val.y;
                    // }else {
                        this.judgeLine(left,center,right,top,middle,bottom,left1,center1,right1,top1,middle1,bottom1);
                    // }
                })
            })
            
        },
        judgeLine(left,center,right,top,middle,bottom,left1,center1,right1,top1,middle1,bottom1) {
            if (center == left1 || center == center1 || center == right1) {
                this.guideX.push(center);
            } else if (left == left1 || left == center1 || left == right1) {
                this.guideX.push(left);
            } else if (right == left1 || right == center1 || right == right1) {
                this.guideX.push(right);
            }
            if (middle == top1 || middle == middle1 || middle == bottom1) {
                this.guideY.push(middle);
            } else if (top == top1 || top == middle1 || top == bottom1) {
                this.guideY.push(top);
            } else if (bottom == top1 || bottom == middle1 || bottom == bottom1) {
                this.guideY.push(bottom);
            }
        },
        // 西东吸附条件下,仅展示一条准线,节约性能,避免吸附冲突
        adsorpt(left,center,right,top,middle,bottom,left1,center1,right1,top1,middle1,bottom1) {
            let val;
            val = this.calDiff(center, left1, center1, right1);
            if(val!==undefined && val!==null && !Number.isNaN(val)) {
                this.guideX.push(center);
                return { x: val }
            }
            val = this.calDiff(left, left1, center1, right1);
            if(val!==undefined && val!==null && !Number.isNaN(val)) {
                this.guideX.push(left);
                return { x: val }
            }
            val = this.calDiff(right, left1, center1, right1);
            if(val!==undefined && val!==null && !Number.isNaN(val)) {
                this.guideX.push(right);
                return { x: val }
            }

            val = this.calDiff(middle, top1, middle1, bottom1);
            if(val!==undefined && val!==null && !Number.isNaN(val)) {
                this.guideY.push(middle);
                return { y: val }
            }
            val = this.calDiff(top, top1, middle1, bottom1);
            if(val!==undefined && val!==null && !Number.isNaN(val)) {
                this.guideY.push(top);
                return { y: val }
            }
            val = this.calDiff(bottom, top1, middle1, bottom1);
            if(val!==undefined && val!==null && !Number.isNaN(val)) {
                this.guideY.push(bottom);
                return { y: val }
            }
        },
        calDiff(line, val1, val2, val3) {
            if(Math.abs(line-val1)<this.diffVal) {
                return line-val1;
            }else if(Math.abs(line-val2)<this.diffVal) {
                return line-val2;
            }else if(Math.abs(line-val3)<this.diffVal) {
                return line-val3;
            }
        },
        clearGuideLine() {
            this.guideX.splice(0, this.guideX.length);
            this.guideY.splice(0, this.guideY.length);
        },
        
    },
}
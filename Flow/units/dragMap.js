export default {
    name: 'dragMap',
    link: false,
    dragable: false,
    block: false,
    
    data: {
        backColor: 'rgba(100, 100, 100, .3)'
    },
    draw() {
        let ctx = this.ctx;
        let bounds = this.bounds;
        ctx.beginPath();
        ctx.lineWidth = 2;
        ctx.rect(bounds.x, bounds.y, bounds.width, bounds.height);
        ctx.strokeStyle = this.backColor;
        ctx.fillStyle = this.backColor;
        ctx.stroke();
        ctx.fill();
    },
    hover(val) {
        if(val) console.log('dragmap 被hover了！！')
    },
    isHere(x, y) {
        let ctx = this.ctx;
        ctx.beginPath();
        ctx.rect(this.bounds.x, this.bounds.y, this.bounds.width, this.bounds.height);
        if (ctx.isPointInPath(x, y)) {
            return true;
        }
        return false;
    },
    drag() {

    },
    computed: {
        'bounds': function() {
            let tx = this.$uae.tx,
                ty = this.$uae.ty; // 画布偏移量；
            return {
                x: tx+10,
                y: ty+20,
                width: 160,
                height: 160,
            }
        }
    }
}
export default {
    name: 'return',
    link: false,
    dragable: false,
    block: false,
    data: {
        text: '<=返回',
        color: '#3B3B3B'
    },
    draw() {
        let ctx = this.ctx;
        ctx.beginPath();
        ctx.font = '14px Arial';
        ctx.textAlign = 'left';
        ctx.textBaseline = 'middle';
        if(this.$uae.isNode) {
            // 在下探后的node界面才对 返回按钮 上色
            ctx.fillStyle = this.color;
        }else {
            ctx.fillStyle = this.color;
        }

        ctx.fillText(this.text, this.bounds.x, this.bounds.y);
        ctx.fill();
    },
    hover(val) {
        if(val) {
            this.color = '#5F8DFA';
        } else {
            this.color = '#3B3B3B';
        }
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
    computed: {
        'bounds': function() {
            let tx = this.$uae.tx,
                ty = this.$uae.ty; // 画布偏移量；
            return {
                x: tx+10,
                y: ty+20,
                width: 64,
                height: 15,
            }
        }
    }
}
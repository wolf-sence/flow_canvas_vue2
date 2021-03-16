// 异常技术

export default {
    name: 'abnormalEnd',
    mixin: 'normalEnd',
    data: {
        mainColor: '#F65656',
    },
    methods: {
        drawText(origin) {
            let ctx = this.ctx;
            let bounds = this.bounds;
            let data = this.data;
            ctx.fillStyle = '#182932';
            ctx.font = '14px Arial';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText('异常结束', bounds.x+origin.r, bounds.y+origin.r+3);
            ctx.fillStyle = '#fff';
            ctx.fillText(data.id, bounds.x+origin.r, bounds.y+origin.r*0.25);
            ctx.closePath();
        },
    }
}
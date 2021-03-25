// 自定义结束

export default {
    name: 'diyEnd',
    mixin: 'normalEnd',
    data: {
        mainColor: '#7AA3CC',
    },
    methods: {
        drawText(origin) {
            let ctx = this.ctx;
            let bounds = this.bounds;
            let data = this.data;
            let desp = data.desp || '自定义结束';
            // let width = parseInt(ctx.measureText(desp).width)

            ctx.fillStyle = '#182932';
            ctx.font = '12px Arial';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            // if(width>56) {
            //     ctx.fillText(desp.slice(0,desp.length/2), bounds.x+origin.r, bounds.y+origin.r);
            //     ctx.fillText(desp.slice(desp.length/2, desp.length), bounds.x+origin.r, bounds.y+origin.r+15);
            // }else {
            //     ctx.fillText(desp, bounds.x+origin.r, bounds.y+origin.r);
            // }
            ctx.fillText(desp, bounds.x+origin.r, bounds.y+origin.r,bounds.width);
            ctx.fillStyle = '#fff';
            ctx.fillText(data.id, bounds.x+origin.r, bounds.y+origin.r*0.25);
            ctx.closePath();
        },
    }
}
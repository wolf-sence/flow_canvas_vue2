// 中转节点

export default {
    template: '<anchor v-for="(item, index) in data.output" :output="item" :index="index"></anchor>',
    name: 'transit',
    mixin: 'normalEnd',
    data: {
        mainColor: '#0095FF',
    },
    methods: {
        drawText(origin) {
            let ctx = this.ctx;
            let bounds = this.bounds;
            let data = this.data;
            
            ctx.fillStyle = '#182932';
            ctx.font = '12px Arial';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText('中转节点', bounds.x+origin.r, bounds.y+origin.r+3);
            ctx.fillStyle = '#fff';
            ctx.fillText(data.id, bounds.x+origin.r, bounds.y+origin.r*0.25);
            ctx.closePath();
        },
    }
}
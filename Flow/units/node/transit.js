// 中转节点

export default {
    template: '<anchor v-for="(item, index) in data.output" :output="item" :index="index"></anchor>',
    name: 'transit',
    mixin: 'normalEnd',
    data: {
        mainColor: '#0095FF',
    },
    methods: {
        // 线条销毁/连接失败,数据处理
        handleEdgeDey(obj) {
            let { output } = obj;
            let outputs = this.data.output
            let index = outputs.indexOf(output);

            if(!this.data.logic) return;
            delete this.data.logic[`ret${index}`];
            this.data.logic.total = Number(this.data.logic.total)-1;
        },
        // 线条连接成功，数据处理
        handleEdgeSucc(obj) {
            let { comp, output } = obj;
            let outputs = this.data.output
            let index = outputs.indexOf(output);

            if(!this.data.logic) {
                this.data.logic = {};
            }
            this.data.logic.total = this.data.sourceConnections.length;
            this.data.logic[`ret${index}`] = comp.data.id;
        },
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
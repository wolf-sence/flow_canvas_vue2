// 风险等级小组件

export default {
    name: 'risk',
    dragable: false,
    link: false,
    block: false,
    data: {
        l1: {
            label: '微风险',
            color: '#0095FF'
        },
        l2: {
            label: '小风险',
            color: '#3E5DE4'
        },
        l3: {
            label: '中风险',
            color: '#FF872F'
        },
        l2: {
            label: '重风险',
            color: '#F65656'
        },
        space: 4, // 距离上、右间隔
        r: 4,
    },
    draw() {
        let pBounds = this.$parent.bounds;
        let data = this.$parent.data;

        if(data.risk && (Number(data.risk) > 0)) {
            let leftWidth = this.$parent.leftWidth;
            let ctx = this.ctx;
            let level = this[`l${data.risk}`];
            let origin = {
                x: pBounds.x+leftWidth-this.space-this.r,
                y: pBounds.y+this.space+this.r,
                r: 6
            };
            
            ctx.beginPath();
            ctx.arc(origin.x, origin.y, origin.r, 0, Math.PI*2, false);
            ctx.fillStyle = level.color;
            ctx.fill();
            ctx.fillStyle = '#527292';
            ctx.font = '13px Arial';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            // ctx.fillText('我', origin.x, origin.y);
            ctx.closePath();
        }
    },
    methods: {

    },
}
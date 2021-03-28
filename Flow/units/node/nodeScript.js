// 普通 node节点

export default {
    template: `<anchor v-for="(item, index) in data.output" :output="item" :index="index" @handleEdgeSucc="handleEdgeSucc" @handleEdgeDey="handleEdgeDey"></anchor>
                <risk v-if="data.risk"></risk>`,
    name: 'nodeScript',
    mixin: 'root',
    data: {
        lineWidth: 3,
        hoverColor: '#C8D8FC',
        selectColor: 'rgba(0, 144, 255, 0.5)',
        mainColor: '#527292',
        isHover: false,
        isSelect: false,
        radius: 2,
        icon: '\\ue7a2',
        leftWidth: 36, // 左侧模块宽度
    },
    draw() {
        if(this.isHover) {
            this.drawShape(this.hoverColor);
        }
        if(this.isSelect) {
            this.drawShape(this.selectColor);
        }
        let ctx = this.ctx;
        let bounds = this.bounds;
        let data = this.data;

        ctx.beginPath();
        ctx.lineWidth = this.lineWidth;
        ctx.strokeStyle = this.mainColor;
        ctx.roundRect(bounds.x, bounds.y, bounds.width, bounds.height, this.radius);
        ctx.stroke();
        ctx.fillStyle = '#fff';
        ctx.fill();
        ctx.closePath();

        ctx.fillStyle = '#333333';
        ctx.font = '13px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(data.desp || 'node', bounds.x+(bounds.width+this.leftWidth)/2, bounds.y+bounds.height/2, bounds.width-this.leftWidth-2);

        this.drawTrape();
        this.drawIcon();
    },
    created() {
        this.data.bounds.width = 160;
        this.data.bounds.height = 25;
    },
    computed: {
        'bounds': function() {
            return this.data.bounds;
        },
        
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
        drawShape(color) {
            let bounds = this.bounds;
            let ctx = this.ctx;
            let radius = 4;
            ctx.beginPath();
            ctx.lineWidth = 2;
            ctx.moveTo(bounds.x-4, bounds.y+2);
            ctx.lineTo(bounds.x+2, bounds.y-14);
            ctx.arcTo(bounds.x+4, bounds.y-18, bounds.x+8, bounds.y-18, radius);
            ctx.lineTo(bounds.x+33, bounds.y-18);
            ctx.arcTo(bounds.x+34, bounds.y-18, bounds.x+37, bounds.y-12, radius);
            ctx.lineTo(bounds.x+39, bounds.y-7);
            ctx.arcTo(bounds.x+40, bounds.y-4, bounds.x+44, bounds.y-4, radius);
            ctx.lineTo(bounds.x+bounds.width-2, bounds.y-4); // 右上角
            ctx.arcTo(bounds.x+bounds.width+4, bounds.y-4, bounds.x+bounds.width+4, bounds.y+4, radius);
            ctx.lineTo(bounds.x+bounds.width+4, bounds.y+bounds.height-2);
            ctx.arcTo(bounds.x+bounds.width+4, bounds.y+bounds.height+4, bounds.x+bounds.width-4, bounds.y+bounds.height+4, radius);
            ctx.lineTo(bounds.x+2, bounds.y+bounds.height+4);
            ctx.arcTo(bounds.x-4, bounds.y+bounds.height+4, bounds.x-4, bounds.y+bounds.height-2, radius);
            ctx.closePath();
            ctx.strokeStyle = color;
            ctx.stroke();
        },
        drawTrape() { // 绘制梯形
            let bounds = this.bounds;
            let ctx = this.ctx;
            let data = this.data;
            let upW = 24; // 上边长
            let bmW = this.leftWidth; // 下边长
            let height = 12; // 高度
            let radius = 2; // 圆弧大小
            let rigthX = 1; // x坐标起始误差值
            let rightY = -2; // y坐标起始误差值
            ctx.beginPath();
            ctx.moveTo(bounds.x+rigthX, bounds.y+rightY);
            ctx.lineTo(bounds.x+rigthX+(bmW-upW)/2-radius, bounds.y+rightY-height+radius);
            ctx.arcTo(bounds.x+rigthX+(bmW-upW)/2,  bounds.y+rightY-height, bounds.x+rigthX+(bmW-upW)/2+radius, bounds.y+rightY-height, radius);
            ctx.lineTo(bounds.x+rigthX+(bmW+upW)/2-radius, bounds.y+rightY-height);
            ctx.arcTo(bounds.x+rigthX+(bmW+upW)/2,  bounds.y+rightY-height, bounds.x+rigthX+(bmW+upW)/2+radius, bounds.y+rightY-height+radius, radius);
            ctx.lineTo(bounds.x+rigthX+bmW, bounds.y+rightY);
            ctx.closePath();
            ctx.strokeStyle = this.mainColor;
            ctx.stroke();
            ctx.fillStyle = this.mainColor;
            ctx.fill();

            ctx.fillStyle = "#FFFFFF";
            ctx.font = '12px Arial';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(data.id, bounds.x+bmW/2+rigthX,bounds.y-height/2+rightY);
        },
        drawIcon() {
            let leftWidth = this.leftWidth;
            let lineSpace = 5
            let bounds = this.bounds;
            let ctx = this.ctx;
            ctx.fillStyle = this.mainColor;
            ctx.font = '20px iconfont';
            // ctx.font = '20px Arial';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            // ctx.fillText(eval('("\\ue7ad")'), bounds.x+leftWidth/2, bounds.y+bounds.height/2);
            ctx.fillText(eval(`("${this.icon}")`), bounds.x+leftWidth/2, bounds.y+bounds.height/2);
            // ctx.fillText('我', bounds.x+leftWidth/2, bounds.y+bounds.height/2);
            ctx.beginPath();
            ctx.strokeStyle = '#C8D0D4';
            ctx.lineWidth = 2;
            ctx.moveTo(bounds.x+leftWidth, bounds.y+lineSpace)
            ctx.lineTo(bounds.x+leftWidth, bounds.y+bounds.height-lineSpace);
            ctx.stroke();
            ctx.closePath();
        }
    },
    click(val) {
        this.isSelect = val;
    },
    hover(isHover) {
        this.isHover = isHover;
    },
    
}
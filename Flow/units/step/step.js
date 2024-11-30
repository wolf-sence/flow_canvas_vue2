import chilun from '../chilun.png';

let img = new Image()
img.src = chilun;

export default {
    template: '<anchor v-for="(item, index) in data.output" :output="item" :index="index" @handleEdgeSucc="handleEdgeSucc" @handleEdgeDey="handleEdgeDey"></anchor>',
    name: 'step',
    mixin: 'root',
    data: {
        lineWidth: 4,
        hoverColor: '#C8D8FC',
        selectColor: '#C8D8FC',
        mainColor: '#367AA0',
        imgWidth: 52,
        imgHeight: 40,
        isHover: false,
        isSelect: false,
    },
    draw() {
        let ctx = this.ctx;
        let data = this.data;
        let bounds = this.bounds;
        if(this.isHover || this.isSelect) {
            this.drawShape(this.hoverColor);
        }
        // if(this.isSelect) {
        //     this.drawShape(this.selectColor);
        // }
        this.ctx.beginPath();
        
        this.ctx.drawImage(img, 0, 0, 260, 200, bounds.x+bounds.width/2-this.imgWidth/2, bounds.y+2, this.imgWidth, this.imgHeight)

        let desp = this.data.desp;
        // let textLength = parseInt(ctx.measureText(desp).width);

        if(data.skip&&data.skip.enabled==='1') this.mainColor = '#909399';

        ctx.strokeStyle = this.mainColor;
        ctx.lineWidth = this.lineWidth;
        ctx.roundRect(bounds.x,bounds.y+this.imgHeight,bounds.width,bounds.height-this.imgHeight, 5);
        ctx.stroke();
        ctx.fillStyle = '#F5F7FA';
        ctx.fill();
        let colorWidth = bounds.width * 0.25-2;
        ctx.beginPath();
        ctx.roundRect(bounds.x-2, bounds.y+this.imgHeight-2, colorWidth,bounds.height-this.imgHeight+4, 5 )
        ctx.fillStyle = this.mainColor;
        ctx.fill();

        ctx.font = '13px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillStyle = '#FFF';
        ctx.fillText(data.id, bounds.x + colorWidth/2, bounds.y+12.5+this.imgHeight);
        ctx.textAlign = 'center';
        ctx.fillStyle = '#000';
        ctx.fillText(desp, bounds.x+bounds.width*0.625, bounds.y+12.5+this.imgHeight,bounds.width*0.75-2);
        this.ctx.closePath();
    },
    click(val) {
        this.isSelect = val;
    },
    hover(isHover) {
        this.isHover = isHover;
    },
    created() {
        this.data.bounds.width = 160;
        this.data.bounds.height = 25+this.imgHeight;
    },
    methods: {
        // 线条销毁/连接失败,数据处理
        handleEdgeDey(obj) {
            let { output } = obj;
            let outputs = this.data.output
            let index = outputs.indexOf(output);
            if(index === 0) {
                this.data.false = 0;
            } else if(index === 1) {
                this.data.true = 0;
            } else if(index > 1) {
                if(Array.isArray(this.data.customOuts)) {
                    for(let i=0;i<this.data.customOuts.length;i++) {
                        // 判断是否以index标识符开头的记录，删除
                        if(this.data.customOuts[i].startsWith(`${index}_`)) {
                            this.data.customOuts.splice(index, 1);
                            break;
                        }
                    }
                }
            }
            
        },
        // 线条连接成功，数据处理
        handleEdgeSucc(obj) {
            let { comp, output } = obj;
            let outputs = this.data.output
            let index = outputs.indexOf(output);
            if(index === 0) {
                this.data.false = comp.data.id;
            } else if(index === 1) {
                this.data.true = comp.data.id;
            } else if(index > 1) {
                if(Array.isArray(this.data.customOuts)) {
                    this.data.customOuts.push(`${index}_${comp.data.id}`);
                }else {
                    this.data.customOuts = [`${index}_${comp.data.id}`];
                }
            }
        },
        drawShape(color) {
            let bounds = this.bounds;
            this.ctx.beginPath();
            this.ctx.strokeStyle = color;
            this.ctx.lineWidth = 1.5;
            this.ctx.roundRect(bounds.x-4, bounds.y+15, bounds.width+8, bounds.height-8, 5);
            this.ctx.fillStyle = '#E9E9E9';
            this.ctx.stroke();
            this.ctx.fill();
            this.ctx.closePath();
        },
    },
    computed: {
        'bounds': function() {
            return this.data.bounds;
        },
        
    },
    watch: {
        'data.bounds.width': function(val) {
            console.log('监听到 data.bounds.width 改变', val);
        }
    }
}
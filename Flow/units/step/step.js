// import eye from './eyes.jpg';
// let img = document.createElement('img');
// img
let img = new Image()
img.src = '../Flow/units/chilun.png';

export default {
    template: '<anchor v-for="(item, index) in data.output" :output="item" :index="index" @handleEdgeSucc="handleEdgeSucc" @handleEdgeDey="handleEdgeDey"></anchor>',
    name: 'step',
    mixin: 'root',
    data: {
        lineWidth: 4,
        hoverColor: '#C8D8FC',
        selectColor: 'rgba(0, 144, 255, 0.5)',
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
        if(this.isHover) {
            this.drawShape(this.hoverColor);
        }
        if(this.isSelect) {
            this.drawShape(this.selectColor);
        }
        this.ctx.beginPath();
        
        this.ctx.drawImage(img, 0, 0, 260, 200, bounds.x+bounds.width/2-this.imgWidth/2, bounds.y+2, this.imgWidth, this.imgHeight)

        let desp = this.data.desp;
        let textLength = parseInt(ctx.measureText(desp).width);

        if(data.skip&&data.skip.enabled==='1') this.mainColor = '#909399';

        // if(textLength>200) {
        //     desp = desp.substring(0, 200/textLength*desp.length-3)+'...';
        //     data.bounds.width = 250;
        // }else if (textLength>120) {
        //     data.bounds.width = 250;
        // }else{
        //     data.bounds.width = 170;
        // }

        ctx.strokeStyle = this.mainColor;
        ctx.lineWidth = this.lineWidth;
        ctx.roundRect(bounds.x,bounds.y+this.imgHeight,bounds.width,bounds.height-this.imgHeight, 5);
        ctx.stroke();
        ctx.fillStyle = '#F5F7FA';
        ctx.fill();
        let gradient = ctx.createLinearGradient(bounds.x,bounds.y,bounds.x+bounds.width,bounds.y);
        let colorPercent = 150*0.25/data.bounds.width;
        gradient.addColorStop(0, this.mainColor);
        gradient.addColorStop(colorPercent, this.mainColor);
        gradient.addColorStop(colorPercent, '#FFF');
        ctx.fillStyle = gradient;
        ctx.fill();

        ctx.font = '13px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillStyle = '#FFF';
        ctx.fillText(data.id, bounds.x + bounds.width*colorPercent/2, bounds.y+12.5+this.imgHeight);
        ctx.textAlign = 'center';
        ctx.fillStyle = '#000'
        ctx.fillText(desp, bounds.x+bounds.width*(0.5+colorPercent/2), bounds.y+12.5+this.imgHeight,bounds.width*(1-colorPercent));
        this.ctx.closePath();
        
        
    },
    click(val) {
        this.isSelect = val;
    },
    hover(isHover) {
        this.isHover = isHover;
    },
    dblclick(event) {
        console.log('step 双击')
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
            this.ctx.fillStyle = 'rgba(212,223,230, .2)';
            this.ctx.stroke();
            this.ctx.fill();
            this.ctx.closePath();
        },
    },
    computed: {
        'bounds': function() {
            return {
                x: this.data.bounds.x,
                y: this.data.bounds.y,
                width: this.data.bounds.width,
                height: this.data.bounds.height + this.imgHeight,
            };
        },
        
    },
    watch: {
        'data.bounds.width': function(val) {
            console.log('监听到 data.bounds.width 改变', val);
        }
    }
}
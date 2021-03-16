// 开始

export default {
    name: 'normalEnd',
    mixin: 'root',
    cursor: 'pointer',
    dragable: true,
    
    data: {
        lineWidth: 4,
        mainColor: '#27C59A',
        hoverColor: '#C8D8FC',
        selectColor: 'rgba(0, 144, 255, 0.5)',
        isHover: false,
        isSelect: false,
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
        ctx.beginPath();
        let origin = {
            x: bounds.x+bounds.width/2,
            y: bounds.y+bounds.height/2,
            r: bounds.width/2,
        }
        ctx.strokeStyle = this.mainColor;
        ctx.lineWidth = this.lineWidth;
        ctx.arc(origin.x, origin.y, origin.r, 0, Math.PI*2, false);
        ctx.stroke();
        let gradient = ctx.createLinearGradient(bounds.x+origin.r,bounds.y,bounds.x+origin.r,bounds.y+origin.r*2);
            gradient.addColorStop(0, this.mainColor);
            gradient.addColorStop(0.25, this.mainColor);
            gradient.addColorStop(0.25, '#FFF');
        ctx.fillStyle = gradient;
        ctx.fill();

        this.drawText(origin);
        
    },
    click(val) {
        this.isSelect = val;
    },
    hover(val) {
        this.isHover = val;
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
            ctx.fillText('正常结束', bounds.x+origin.r, bounds.y+origin.r+3);
            ctx.fillStyle = '#fff';
            ctx.fillText(data.id, bounds.x+origin.r, bounds.y+origin.r*0.25);
            ctx.closePath();
        },
        drawShape(color) {
            let ctx = this.ctx;
            let bounds = this.bounds;
            ctx.beginPath();
            ctx.lineWidth = 2;
            let origin = {
                x: bounds.x+bounds.width/2,
                y: bounds.y+bounds.height/2,
                r: bounds.width/2,
            }
            ctx.strokeStyle = color;
            ctx.arc(origin.x, origin.y, origin.r+5, 0, Math.PI*2, false);
            ctx.stroke();
            ctx.closePath();
        }
    },
    computed: {
        bounds:function() {
            return this.data.bounds;
        }
    }

}
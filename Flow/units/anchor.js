export default {
    template: '<edge v-if="hasEdge" @handleEdgeSucc2="edgeSuccess" @handleEdgeDey2="edgeDestroy"></edge>',
    name: 'anchor',
    props: ['output', 'index'],
    cursor: 'crosshair',
    link: false,
    data: {
        isHover: false,
        color: '#F69E9E',
        hasEdge: false,
        edge: null,
    },
    draw() {
        let ctx = this.ctx;
        ctx.beginPath();
        
        ctx.arc(this.bounds.x+this.bounds.width, this.bounds.y, this.bounds.width, 0, 2 * Math.PI);
        ctx.lineWidth = 2;
        ctx.fillStyle = 'rgb(232, 247, 249)';
        ctx.fill();
        
        ctx.strokeStyle = this.output.status == 'notExecute' ? '#C0C4CC' : this.output.color;
        ctx.stroke();
        ctx.closePath();
    },
    dragstart(x, y) {
        // this.hasEdge = false;
        // this.hasEdge = true;
        console.log('this.hasEdge', this.hasEdge)
        if(!this.hasEdge) {
            this.hasEdge = true;
            this.edge = this.$children[0];
            this.edge && this.edge.handleDragStart(x, y);
        }else {
            this.edge = null;
        }
    },
    drag(x, y) {
        this.edge && this.edge.handleDrag(x, y);
    },
    dragend(x, y) {
        if(this.edge) {
            this.hasEdge = this.edge.handleDragEnd(x, y);
            this.edge = null;
        }
    },
    mounted() {
        let conns = this.$parent.hasEdge && this.$parent.hasEdge() || [];
        for(let i=0;i<conns.length;i++) {
            // if(conns[i].sourceTerminal == this.index) 
        }
    },
    methods: {
        edgeSuccess(comp) {
            let data = this.$parent.data;
            if(!Array.isArray(data.sourceConnections)) data.sourceConnections=[];

            data.sourceConnections.push({
                sourceTerminal: this.index,
                targetId: comp.data.id,
                targetTerminal: 'N',
            })
            this.handleEdgeSucc({
                comp: comp,
                output: this.output,
            })
        },
        edgeDestroy() {
            let data = this.$parent.data;
            // 删除sourceConnections中的对应数据
            for(let i=0;i<data.sourceConnections.length;i++) {
                let conn = data.sourceConnections[i];
                if(conn.sourceTerminal == this.index) {
                    data.sourceConnections.splice(i, 1);
                    break;
                }
            }

            this.handleEdgeDey({
                output: this.output,
            })
        }
    },
    computed: {
        'bounds': function() {
            let data = this.$parent.data;
            // let pbounds = data.bounds;
            let pbounds  = this.$parent.bounds;
            let size = parseInt(pbounds.width / (data.output.length + 1));
            let r = 4;
            // 原型绘图，坐标需要 以左上角为单位
            let x = pbounds.x + size * (this.index + 1) - r,
            y = pbounds.y + pbounds.height + 1;
            return {
                x: x,
                y: y,
                width: r,
                height: r,
            }
        },
    },
    watch: {
        hasEdge(newVal, oldVal) {
            console.log('enter watch hasEdge', newVal);
        }
    }
}

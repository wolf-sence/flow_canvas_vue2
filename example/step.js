export default {
    template: '<anchor v-for="(item, index) in data.output" :output="item" :index="index"></anchor>',
    name: 'step',
    cursor: 'pointer',
    mixin: 'root',
    dragable: true,
    data: {
        name: 'tom',
        age: 12,
        obj: {
            a: 'q',
            b: 'w',
            c: [1,2,3],

        },
        hoverColor: '#C8D8FC',
        isHover: false,
        isSelect: false,
    },
    draw() {
        this.ctx.beginPath();
        // this.ctx.fillStyle=this.data.color;
        let bounds = this.data.bounds;
        this.ctx.strokeStyle = this.data.color;
        // this.ctx.fillStyle = this.data.color;
        this.ctx.rect(bounds.x,bounds.y,bounds.width,bounds.height);
        this.ctx.stroke();
        // this.ctx.fill();
        this.ctx.closePath();

        if(this.isHover) {
            this.drawShape();
        }
        if(this.isSelect) {
            this.drawShape();
        }
    },
    hover(isHover) {
        this.isHover = isHover;
    },
    selected(isSelect) {
        this.isSelect = isSelect;
    },
    click(cx, cy) {
        console.log('---收到单击事件---');
    },
    dblClick(cx, cy) {
        console.log('---收到双击事件---');
    },
    methods: {
        drawShape() {
            let bounds = this.data.bounds;
            this.ctx.beginPath();
            this.ctx.strokeStyle = this.hoverColor;
            this.ctx.rect(bounds.x-4,bounds.y-4,bounds.width+8,bounds.height+8);
            this.ctx.stroke();
            this.ctx.closePath();
        },
        output() {
            console.log('output 1---', this.age);
            console.log('output 1---', this.fullName);
            console.log('output 1---', this.obj.c);
            console.log('output data', this.data);
        },
        print() {
            this.output();
        },
        change() {
            this.age++;
        }
    },
    computed: {
        'bounds': function() {
            return this.data.bounds;
        },
        'fullName': function() {
            console.log('开始重新计算fullname')
            return this.obj.c + '|' + this.age;
        },
    },
    watch: {
        age: function(newVal, oldVal) {
            console.log('监听到age的改变', newVal, oldVal);
        },
        isSelect: (newVal, oldVal) => {
            console.log('监听到 isselect 改变', newVal, oldVal)
        }
    }
}
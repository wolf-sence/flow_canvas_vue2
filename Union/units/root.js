export default {
    name: 'root',
    props: ['data'],
    data: {
        edges: [], // 连接至此节点的edge id array
    },
    methods: {
        dependEdge(id) {
            this.edges.push(id);
        }
    },
    beforeDestroy() {
        // 销毁此节点前，销毁所有连接至此节点上的线条
        let length = this.edges.length;
        for(let i=length-1; i>=0; i--) {
            let edge = this.$uae._nodeMap[this.edges[i]];
            if(edge) edge.$destroy();
        }
        this.edges.length = 0;
    },
}
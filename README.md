### 使用文档

使用canvas实例化一个Engine，然后在其中注册你需要的节点类型数据

每个节点独立处理他自己的业务逻辑,切勿将节点的逻辑在Engine处理

基本采用事件暴露机制


## 节点已暴露事件详解:
* hover,click,dblclick,selected:均为鼠标触发事件，
* dragstart,drag,dragend:拖拽事件,入参为canvas中的鼠标坐标,引擎**默认拥有**一套拖拽事件,如果dragable设置为true(默认即为true),则会采用默认拖拽机制拖拽，此拖拽包含边界判断，即拖拽不能出界，如果节点自己定义了拖拽事件，则会**覆盖**默认的拖拽事件，需要注意
* beforeCreated,created,mounted,beforeDestroy为声明周期事件：beforeCreated仅挂载了props;created时,data、methods、computed、watch均已挂载，但未渲染;mounted为渲染之后;beforeDestroy:触发时一切正常，所有东西都可以调用


## 节点属性：
* template: String, 引入子节点的模板，可v-if(不支持表达式判断),可v-for，
* dragable: 是否可拖拽,默认true，true时默认采用自带的拖拽机制，可覆盖重写
* block: 是否块状元素，默认true，true时改节点绘制将会计入障碍物地图，false则不会，同时设置为false之后，鼠标移动检测事件将不再通过障碍物地图检测，此时需要在该节点注入isHere方法判断鼠标状态；
* name: 该节点注册时采用的类型名称，后续实例化需要选择该名字
* link: 是否可被 edge连接 默认为true，
* cursor: 鼠标hover时的状态，默认为pointer
* data: 同 vue，仅支持 对象
* draw: 绘图的主要入口，每个节点内部默认拥有ctx画笔
* methods: 同vue
* computed：同vue
* watch: 同vue

## 开发注意事项：
* 在子节点中再度嵌套子节点时，尽量不要使用props传递参数，否则可能会触发重复渲染，加重内存负担，节点默认带有 this.$parent,可以读取到父级的所有数据，

## 备注
router文件中的文件为线条避障算法的参考，无法直接运行，来源为另一个框架(蔡羽写)的算法，此处用于参考避障算法实现。



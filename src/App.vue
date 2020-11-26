<template>
  <!-- <img alt="Vue logo" src="./assets/logo.png"> -->
  <!-- <HelloWorld msg="W/////elcome to Your Vue.js App"/> -->
  <div  class="test-canvas">
    <div class="button-group">
      <p class="block-title">地图加载相关
        <span class="sub-title">
          (支持地图加载、缩放、旋转、比例尺、全屏、坐标显示)
        </span>
      </p>
      <a-button @click="initMap">地图加载</a-button>
      <a-button @click="addFeatureICon">添加元素</a-button>
      <a-button @click="getMapRangeFn">获取地图当前区域范围</a-button>
    </div>
     <div class="button-group">
      <p class="block-title">绘制相关
        <span class="sub-title">
          (支持地图加载、缩放、旋转、比例尺、全屏、坐标显示)
        </span>
      </p>
      <a-button @click="huizhiCircle">绘制圆形</a-button>
      <a-button @click="huizhiPolygon">绘制多边形</a-button>
    </div>
    <circleDemo ref="mapdemo"></circleDemo>
    <!-- <circleDemo 
    id="test"
    :progress="80"
    :canvasWidth="300"
    :canvasHeight="300"/> -->
  </div>
</template>

<script>
// import HelloWorld from './components/HelloWorld.vue'
// import circleDemo from './components/circleDemo.vue'
// import circleDemo from './components/vueTest.vue'
import circleDemo from './components/olmap.vue'
// import circleDemo from './components/olmapStrack.vue'
// import circleDemo from './components/olmapline.vue'

export default {
  name: 'App',
  components: {
    // HelloWorld
    circleDemo
  },
  created() {
    console.log('app page----')
    console.log('this.showPlugin()', this.$showPlugin('test function'))
  },
  methods: {
    huizhiCircle() {
      console.log('huizhi')
      if (this.$refs.mapdemo.hasMap()) {
        this.$refs.mapdemo.drawPolygon()
      }
    },
    huizhiPolygon() {
      console.log('huizhiPolygon')
      if (this.$refs.mapdemo.hasMap()) {
        this.$refs.mapdemo.drawPolygon('polygon')
      }
    },
    initMap() {
      if (!this.$refs.mapdemo.hasMap()) {
        this.$refs.mapdemo.initMap()
      }
    },
    addFeatureICon () {
      if (this.$refs.mapdemo.hasMap()) {
        this.$refs.mapdemo.featureElement()
      }
    },
    getMapRangeFn () {
      if (this.$refs.mapdemo.hasMap()) {
        this.$refs.mapdemo.getMapRange()
      }
    }
  }
}
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}
.test-canvas {
  width: 1000px;
  height: 500px;
}
.button-group {
  margin-bottom: 10px;
  border: 1px solid #ebebeb;
  padding: 10px 20px;
  text-align: left;
}
.block-title {
  text-align: left;
  color: red;
  font-weight: bold;
}
.sub-title{
  font-size: 12px;
  color: #333;
  font-weight: normal;
}
</style>

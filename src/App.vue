<template>
  <img alt="Vue logo" src="./assets/logo.png">
  <!-- <HelloWorld msg="W/////elcome to Your Vue.js App"/> -->
  <div  class="test-canvas">
    <a-button>加载地图</a-button>
    <circleDemo></circleDemo>
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

export default {
  name: 'App',

  components: {
    // HelloWorld
    circleDemo
  },
  created() {
    console.log('app page----')
    console.log('this.showPlugin()', this.$showPlugin('test function'))
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
  width: 500px;
  height: 500px;
}
</style>

<template>
  <div>
    <P>jffjkgKjkdgfj即可九分裤国内</P>
    <P v-pre>{{ cont }}</P>
  </div>
</template>
<script>

export default {
  name: 'circle-demo',
  props: {
    id: {
      type: String,
      default: 'circle'
    },
    radius: {
      type: Number,
      default: 50
    },
    lineWidth: {
      type: Number,
      default: 6
    },
    progress: {
      type: Number,
      default: 10
    },
    canvasWidth: {
      type: Number,
      default: 100
    },
    canvasHeight: {
      type: Number,
      default: 100
    }
  },
  data() {
    return {
      cont: '33'
    }
  },
  watch: { 
   id () {
     this.initCanvas(this.id, this.progress)
   },
   progress () {
     this.initCanvas(this.id, this.progress)
   }
  },
  created() {
    console.log('reeeeeeee')
  },
  mounted() {
    console.log('this.id ',  this.id)
    this.initCanvas(this.id, this.progress)
  },
  methods: {
    initCanvas(id, progress) {
      if (isNaN(progress) || progress <= 0 || progress > 100) {
        return
      }
      let canvasObj = document.getElementById(id)
      let circleX = canvasObj.width / 2  // 中心x坐标
      let circleY = canvasObj.height / 2  // 中心y坐标
      let ctx = canvasObj.getContext("2d")
      if (ctx) {
        ctx.clearRect(0, 0, circleX * 2, circleY * 2);
      }
      this.sector(ctx, circleX, circleY, this.radius, progress)
    },
    // 画弧线
    sector(ctx, cx, cy, r, endAngle) {
      ctx.beginPath()
      ctx.lineWidth = this.lineWidth
      // 渐变色 - 可自定义
      let linGrad = ctx.createLinearGradient(0,0,100,50)
      linGrad.addColorStop(0.0, '#06a8f3')
      linGrad.addColorStop(1.0, '#00f8bb')
      ctx.strokeStyle = linGrad
      // 圆弧两端的样式
      ctx.lineCap = 'round'
      // 圆弧
      if (endAngle === 100) {
       ctx.arc(
        cx, cy, r, 0, 2 * Math.PI)
      } else {
        ctx.arc(
        cx, cy, r,
        1.5*Math.PI,
        1.5*Math.PI - (100 - endAngle)/100 * 2 * Math.PI, false)
      }
      ctx.stroke()
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
.canvas-wrap {
  width: 100%;
  height: 100%;
}
</style>

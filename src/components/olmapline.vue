<template>
 <div class="map-warp">
 <h3>
 <a
 href="https://openlayers.org/en/latest/examples/feature-move-animation.html?q=polyline"
 target="_bank"
 >自定义动画</a>

 </h3>
 <div class="progress-bar">
 <div class="bar-box">
 <div class="bar" :style="{width:progress+'%'}">
  <span>{{progress}}%</span>
 </div>
 </div>
 </div>
 <div id="map" class="map"></div>
 <a-row :gutter="20">
 <a-col :span="5">
 <a-label for="speed">
  运动速度:&nbsp;
  <input id="speed" type="range" step="10" value="5" />
 </a-label>
 </a-col>
 <a-col :span="5">
 <a-button @click="handlerPlay">{{textContent}}</a-button>
 </a-col>
 </a-row>
 </div>
</template>

<script>
import "ol/ol.css";
import Feature from "ol/Feature";
import Map from "ol/Map";
import View from "ol/View";
import { Projection } from "ol/proj";
import { Point, LineString } from "ol/geom";
import { Tile as TileLayer, Vector as VectorLayer } from "ol/layer";
import XYZ from "ol/source/XYZ";
import VectorSource from "ol/source/Vector";
import {
 Circle as CircleStyle,
 Fill,
 Icon,
 Stroke,
 Style,
} from "ol/style";
import { getVectorContext } from "ol/render";

export default {
 data() {
 return {
 map: null,
 progress: 0, // 进度
 animating: false, // 动画是否开始
 speed: null, // 速度
 now: null, // 当前时间
 textContent: "开始",
 routeCoords: null, // 数组点集合
 routeLength: null, // 数组长度
 route: null, // 线
 routeFeature: null, // 画线
 geoMarker: null, // 标记
 startMarker: null, // 开始标记
 endMarker: null, // 结束标记
 styles: {
 route: new Style({
  // 线的样式
  stroke: new Stroke({
  width: 6,
  color: [237, 212, 0, 0.8]
  })
 }),
 icon: new Style({
  // 默认icon样式
  image: new CircleStyle({
  radius: 7,
  fill: new Fill({ color: "red" }),
  stroke: new Stroke({
  color: "white",
  width: 2
  })
  })
 }),
 geoMarker: new Style({
  // 设置标记样式
  image: new Icon({
  anchor: [0.5, 1], // 偏移位置
  // rotation: 0, // 旋转
  // size: [52, 26], // 图标大小
  src: require("@/assets/tx-icon-1.png")
  })
 }),
 start: new Style({
  // 设置开始标记样式
  image: new Icon({
  anchor: [0.5, 1],
  src: require("@/assets/rise.png")
  })
 }),
 end: new Style({
  // 设置结束标记样式
  image: new Icon({
  anchor: [0.5, 1],
  src: require("@/assets/end.png")
  })
 })
 },
 vectorLayer: null, // 矢量图层
 center: [118.835014569433, 32.08414190192472] // 中心点
 };
 },
 methods: {
 // 初始化地图
 initMap() {
 let that = this;
 that.routeCoords = [
  [118.83476768752418, 32.08385299388422],
  [118.83491813875425, 32.08394894013734],
  [118.83504349233812, 32.08408332210981],
  [118.83504349233812, 32.08408332210981],
  [118.83512889261571, 32.083918456790876],
  [118.83517286002402, 32.083733744293006],
  [118.83496824937895, 32.084077663081935],
  [118.83490797978696, 32.08412326115879],
  [118.83489815812887, 32.08414025948315],
  [118.83488806541473, 32.084153465524956],
  [118.83488315718186, 32.08415572622981],
  [118.8348782482698, 32.0841596143537],
  [118.83485807031045, 32.08416812475921],
  [118.83484798473395, 32.08416424284437],
  [118.83483789451235, 32.08417148163059],
  [118.83483789122208, 32.08417934749756],
  [118.83489794089253, 32.084006273376524],
  [118.83490803262733, 32.08399523720106],
  [118.83491321591835, 32.08398700421235],
  [118.83491812613363, 32.083979861216235],
  [118.83491812890527, 32.08397308027895],
  [118.83492822118053, 32.0839606878946],
  [118.83493831179283, 32.08395236406387],
  [118.8349443113023, 32.08394818448314],
  [118.83494840317711, 32.0839421415609],
  [118.8349582198328, 32.08393707761024],
  [118.83495822192893, 32.08393192409512],
  [118.83495822314188, 32.083928940480945],
  [118.83495822600715, 32.08392188830153],
  [118.83496831727095, 32.08391193701643],
  [118.83496832133952, 32.083901901220244],
  [118.83497432325855, 32.083891754391544],
  [118.83497841676457, 32.083881642888024],
  [118.83498850812316, 32.083871420344074],
  [118.8349985986039, 32.08386336769408],
  [118.83499860472438, 32.08384817837085],
  [118.83500869639813, 32.08383714209293],
  [118.83500870130179, 32.083824936382825],
  [118.83501279510463, 32.08381401114558],
  [118.83501852555108, 32.08380088571361],
  [118.83502861687877, 32.08379066312818]
 ];
 that.routeLength = that.routeCoords.length;
 that.route = new LineString(that.routeCoords);

 that.routeFeature = new Feature({
 type: "route",
 geometry: that.route
 });
 that.geoMarker = new Feature({
 type: "geoMarker",
 geometry: new Point(that.routeCoords[0])
 });
 that.startMarker = new Feature({
 type: "start",
 geometry: new Point(that.routeCoords[0])
 });
 that.endMarker = new Feature({
 type: "end",
 geometry: new Point(that.routeCoords[that.routeLength - 1])
 });
 // that.endMarker.setStyle(

 // new Style({
 // // image: new CircleStyle({
 // // radius: 7,
 // // fill: new Fill({ color: "red" }),
 // // stroke: new Stroke({
 // // color: "white",
 // // width: 2
 // // })
 // // }),
 // // image: new Icon({
 // // src: require("@/assets/tx-icon-1.png")
 // // }),
 // // text: new Text({
 // // text: '11133333333333333333333333333333333311',
 // // scale: 1.3,
 // // fill: new Fill({
 // // color: '#000000'
 // // }),
 // // Stroke:new Stroke({
 // // color: '#FFFF99',
 // // width: 3.5
 // // })
 // // })
 // })
 // );

 that.vectorLayer = new VectorLayer({
 source: new VectorSource({
  features: [
  that.routeFeature,
  that.geoMarker,
  that.startMarker,
  that.endMarker
  ]
  // 线、标记、开始标记、结束标记
 }),
 style: function(feature) {
  // 如果动画处于活动状态，则隐藏标记
  if (that.animating && feature.get("type") === "geoMarker") {
  return null;
  }
  return that.styles[feature.get("type")];
 }
 });
 this.map = new Map({
 target: "map",
 layers: [
  new TileLayer({
  source: new XYZ({
  url:
  "http://www.google.cn/maps/vt?lyrs=m@189&gl=cn&x={x}&y={y}&z={z}"
  }),
  projection: "EPSG:3857"
  }),
  that.vectorLayer
 ],
 view: new View({
  projection: new Projection({ code: "EPSG:4326", units: "degrees" }),
  center: this.center,
  zoom: 19,
  minZoom: 2,
  maxZoom: 19
 })
 });
 this.mapClick();
 },

 // 地图绑定事件
 mapClick() {
 let that = this;
 this.map.on("click", function(event) {
 let feature = that.map.getFeaturesAtPixel(event.pixel);
//  let pixel = that.map.getEventPixel(event.originalEvent);
//  let coodinate = event.coordinate;
 // let temp = feature[0].geometryChangeKey_.target
 // Point
 if (feature.length > 0) {
  console.warn(feature[0].values_.type, 111);
  // console.warn(feature[0].get('geometryChangeKey'),9999999999)
 }
 });
 },

 // 运动轨迹开关
 handlerPlay() {
 if (this.textContent === "暂停") {
 this.stop(false);
 } else {
 this.start();
 }
 },

 // 轨迹移动
 moveFeature(event) {
 let vectorContext = getVectorContext(event);
 let frameState = event.frameState;
 if (this.animating) {
 let elapsedTime = frameState.time - this.now;
 let index = Math.round((this.speed * elapsedTime) / 1000);
 // 进度条
 this.progress = Math.floor(
  ((100 / this.routeLength) * (this.speed * elapsedTime)) / 1000
 );
 if (index >= this.routeLength) {
  this.progress = "100";
  this.stop(true);
  return;
 }

 let currentPoint = new Point(this.routeCoords[index]);
 let feature = new Feature(currentPoint);
 vectorContext.drawFeature(feature, this.styles.geoMarker);
 }
 // tell OpenLayers to continue the postrender animation
 this.map.render(); // 开始移动动画
 },

 // 开始动画
 start() {
 if (this.animating) {
 this.stop(false);
 } else {
 this.animating = true;
 this.textContent = "暂停";
 this.now = new Date().getTime();
 let speedInput = document.getElementById("speed");
 this.speed = speedInput.value;
 this.geoMarker.setStyle(null); // hide geoMarker 隐藏标记
 // just in case you pan somewhere else
 this.map.getView().setCenter(this.center); // 设置下中心点
 this.vectorLayer.on("postrender", this.moveFeature);
 this.map.render();
 }
 },

 // 停止
 stop(ended='') {
   console.log('ended', ended)
 this.progress = 0;
 this.animating = false;
 this.textContent = "开始";
//  let coord = ended
//  ? this.routeCoords[this.routeLength - 1]
//  : this.routeCoords[0];
 //remove listener
 this.vectorLayer.un("postrender", this.moveFeature); // 删除侦听器
 }
 },
 mounted() {
 this.initMap();
 }
};
</script>

<style >
#map {
 height: 500px;
 margin-top: 20px;
}
/*隐藏ol的一些自带元素*/
.ol-attribution,
.ol-zoom {
 display: none;
}
.progress-bar {
 width: 100%;
 height: 30px;
 margin: 30px 0;
 background: url("~@/assets/bg-5.png") center bottom no-repeat;
 background-size: 100% 30px;
 position: relative;
 box-sizing: border-box;
}
.bar-box {
 position: absolute;
 top: 10px;
 left: 30px;
 right: 30px;
 height: 10px;
 border-radius: 5px;
 background: #034c77;
 }
.bar {
 height: 10px;
 border-radius: 5px;
 background: url("~@/assets/bg-6.png") 0 bottom repeat #ecc520;
 position: relative;
}
 .bar span {
 width: 50px;
 height: 50px;
 line-height: 18px;
 font-size: 12px;
 font-weight: bold;
 text-align: center;
 position: absolute;
 color: #fe0000;
 top: -30px;
 right: -25px;
 background: url("~@/assets/bg-7.png") center 0 no-repeat;
 background-size: 100% 30px;
 }
</style>
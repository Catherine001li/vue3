
<template>
  <div class="map-warp">
    <el-row :gutter="20">
      <el-col :span="3">
        <h3 style="line-height: 40px">
          <a href="https://openlayers.org/en/latest/examples/" target="_bank">openlayers拖拽</a>
        </h3>
      </el-col>
      <el-col :span="3">
        <div class="progress-bar">
          <div class="bar-box">
            <div class="bar" :style="{'width':progress}">
              <span>{{progress}}</span>
            </div>
          </div>
        </div>
      </el-col>
      <el-col :span="3">
        <el-select v-model="temp.id" placeholder="请选择" @change="changeMap">
          <el-option v-for="item in mapList" :key="item.id" :label="item.name" :value="item.id"></el-option>
        </el-select>
      </el-col>
      <el-col :span="3">
        <el-button type="primary" @click="toggle">{{textContent}}</el-button>
      </el-col>
    </el-row>
    <div id="map" ref="rootmap"></div>
  </div>
</template>

<script>
import "ol/ol.css";
import { Map, View, Feature } from "ol";
import { getCenter } from "ol/extent";
import {
  Tile as TileLayer,
  Vector as VectorLayer,
  Image as ImageLayer
} from "ol/layer";
import { Vector, ImageStatic as Static } from "ol/source";
import { Point, LineString } from "ol/geom";
import { Style, Icon, Text, Fill, Stroke, Circle } from "ol/style";
import { Projection } from "ol/proj";
import { getVectorContext } from "ol/render";
import start from "@/assets/rise.png";
import end from "@/assets/end.png";
import img from "@/assets/tx-icon-1.png";

export default {
  data() {
    return {
      map: null, // 地图
      imgx: 0, // 当前地图宽
      imgy: 0, // 当前地图高
      mapList: [], // 地图列表
      temp: {
        // 当前地图信息
        id: null,
        mapname: "",
        src: ""
      },
      textContent: '播放',
      animating: false, // 动画是否开始
      speed: 1, // 速度
      now: null, // 当前时间
      vectorLayer: null, // 矢量图层
      routeCoords: [], // 数组点集合
      routeLength: 0, // 集合点的数量
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
          image: new Circle({
            radius: 7,
            fill: new Fill({ color: "red" }),
            stroke: new Stroke({
              color: "white",
              width: 2
            })
          })
        }),
        geoMarker: new Style({
          image: new Circle({
            radius: 7,
            fill: new Fill({ color: 'black' }),
            stroke: new Stroke({
              color: 'white', width: 2
            })
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
      progress: 0,
    };
  },
  methods: {
    
    // 初始化地图
    initMap() {
      let extent = [0, 0, this.imgx, this.imgy];
      let projection = new Projection({
        code: "xkcd-image",
        units: "pixels",
        extent: extent
      });
      let $this = this;
      let boxMap = this.$refs.rootmap;
      if (boxMap.childNodes.length > 0) {
        boxMap.removeChild(boxMap.childNodes[0]);
      }
      this.map = new Map({
        target: "map",
        layers: [
          new ImageLayer({
            source: new Static({
              attributions: '© <a href="http://xkcd.com/license.html">xkcd</a>',
              url: $this.temp.src,
              projection: projection,
              imageExtent: extent
            })
          })
        ],
        view: new View({
          projection: projection,
          center: getCenter(extent),
          zoom: 2,
          maxZoom: 18
        })
      });

      this.vectorLayer = new VectorLayer({
        source: new Vector()
        // style: function(feature) {
        //   // 如果动画处于活动状态，则隐藏标记
        //   if (that.animating && feature.get("type") === "geoMarker") {
        //     return null;
        //   }
        //   return that.styles[feature.get("type")];
        // }
      });
      this.map.addLayer(this.vectorLayer);
      this.mapClick();
    },

    // 轨迹回放
    moveFeature(event) {
      let vectorContext = getVectorContext(event);
      let frameState = event.frameState;

      if (this.animating) {
        let elapsedTime = frameState.time - this.now;
        let index = Math.round((this.speed * elapsedTime) / 1000);
        this.progress = Math.floor(100/this.routeLength*(this.speed * elapsedTime) / 1000)+'%'
        if (index >= this.routeLength) {
          this.progress = '100%'
          this.stop(true);
          return;
        }
        let currentPoint = new Point(this.routeCoords[index]); // 当前点
        let feature = new Feature(currentPoint);
        // vectorContext.drawFeature(feature, this.styles.geoMarker);
        vectorContext.drawFeature(feature, this.createLabelStyle(img));
      }
      this.map.render();
    },

    // 设置坐标样式
    createLabelStyle(img) {
      return new Style({
        image: new Icon({
          anchor: [0.5, 0.8], // 居中
          // anchorOrigin: 'top-right',
          // anchorXUnits: 'fraction',
          // anchorYUnits: 'pixels',
          // offsetOrigin: 'top-right',
          // offset:[0,10],
          scale:0.5, // 图标缩放比例
          opacit: 1, // 透明度
          src: img // 图标的url
        })
      });
    },

    // 运动轨迹开关
    toggle() {
      if (this.textContent === "重新播放") {
        this.stop(false);
      } else {
        this.start();
      }
    },

    // 开始动画
    start() {
      if (this.animating) {
        this.stop(false);
      } else {
        // hide geoMarker
        this.animating = true;
        this.textContent = "重新播放";
        this.now = new Date().getTime(); // 开始时的时间
        this.geoMarker.setStyle(null);
        // 设置显示范围
        // this.map.getView().setCenter(center)
        this.vectorLayer.on("postrender", this.moveFeature);
        this.map.render();
      }
    },

    // 停止
    stop(ended) {
      this.textContent = "开始播放";
      this.animating = false;
      // if animation cancelled set the marker at the beginning
      let ii = ended ? this.routeLength - 1 : 0;
      let coord = this.routeCoords[ii];
      this.geoMarker.setGeometry(new Point(coord));
      // this.geoMarker.setStyle(this.createLabelStyle(img)); // 设置走完最后一个点是否展示
      // remove listener // 删除侦听器
      this.vectorLayer.un("postrender", this.moveFeature);
    },

    // 初始化请求刷新数据
    refresh(list) {
      // let query = this.listQuery
      // getHisList(query).then(response => {
      //   this.data = response.data
      // arrList.forEach(d => {
      //   let point = [d.x, d.y];
      //   this.routeCoords.push(point);
      // });
      // })
      this.routeCoords = list;

      this.routeLength = this.routeCoords.length;
      // 线
      this.routeFeature = new Feature(new LineString(this.routeCoords));
      // 标记
      this.geoMarker = new Feature(new Point(this.routeCoords[0]));
      this.geoMarker.setStyle(this.createLabelStyle(img));
      // 开始点
      this.startMarker = new Feature(new Point(this.routeCoords[0]));
      this.startMarker.setStyle(this.createLabelStyle(start));
      // 结束点
      this.endMarker = new Feature(new Point(this.routeCoords[this.routeCoords.length - 1]));
      this.endMarker.setStyle(this.createLabelStyle(end));

      // 运动集合展示在矢量图上
      this.vectorLayer .getSource().addFeatures(
        [this.routeFeature, this.geoMarker, this.startMarker, this.endMarker]
      );
      this.map.render();
    },

    // 点击地图事件
    mapClick() {
      let that = this;
      this.map.on("click", function(event) {
        let feature = that.map.getFeaturesAtPixel(event.pixel);
        let pixel = that.map.getEventPixel(event.originalEvent);
        let coodinate = event.coordinate;
      });
    },

    // 选择地图
    changeMap(id) {
      this.progress = 0
      let list = []
      this.mapList.forEach(item => {
        if (id === item.id) {
          this.temp = { ...item };
          list =item.list
        }
      });
      let img = new Image();
      img.src = this.temp.src;
      let that = this;
      img.onload = function(res) {
        that.imgx = res.target.width;
        that.imgy = res.target.height;
        that.initMap();
        that.refresh(list);
      };
    }
  },
  created() {
    this.mapList = [
      {
        id: 1,
        name: "展1",
        src: require("@/assets/icon.png"),
        list: [
          [259.27734375000006, 373.3515625],
          [261.23046875000006, 425.109375],
          [256.34765625000006, 472.9609375],
          [340.33203125000006, 485.65625],
          [404.78515625000006, 484.6796875],
          [466.3085937500001, 487.609375],
          [546.3867187500001, 473.9375],
          [548.3398437500001, 419.25],
          [549.3164062500001, 366.515625]
        ]
      },
      {
        id: 2,
        name: "展2",
        src: require("@/assets/bg-5.png"),
        list: [
          [1057.82666015625, 382.3564453125],
          [1053.4359997376926, 438.010227162076],
          [1053.4359997376923, 484.8300753847349],
          [1136.9166725120565, 498.08097582511016],
          [1205.8213548020078, 500.2894592318394],
          [1273.4009470479211, 502.0562459572229],
          [1355.5565297782478, 484.38837870338926],
          [1352.9063496901726, 432.2681703045799],
          [1352.022956327481, 377.49778181769545]
        ]
      },
      {
        id: 3,
        name: "展3",
        src: require("@/assets/bg-6.png"),
        list: [
          [46.9541015625, 34.3203125],
          [29.7880859375, 115.1015625],
          [27.7685546875, 227.185546875],
          [28.7783203125, 345.328125],
          [72.1982421875, 374.611328125],
          [168.1259765625, 377.640625],
          [244.8681640625, 366.533203125],
          [370.0791015625, 362.494140625],
          [449.8505859375, 353.40625],
          [505.3876953125, 332.201171875],
          [513.4658203125, 209.009765625],
          [516.4951171875, 106.013671875],
          [694.2138671875, 84.80859375],
          [771.9658203125, 105.00390625],
          [780.0439453125, 214.05859375],
          [803.2685546875, 328.162109375],
          [877.9912109375, 380.669921875],
          [989.0654296875, 354.416015625],
          [994.1142578125, 246.37109375],
          [979.9775390625, 115.1015625],
          [966.8505859375, 35.330078125]
        ]
      }
    ];
    this.temp.id = this.mapList[0].id;
    this.temp.src = this.mapList[0].src;
    this.changeMap(this.temp.id);
  }
};
</script>

<style>
#map {
  height: 500px;
  margin-top: 20px;
  border: 1px solid red;
}
.progress-bar {
    width: 90%;
    height: 30px;
    background: red;
    position: relative;
    box-sizing: border-box;
}
.progress-bar .bar-box {
  position: absolute;
  top: 10px;
  left: 30px;
  right: 30px;
  height: 10px;
  border-radius: 5px;
  background: #034c77;
}
.progress-bar .bar {
  height: 10px;
  border-radius: 5px;
  background: #ecc520;
  position: relative;
}
.progress-bar .bar span {
  width: 20px;
  height: 20px;
  line-height: 18px;
  font-size: 12px;
  font-weight: bold;
  text-align: center;
  position: absolute;
  color: #fe0000;
  top: -30px;
  right: -25px;
  background: blue;
  background-size: 100% 30px;
}
</style>

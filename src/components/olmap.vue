<template>
    <div id="map" ref="rootmap">
    </div>
    <!--可以给元素设置一些样式-->
    <div class="ol-popup" ref="olPopup">{{olPopupText}}</div>
</template>

<script>
import "ol/ol.css"
import { Map, View, } from "ol"
import mapconfig from '../config/mapconfig'
// import Layer from 'ol/layer/Layer.js'
// import Vector from 'ol/layer/Vector.js'
// import source from 'ol/source/Source.js'
// 旋转
import {
  defaults as defaultInteractions,
  DragRotateAndZoom,
} from 'ol/interaction'
// 地图控件
import {
  defaults,
  FullScreen,
  MousePosition,
  ScaleLine
  } from 'ol/control'
// import Overlay from 'ol/Overlay'
import Feature from 'ol/Feature'
import Point from 'ol/geom/Point'
import { Vector as VectorLayer } from 'ol/layer'
import { Vector as VectorSource } from 'ol/source'
import { Style, Icon } from 'ol/style'
// 拖拽图标
import { Translate } from 'ol/interaction'
// 添加一个要素, 绘制一个多边形
import { Draw } from 'ol/interaction'
// 覆盖层，出现弹窗
import Overlay from 'ol/Overlay'
// 绘制矩形
import { createBox } from 'ol/interaction/Draw'
// import vectorLayer from '../config/mapstyleconfig'
// 修改多边形
import { Modify } from 'ol/interaction'
export default {
  data() {
    return {
      map: null,
      source: null,
      olPopupText: '',
      vectorLayer: null,
    };
  },
  mounted() {
    // console.log('ol---Map-', Map)
    // console.log('ol-View---', View)
    // console.log('ol--layer--', Layer)
    // console.log('ol--Vector--', Vector)
    // console.log('ol----Source', source)
    // this.initMap()
  },
  methods: {
    hasMap () {
      if (this.map) {
        return true
      }
    },
    initMap() {
      let view = new View({
          projection: "EPSG:4326",    // 使用这个坐标系
          center: [mapconfig.x,mapconfig.y],  // 深圳
          zoom: mapconfig.zoom
        })
      let mapcontainer = this.$refs.rootmap;
      this.map = new Map({
        // 地图加载的dom
        target: mapcontainer,
        // 地图显示的图层
        layers: mapconfig.streetmap(),
        view,
        // loadTilesWhileAnimating: true, // 动画，默认值为false
        // 地图的旋转，按住shift键时通过鼠标来进行旋转地图
        interactions: defaultInteractions().extend([new DragRotateAndZoom()]),
        controls: defaults().extend([
          new FullScreen(), // 全屏
          new MousePosition(), // 显示鼠标当前位置的经纬度，位置在右上角，会和全屏按钮重叠，暂时先去掉
          new ScaleLine()// 地图左下角显示比例尺
        ])
      })
      // view.animate({
      //   center: [118.2344, 35.2355]
      // })
      // 地图的事件
      this.map.on('moveend', e => {
        console.log('地图移动', e)
      })
      this.map.on('rendercomplete', () => {
        console.log('渲染完成')
      })
      this.map.on('click', e => {
        console.log('地图点击', e)
      })
    },
    featureElement () {
      // 实例化要素
      let feature = new Feature({
        geometry: new Point([114.05928, 22.5498])// 地理几何图形选用点几何
      })
      let data = {
        type: 'test_icon',
        code: 'test_code1',
        name: 'test_name_point',
      }
      // 如果需要给要素附加一些自定义数据
      feature.set('data', data) 
      // 设置样式，这里就是显示一张图片icon
      feature.setStyle([
          new Style({
              image: new Icon({
                anchor: [0.5, 1],// 显示位置
                size: [32, 32],// 尺寸
                src: require('../assets/logo.png')// 图片url
              })
          })
      ])
      // 矢量源
      let source = new VectorSource({
          features: [feature]
      })
      // 实例化的时候也可以不添加feature，后续通过方法添加：source.addFeatures([feature])
      // 清空feature：source.clear()
      
      // 矢量图层
      let vector = new VectorLayer({
          source: source
      })
      this.vectorLayer = vector
      this.source = source
      this.map.addLayer(vector)
      console.log('all--666', this.map)
      console.log('all--', this.map.getLayers())
      let translate = new Translate({
          layers: [vector]
      })
      this.map.addInteraction(translate)
      // 可以监听一下拖动开始和结束的事件，拖动后的经纬度可以从e里面获取
      translate.on('translateend', (e) => {
          console.log('translateend', e)
      })
      translate.on('translatestart', (e) => {
          console.log('translatestart', e)
      })
      // 鼠标手动添加一个点位
      // let draw = new Draw({
      //     source,
      //     type: 'Point',
      //     style: new Style({
      //         image: new Icon({
      //           anchor: [0.5, 1],// 显示位置
      //           size: [18, 28],// 尺寸
      //           src: require('../assets/logo.png')// 图片url
      //         })
      //     })
      // })
      // 监听完成事件
      // draw.on('drawend', (e) => {
      //     console.log('drawend', e)
      //     // 如果只需要放置一个的话可以移除该交互，否则可以一直添加
      //     this.map.removeInteraction(draw)
      // })
      // this.map.addInteraction(draw)

      // 显示tooltip
      // 创建Overlayer
      this.tooltipOverlay = new Overlay({
          element: this.$refs.olPopup,
          positioning: 'bottom-center',// 根据position属性的位置来进行相对点位
          offset: [0, -30],// 在positioning之上再进行偏移
          autoPan: true
      })
      this.map.addOverlay(this.tooltipOverlay)
      
      // 给地图绑定鼠标移动事件，检测鼠标位置所在是否存在feature，如果是目标feature的话就显示tooltip
      this.map.on('pointermove', (e) => {
          this.olPopupText = ''
            console.log('pointermove----')
          this.map.forEachFeatureAtPixel(e.pixel, (f, layer) => {

              if (layer !== this.vectorLayer || !f.get('data')) {
                  return false
              }
              this.olPopupText = f.get('data')
              console.log('184----', this.olPopupText)
              this.tooltipOverlay.setPosition(f.getGeometry().getCoordinates())
          })
      })

    },
    // 手动通过鼠标添加一个要素
    addFeatureEle () {
      
    },
    // 绘制形状形
    drawPolygon (type) {
      // 默认是圆形
      let typeTmp = type || 'Circle'
      let source = new VectorSource()
      // 如果是多边形
      console.log('typeTmp', typeTmp)
      let vector = new VectorLayer({
          source: source
      })
      this.map.addLayer(vector)
      let draw = new Draw({
          source: source,
          type: 'Circle'
      })
      if (typeTmp === 'polygon') {
        this.map.removeInteraction(draw);
        draw = new Draw({
          source: source,
          type: 'Circle',
          geometryFunction: createBox()
        })
      }
      this.map.addInteraction(draw)
      this.editDraw()
    },
    // 修改多边形，通过点位
    editDraw (source) {
      let modify = new Modify({
        source
      })
      this.map.addInteraction(modify)
    },
    getMapRange () {
      // 获取当前地图区域上下左右四个点的经纬度
      let range = this.map.getView().calculateExtent(this.map.getSize())
      let state = {
          minLon: range[0],
          minLat: range[1],
          maxLon: range[2],
          maxLat: range[3],
          zoomLevel: this.map.getView().getZoom()// 当前缩放级别，缩放级别可用来判断是否要将要素聚合进行显示
      }
      console.log('getMapRange', state)
    }
    // addInteraction(val='Square'){
    //     let type = val;
    //     if(type !== 'None'){
    //         let geometryFunction;
    //         switch(type){   
    //             case "Square": 
    //                 type = 'Circle';
    //                 // 生成规则的四边形的图形函数
    //                 geometryFunction = Interaction.Draw.createRegularPolygon(4);
    //                 break;
    //             case 'Box':
    //                 type = 'Circle';
    //                 // 生成盒形状的图形函数
    //                 geometryFunction = Interaction.Draw.createBox();
    //                 break;
    //             default:break;
    //         }
    //             // let vectorSource = new Source.Vector();
    //         // let draw = new Interaction.Draw({
    //         //     source: vectorSource,
    //         //     type: type,
    //         //     geometryFunction
    //         // });
    //         // // 将Draw绘图控件加入Map对象
    //         // this.map.addInteraction(draw);
    //     }
    // }
  }
};
</script>

<style>
#map{height:100%;}
/*隐藏ol的一些自带元素*/
.ol-attribution,.ol-zoom { display: none;}
</style>
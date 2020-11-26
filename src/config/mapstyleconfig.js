import VectorSource from 'ol/source/Vector.js'
import Vector from 'ol/layer/Vector.js'
import Circle from 'ol/style/Circle.js'
import Style from 'ol/style/Style.js'
import Fill from 'ol/style/Fill.js'
import Stroke from 'ol/style/Stroke.js'
    let vectorSource = new VectorSource();
    const mapstylelayer = new Vector({
        source: vectorSource,
        // 设置图层样式
        style: new Style({
            // 将点设置成圆形样式
            image: new Circle({
                // 点的颜色
                fill: new Fill({
                    color: '#F00'
                }),
                // 圆形半径
                radius: 5
            }),
            // 线样式
            stroke: new Stroke({
                color: '#0F0',
                lineCap: 'round',       // 设置线的两端为圆头
                width: 5                
            }),
            // 填充样式
            fill: new Fill({
                color: '#00F'
            })
        })
    });
export default mapstylelayer

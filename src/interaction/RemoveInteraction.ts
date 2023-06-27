import Interaction from 'ol/interaction/Interaction.js';
import {RegularShape, Style} from 'ol/style.js';
import Stroke from 'ol/style/Stroke.js';
import Fill from 'ol/style/Fill.js';
import {Select} from 'ol/interaction.js';
import {pointerMove} from 'ol/events/condition.js';
import VectorLayer from 'ol/layer/Vector.js';
import VectorSource from 'ol/source/Vector.js';
import {FeatureLike} from 'ol/Feature.js';
import Point from 'ol/geom/Point.js';
import LineString from 'ol/geom/LineString.js';
import Map from 'ol/Map.js';
import {SelectEvent} from 'ol/interaction/Select.js';

const xStyle = new Style({
    image: new RegularShape({
        fill: new Fill({color: 'black'}),
        stroke: new Stroke({color: 'black', width: 2}),
        points: 4,
        radius: 10,
        radius2: 0,
        angle: Math.PI / 4,
    })
});

const xHStyle = new Style({
    image: new RegularShape({
        fill: new Fill({color: 'red'}),
        stroke: new Stroke({color: 'rgba(255,0,0,0.5)', width: 5}),
        points: 4,
        radius: 10,
        radius2: 0,
        angle: Math.PI / 4,
    })
});


const lineHiLightStyle = new Style({
    stroke: new Stroke({color: 'rgba(255,0,0,0.5)', width: 5})
})

export class RemoveInteraction extends Interaction {

    readonly hoverSelect: Select;
    readonly layer: VectorLayer<VectorSource>;
    readonly hiLightLayer = new VectorLayer({
        source: new VectorSource(),
        style: (feature: FeatureLike) => {
            const styles = [];
            if (feature.getGeometry()?.getType() === 'Point') {
                const point = feature.getGeometry() as Point;
                xStyle.setGeometry(undefined);
                xHStyle.setGeometry(undefined);
                styles.push(xStyle);
                styles.push(xHStyle);
            } else if (feature.getGeometry()?.getType() === 'LineString') {
                styles.push(lineHiLightStyle);
                const line = feature.getGeometry() as LineString;
                const point = new Point(line.getCoordinateAt(0.5));
                xStyle.setGeometry(point);
                xHStyle.setGeometry(point);
                styles.push(xStyle, xHStyle);
            }
            return styles;
        }
    });

    constructor(layer: VectorLayer<VectorSource>) {
        super();
        this.layer = layer;
        this.hoverSelect = new Select({
            condition: pointerMove,
            layers: [layer],
            multi: false,
            style: null,
            hitTolerance:15
        });
        this.hoverSelect.on('select',(e:SelectEvent)=>{
            this.hiLightLayer.getSource().clear();
            if(e.selected) {this.hiLightLayer.getSource().addFeatures(e.selected)}
        })
        this.addChangeListener('active',()=>this.hoverSelect.setActive(this.getActive()));
    }

    handleMapClick() {
        const features = this.hiLightLayer.getSource().getFeatures();
        features.forEach(f=>this.layer.getSource().removeFeature(f));
        this.hiLightLayer.getSource().clear();
    }



    setMap(map: Map) {
        if (map) {
            map.on('click', this.handleMapClick.bind(this))
            map.addInteraction(this.hoverSelect);
            map.addLayer(this.hiLightLayer);
        } else if (this.getMap()) {
            map = this.getMap();
            map.un('click', this.handleMapClick);
            map.removeInteraction(this.hoverSelect);
            map.removeLayer(this.hiLightLayer);
        }
        super.setMap(map);
    }

}
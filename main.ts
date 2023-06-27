import './style.css';
import {Map, View} from 'ol';
import TileLayer from 'ol/layer/Tile';
import OSM from 'ol/source/OSM';
import Control from 'ol/control/Control.js';
import {DrawerControl} from './src/DrawerControl';
import VectorLayer from 'ol/layer/Vector.js';
import VectorSource from 'ol/source/Vector.js';
import {Circle, Style} from 'ol/style.js';
import Stroke from 'ol/style/Stroke.js';
import Fill from 'ol/style/Fill.js';
import Modify from 'ol/interaction/Modify';
import {TextDrawerControl} from './src/TextDrawerControl';
import Feature from 'ol/Feature.js';
import {isFunction} from 'lodash';
import {RemoveControl} from './src/RemoveControl';

const map = new Map({
    target: 'map',
    layers: [
        new TileLayer({
            source: new OSM()
        })
    ],
    view: new View({
        center: [0, 0],
        zoom: 2
    })
});

const whiteCircleStyle = new Style({
    image: new Circle({
        fill: new Fill({color: 'white'}),
        radius: 5,
        stroke: new Stroke({color: 'black', width: 1})
    })
});

const redCircleStyle = new Style({
    image: new Circle({
        fill: new Fill({color: 'red'}),
        radius: 5,
        stroke: new Stroke({color: 'black', width: 1})
    })
});
const blackLineStyle = new Style({
    stroke: new Stroke({color: 'black', width: 1})
});

const redLineStyle = new Style({
    stroke: new Stroke({color: 'red', width: 1})
});
const layer = new VectorLayer({
    source: new VectorSource()
})
map.addLayer(layer);
const container = document.querySelector('.palette') as HTMLElement;
map.addControl(new Control({element: container}))

const removeControl = new RemoveControl(layer, container);
map.addControl(removeControl);

const drawers = [
    new DrawerControl({
        featureStyleKey: 'whiteCircle',
        style: whiteCircleStyle,
        target: container,
        layer: layer,
        geometryType: 'Point'
    }),
    new DrawerControl({
        featureStyleKey: 'redCircle',
        style: redCircleStyle,
        target: container,
        layer: layer,
        geometryType: 'Point'
    }),
    new DrawerControl({
        featureStyleKey: 'redLine',
        style: redLineStyle,
        target: container,
        layer: layer,
        geometryType: 'LineString'
    }),
    new DrawerControl({
        featureStyleKey: 'blackLine',
        style: blackLineStyle,
        target: container,
        layer: layer,
        geometryType: 'LineString'
    }),

];

const universalStyle = (feature: Feature, resolution: number) => {
    const style = drawers.filter((d) => d.draw.isOwnFeature(feature)).map((d) => d.draw.style)[0];
    if (isFunction(style)) {
        return style(feature, resolution);
    } else if (style) {
        return style;
    }
};

layer.setStyle(universalStyle);

const textDrawer = new TextDrawerControl(layer)
textDrawer.setTarget(container)
drawers.push(textDrawer);


drawers.forEach(d => {
    d.addChangeListener('active', (e) => {
        if (e.target.active === true) {
            drawers.filter(d => d !== e.target).forEach(d => d.active = false);
            removeControl.active = false;
        }

    })
})
const modify = new Modify({
    source: layer.getSource(), pixelTolerance: 15, style: layer.getStyle()
});
removeControl.addChangeListener('active', () => {
    if (removeControl.active) {
        modify.setActive(false);
        drawers.forEach(d => d.active = false);
    } else {
        modify.setActive(true);
    }
})
map.addInteraction(modify)
drawers.forEach(d => map.addControl(d));

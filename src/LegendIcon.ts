import Control, {Options} from 'ol/control/Control.js';
import LineString from 'ol/geom/LineString.js';
import {fromExtent} from 'ol/geom/Polygon.js';
import Point from 'ol/geom/Point.js';
import SimpleGeometry from 'ol/geom/SimpleGeometry.js';
import Feature from 'ol/Feature.js';
import {toContext} from 'ol/render.js';
import {DEVICE_PIXEL_RATIO} from 'ol/has.js';
import {Style} from 'ol/style.js';
import {flatten, isFunction} from 'lodash';
import {StyleFunction, StyleLike} from 'ol/style/Style.js';
import {Size} from 'ol/size.js';
import {createEmpty, extendCoordinate} from 'ol/extent.js';
import {Type as GeometryType} from 'ol/geom/Geometry.js';

export type LegendIconOptions = {
    size: Size,
    style: StyleLike,
    geometryType: GeometryType,
    featureProperties?: { [key: string]: number | string | boolean }
} & Options

export class LegendIcon extends Control {
    style: StyleLike;
    geometryType: GeometryType;
    featureProperties;

    constructor(options: LegendIconOptions) {
        options.element = document.createElement('canvas');
        super(options);
        this.element.width = options.size[0];
        this.element.height = options.size[1];
        this.style = options.style;
        this.featureProperties = options.featureProperties;
        this.element.classList.add('legend-icon');
        this.geometryType = options.geometryType;
    }

    render() {
        this.drawIcon(this.featureProperties)
    }

    drawIcon(featureProperties?: { [key: string]: number | string | boolean }) {
        const ratio = DEVICE_PIXEL_RATIO;
        const canvas = this.element as HTMLCanvasElement;
        const margin = 3;
        const height = canvas.height;
        const width = canvas.width;
        let geom: SimpleGeometry;
        if (this.geometryType === 'Point' || this.geometryType === 'MultiPoint') {
            geom = new Point([width / 2 / ratio, height / 2 / ratio]);
        } else if (this.geometryType === 'LineString' || this.geometryType === 'MultiLineString') {
            geom = new LineString([[margin / ratio, height / 2 / ratio], [(width - margin) / ratio, height / 2 / ratio]]);
        } else {
            const extent = createEmpty();
            extendCoordinate(extent, [margin / ratio, margin / ratio]);
            extendCoordinate(extent, [margin / ratio, (height - margin) / ratio]);
            extendCoordinate(extent, [(width - margin) / ratio, (height - margin) / ratio]);
            extendCoordinate(extent, [(width - margin) / ratio, margin / ratio]);
            geom = fromExtent(extent);
        }
        const feature = new Feature(geom);
        if (featureProperties) {
            feature.setProperties(featureProperties);
        }
        const styles: Style[] = [];
        if (isFunction(this.style)) {
            const style = (this.style as StyleFunction)(feature, ratio);
            flatten([style]).forEach(s => styles.push(s as Style));
        } else {
            flatten([this.style]).forEach(s => styles.push(s as Style));
        }
        const ctx = canvas.getContext('2d')
        const vectorContext = toContext(ctx, {pixelRatio: ratio});
        styles.forEach(s => {
            vectorContext.setStyle(s)
            const g: SimpleGeometry = s?.getGeometryFunction()(feature) as SimpleGeometry ?? feature.getGeometry();
            vectorContext.drawGeometry(g)
        })
    }

    declare element: HTMLCanvasElement;
}
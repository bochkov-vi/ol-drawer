import Interaction from 'ol/interaction/Interaction.js';
import {StyleLike} from 'ol/style/Style.js';
import Draw, {DrawEvent} from 'ol/interaction/Draw.js';
import Map from 'ol/Map.js';
import VectorLayer from 'ol/layer/Vector.js';
import VectorSource from 'ol/source/Vector.js';
import {Type as GeometryType} from 'ol/geom/Geometry.js';
import {noModifierKeys} from 'ol/events/condition.js';
import {Snap} from 'ol/interaction.js';
import {generateUUID} from '../utils/uuid.js';
import {FeatureLike} from 'ol/Feature.js';

export type DrawerInteractionOptions = {
    style: StyleLike,
    featureStyleKey: string,
    layer: VectorLayer<VectorSource>,
    geometryType: GeometryType
};

export const FEATURE_STYLE = 'styleType';

export class DrawerInteraction extends Interaction {
    style: StyleLike;
    featureStyleKey: string
    draw: Draw;
    layer: VectorLayer<VectorSource>
    snap: Snap;

    constructor(options: DrawerInteractionOptions) {
        super();
        this.style = options.style;
        this.featureStyleKey = options.featureStyleKey;
        this.layer = options.layer;
        this.draw = new Draw({
            type: options.geometryType,
            source: this.layer.getSource(),
            style: this.style,
            condition: (e) => {
                let underFeature = 0;
                if (options.geometryType === 'Point') {
                    this.getMap().forEachFeatureAtPixel(e.pixel, (feature, layer) => {
                        if ((feature.getGeometry().getType() === 'Point' || feature.getGeometry().getType() === 'MultiPoint') && layer === this.layer) {
                            underFeature++;
                        }
                    })
                }
                return noModifierKeys(e) && underFeature <= 0;
            }
        });
        this.draw.on('drawend', this.handleDrawEnd.bind(this));
        this.draw.on('drawstart', (e: DrawEvent) => {
            const f = e.feature;
            if (f) {
                f.setId(generateUUID());
                f.set(FEATURE_STYLE, this.featureStyleKey);
            }
        });
        this.snap = new Snap({source: this.layer.getSource(), pixelTolerance: 15})
    }

    handleDrawEnd(e: DrawEvent) {
        console.log(e);
    }

    setMap(map: Map | null) {
        if (map) {
            map.addInteraction(this.draw);
            map.addInteraction(this.snap);
        } else if (this.getMap()) {
            this.getMap().removeInteraction(this.draw);
            this.getMap().removeInteraction(this.snap);
        }
        super.setMap(map);
    }

    setActive(active: boolean) {
        super.setActive(active);
        this.draw?.setActive(active);
        this.snap?.setActive(active);
    }

    isOwnFeature = (feature: FeatureLike) => {
        return feature.get(FEATURE_STYLE) === this.featureStyleKey;
    }
}
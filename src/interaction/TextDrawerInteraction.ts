import {DrawerInteraction} from './DrawerInteraction.js';
import VectorLayer from 'ol/layer/Vector.js';
import VectorSource from 'ol/source/Vector.js';
import {DrawEvent} from 'ol/interaction/Draw.js';
import {Select} from 'ol/interaction.js';
import Map from 'ol/Map.js';
import {CombinedOnSignature, EventTypes, OnSignature} from 'ol/Observable.js';
import {Types} from 'ol/ObjectEventType.js';
import BaseEvent from 'ol/events/Event.js';
import {SelectEvent} from 'ol/interaction/Select.js';
import first from 'lodash/first.js';
import {EventsKey} from 'ol/events.js';
import Feature, {FeatureLike} from 'ol/Feature.js';
import {Circle, Style, Text} from 'ol/style.js';
import {toRadians} from 'ol/math.js';
import {InteractionOnSignature} from 'ol/interaction/Interaction.js';
import Fill from 'ol/style/Fill.js';

export type TextDrawerOnSignature<Return> =
    OnSignature<'change:selected', TextDrawerEvent, Return>
    & CombinedOnSignature<EventTypes | Types | 'change:active' | 'change:selected', Return>
    & InteractionOnSignature<Return>;

const SELECTED = 'selected';

export class TextDrawerEvent extends BaseEvent {
    feature?: Feature;

    constructor(data?: Feature) {
        super(SELECTED);
        this.feature = data;
    }
}

const textStyle = new Style({
    text: new Text()
})
const transparentPoint = new Style({
    image: new Circle({
        radius: 5,
        fill: new Fill({
            color: 'rgba(125,125,125,1)'
        })
    })
})

const TEXT_STYLE_FUNC = (feature: FeatureLike) => {
    const styles = [textStyle];
    const text = textStyle.getText();
    const data = feature.getProperties();
    const bold = data.bold ? 'bold' : '';
    const italic = data.italic ? 'italic' : '';
    const fontSize = data.fontSize;
    text.setText([data.text, `${bold} ${italic} ${fontSize}px sarif`]);
    text.setRotation(toRadians(data.rotation));
    return styles;
}

export class TextDrawerInteraction extends DrawerInteraction {
    static readonly styleType = 'textLabel';
    select: Select;

    constructor(layer: VectorLayer<VectorSource>) {
        super({
            style: TEXT_STYLE_FUNC,
            featureStyleKey: TextDrawerInteraction.styleType,
            layer: layer,
            geometryType: 'Point'
        });
        this.select = new Select({
            layers: [layer],
            multi: false,
            filter: this.isOwnFeature,
            hitTolerance: 15,
            style: null
        });
        this.select.on('select', (e: SelectEvent) => {
            this.selected = first(e.selected);
        })
        this.addChangeListener(SELECTED, () => {
            this.select.getFeatures().clear();
            if (this.selected) { this.select.getFeatures().push(this.selected);}
        })
    }

    handleDrawEnd(e: DrawEvent) {
        super.handleDrawEnd(e);
        if (e.feature) {
            e.feature.setProperties({
                text: 'Новая надпись',
                fontSize: '16',
                bold: false,
                italic: false,
                rotation: 0
            })
        }
        this.selected = e.feature;
    }

    setMap(map: Map | null) {
        if (map) {
            map.addInteraction(this.select)
        } else if (this.getMap()) {
            this.getMap().removeInteraction(this.select);
        }
        super.setMap(map);
    }

    get selected(): Feature {
        return this.get(SELECTED);
    }

    set selected(value: Feature) {
        this.set(SELECTED, value);
    }

    setActive(active: boolean) {
        this.select?.setActive(active);
        this.selected=null;
        super.setActive(active);
    }

    declare on: TextDrawerOnSignature<EventsKey>;
    declare once: TextDrawerOnSignature<EventsKey>;
    declare un: TextDrawerOnSignature<void>;
}
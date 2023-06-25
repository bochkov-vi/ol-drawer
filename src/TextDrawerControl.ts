import {DrawerControl, DrawerControlOptions} from './DrawerControl.js';
import {TextDrawerInteraction} from './interaction/TextDrawerInteraction.js';
import Feature from 'ol/Feature.js';
import {LegendIcon} from './LegendIcon.js';
import VectorLayer from 'ol/layer/Vector.js';
import VectorSource from 'ol/source/Vector.js';


export class TextDrawerControl extends DrawerControl {
    popup;
    text = document.createElement('input');
    fontSize = document.createElement('input');
    rotation = document.createElement('input');
    bold = document.createElement('input');
    italic = document.createElement('input');


    constructor(layer: VectorLayer<VectorSource>) {
        const opts = {layer: layer} as DrawerControlOptions;
        opts.drawer = new TextDrawerInteraction(layer)
        opts.style = opts.drawer.style;
        opts.legend = new LegendIcon({
            style: opts.style,
            size: [64, 24],
            featureProperties: {text: 'Text', fontSize: 10},
            geometryType: 'Point'
        })
        super(opts);
        this.draw.on('change:selected', () => {
            if (this.draw.selected) {
                this.openPopup(this.draw.selected)
            } else {
                this.closePopup();
            }
        })

    }

    openPopup(feature: Feature) {
        this.text.value = feature.get('text');
        this.fontSize.value = feature.get('fontSize');
        this.rotation.value = feature.get('rotation');
        this.bold.checked = !!feature.get('bold');
        this.italic.checked = !!feature.get('italic');
        if (!this.popup) {
            this.popup = this.createPopup();
            this.element.appendChild(this.popup)
        }
        this.popup.style.display = 'block';

    }

    closePopup() {
        this.popup.style.display = 'none';
    }

    createPopup() {
        const popup = document.createElement('div')
        popup.classList.add('text-form');
        let label = document.createElement('label');
        label.innerText = 'Текст';
        label.appendChild(this.text)
        popup.appendChild(label);

        label = document.createElement('label');
        label.innerText = 'Размер шрифта';
        label.appendChild(this.fontSize)
        popup.appendChild(label);
        this.fontSize.type = 'number';
        this.fontSize.min = '14';
        this.fontSize.max = '48';
        label = document.createElement('label');
        label.innerText = 'Вращение';
        label.appendChild(this.rotation)
        popup.appendChild(label);

        this.rotation.type = 'range';
        this.rotation.min = '-90';
        this.rotation.max = '90';

        label = document.createElement('label');
        label.innerText = 'Жирный';
        label.appendChild(this.bold)
        popup.appendChild(label);

        this.bold.type = 'checkbox';
        label = document.createElement('label');
        label.innerText = 'Курсив';
        label.appendChild(this.italic)
        popup.appendChild(label);
        this.italic.type = 'checkbox';

        [this.italic, this.bold, this.fontSize, this.rotation, this.text].forEach(input => {
            input.addEventListener('input', () => {
                const feature = this.draw.selected;
                if (this.draw.selected) {
                    feature.set('text', this.text.value);
                    feature.set('fontSize', this.fontSize.value);
                    feature.set('rotation', this.rotation.value);
                    feature.set('bold', this.bold.checked)
                    feature.set('italic', this.italic.checked)
                }
            });
        })
        return popup;
    }

    declare draw: TextDrawerInteraction;
}

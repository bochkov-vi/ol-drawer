import {ActivatedControl} from './ActivatedControl.js';
import Map from 'ol/Map.js';
import VectorLayer from 'ol/layer/Vector.js';
import VectorSource from 'ol/source/Vector.js';
import {RemoveInteraction} from './interaction/RemoveInteraction.js';

export class RemoveControl extends ActivatedControl {
    remover: RemoveInteraction;
    constructor(layer: VectorLayer<VectorSource>,target:HTMLElement) {
        super({
            target:target,
            active: false,
            element: document.createElement('div')
        });
        this.remover = new RemoveInteraction(layer);
        this.element.innerText = 'Удалить';
        this.handleActiveChange(this.active);
        this.element.addEventListener('click', () => this.toggleActive());
    }

    protected handleActiveChange(active: boolean) {
        if (active)
            this.element.classList.add('active');
        else
            this.element.classList.remove('active');
        this.remover.setActive(active);
    }

    protected handleEnableChange(enable: boolean) {
        if (!enable) {
            this.remover.setActive(false);
        }
    }

    protected install(map: Map) {
        map.addInteraction(this.remover);
    }

    protected uninstall(map: Map) {
        map.removeInteraction(this.remover);
    }

}
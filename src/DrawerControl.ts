import {ActivatedControl, type Options as ActivatedControlOptions} from './ActivatedControl.js'
import {Map} from 'ol'
import {DrawerInteraction, DrawerInteractionOptions} from './interaction/DrawerInteraction.js';
import {LegendIcon} from './LegendIcon.js';


export type DrawerControlOptions = ActivatedControlOptions & DrawerInteractionOptions & {
    drawer?: DrawerInteraction,
    legend?: LegendIcon
};

export class DrawerControl extends ActivatedControl {
    draw: DrawerInteraction
    legend: LegendIcon;

    constructor(options: DrawerControlOptions) {
        options.element = document.createElement('div');
        super(options);
        this.draw = options.drawer ?? new DrawerInteraction(options);
        this.legend = options.legend ?? new LegendIcon({
            style: options.style,
            size: [64, 24],
            geometryType: options.geometryType,
        })
        this.legend.setTarget(this.element);
        this.legend.element.addEventListener('click', () => this.active = !this.active)
        this.element.classList.add('drawer-control');
        this.draw.setActive(this.active);
    }


    protected install(map: Map) {
        map.addInteraction(this.draw);
        map.addControl(this.legend);
    }

    protected uninstall(map: Map) {
        map.removeInteraction(this.draw);
        map.removeControl(this.legend);
    }

    protected handleActiveChange(active: boolean) {
        this.draw.setActive(active)
        if (active)
            this.element.classList.add('active')
        else
            this.element.classList.remove('active');
    }

    protected handleEnableChange(enable: boolean) {
        if (!enable) {
            this.draw.setActive(false);
        }
    }
}

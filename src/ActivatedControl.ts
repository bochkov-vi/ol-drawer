import {Map} from 'ol'
import {CombinedOnSignature, EventTypes, OnSignature} from 'ol/Observable.js';
import {Types} from 'ol/MapEventType.js';
import {ObjectEvent, ObjectOnSignature} from 'ol/Object.js';
import {EventsKey} from 'ol/events.js';
import Control, {Options as ControlOptions} from 'ol/control/Control.js'

export type ActivatedControlOnSignature<Return> =
    OnSignature<EventTypes, Event, Return>
    & OnSignature<Types | 'change:enabled' | 'change:active', ObjectEvent, Return>
    & CombinedOnSignature<EventTypes | Types | 'change:enabled' | 'change:active', Return>
    & ObjectOnSignature<Return>;

export type Options = { enabled?: boolean, active?: boolean } & ControlOptions;

export abstract class ActivatedControl extends Control {
    static readonly ENABLED = 'enabled';
    static readonly ACTIVE = 'active';

    declare on: ActivatedControlOnSignature<EventsKey>;
    declare once: ActivatedControlOnSignature<EventsKey>;
    declare un: ActivatedControlOnSignature<void>;


    constructor(options: Options) {
        super(options);
        this.enabled = options?.enabled ?? this.enabled;
        this.active = options?.active ?? this.active;
        this.addChangeListener(ActivatedControl.ENABLED, () => this.handleEnableChange(this.enabled));
        this.addChangeListener(ActivatedControl.ACTIVE, () => this.handleActiveChange(this.active));
    }

    get enabled(): boolean {
        return !!this.get(ActivatedControl.ENABLED);
    }

    set enabled(value: boolean) {
        this.set(ActivatedControl.ENABLED, value);
    }

    get active(): boolean {
        return !!this.get(ActivatedControl.ACTIVE);
    }

    set active(value: boolean) {
        this.set(ActivatedControl.ACTIVE, value);
    }

    /**
     * вызов идет из объекта карты
     * самое время настроить наш компонент
     * если map!=null компонент добавлен на карту
     * если map == nul, то значит компонент удаляется
     * @param map
     */
    setMap(map: Map | null) {
        if (map) {
            this.install(map);
        } else if (this.getMap()) {
            this.uninstall(this.getMap());
        }
        super.setMap(map);
    }

    protected abstract install(map: Map);

    protected abstract uninstall(map: Map) ;

    protected abstract handleActiveChange(active: boolean);

    protected abstract handleEnableChange(enable: boolean);
}
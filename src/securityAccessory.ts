import { Service, PlatformAccessory, CharacteristicValue, Nullable, Logger } from 'homebridge';
import { SectorPlatform } from './platform';

export class SecuritySystemAccessory {
  private service: Service;
  private currentState: CharacteristicValue;

  constructor(
    private readonly platform: SectorPlatform,
    private readonly accessory: PlatformAccessory,
  ) {
    this.currentState = this.handleSecuritySystemCurrentStateGet();
    // set accessory information
    this.accessory.getService(this.platform.Service.AccessoryInformation)!
      .setCharacteristic(this.platform.Characteristic.Manufacturer, 'Tech-IT')
      .setCharacteristic(this.platform.Characteristic.Model, 'SectorAlarm-Security')
      .setCharacteristic(this.platform.Characteristic.SerialNumber, '123456');

    // eslint-disable-next-line max-len
    this.service = this.accessory.getService(this.platform.Service.SecuritySystem) || this.accessory.addService(this.platform.Service.SecuritySystem);
    this.service.getCharacteristic(this.platform.Characteristic.SecuritySystemCurrentState)
      .onGet(this.handleSecuritySystemCurrentStateGet.bind(this));

    this.service.getCharacteristic(this.platform.Characteristic.SecuritySystemTargetState)
      .onGet(this.handleSecuritySystemTargetStateGet.bind(this))
      .onSet(this.handleSecuritySystemTargetStateSet.bind(this));

    setInterval(() => {
      this.service.updateCharacteristic(this.platform.Characteristic.SecuritySystemCurrentState, this.currentState ? this.currentState : 0);
    }, 10000);
  }

  /**
   * Handle requests to get the current value of the "Security System Current State" characteristic
   */
  handleSecuritySystemCurrentStateGet() {
    this.platform.log.info('Triggered GET SecuritySystemCurrentState');

    // set this to a valid value for SecuritySystemCurrentState
    const currentValue = this.platform.Characteristic.SecuritySystemCurrentState.STAY_ARM;
    this.currentState = currentValue;

    return currentValue;
  }


  /**
       * Handle requests to get the current value of the "Security System Target State" characteristic
       */
  handleSecuritySystemTargetStateGet() {
    this.platform.log.info('Triggered GET SecuritySystemTargetState');

    // set this to a valid value for SecuritySystemTargetState
    const currentValue = this.platform.Characteristic.SecuritySystemTargetState.STAY_ARM;

    return currentValue;
  }

  /**
       * Handle requests to set the "Security System Target State" characteristic
       */
  handleSecuritySystemTargetStateSet(value) {
    this.platform.log.info('Triggered SET SecuritySystemTargetState:', value);
    this.currentState = value;
  }
}

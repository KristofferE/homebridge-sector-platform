import {Service, PlatformAccessory, CharacteristicValue } from 'homebridge';
import { AlarmStatus } from './interfaces/Sector';
import { SectorPlatform } from './platform';
import { SectorAlarm } from './sector';

export class SecuritySystemAccessory {
  private service: Service;
  private currentState: CharacteristicValue =
    this.platform.Characteristic.SecuritySystemCurrentState.DISARMED;

  private targetState: CharacteristicValue | undefined;

  constructor(
    private readonly platform: SectorPlatform,
    private readonly accessory: PlatformAccessory,
    private readonly sectorAlarm: SectorAlarm,
  ) {
    // this.currentState = this.handleSecuritySystemCurrentStateGet();
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
  async handleSecuritySystemCurrentStateGet() {
    this.platform.log.info('Triggered GET SecuritySystemCurrentState');
    const alarmState: AlarmStatus = await this.sectorAlarm.getAlarmState();
    switch(alarmState) {
      case AlarmStatus.ARMED:
        this.currentState = this.platform.Characteristic.SecuritySystemCurrentState.AWAY_ARM;
        break;

      case AlarmStatus.PARTIALARMED:
        this.currentState = this.platform.Characteristic.SecuritySystemCurrentState.STAY_ARM;
        break;

      case AlarmStatus.DISARMED || AlarmStatus.UNAVAILABLE:
        this.currentState = this.platform.Characteristic.SecuritySystemCurrentState.DISARMED;
        break;
    }

    return this.currentState;
  }


  /**
       * Handle requests to get the current value of the "Security System Target State" characteristic
       */
  handleSecuritySystemTargetStateGet() {
    this.platform.log.info('Triggered GET SecuritySystemTargetState');
    return this.targetState !== undefined ? this.targetState : this.currentState;
  }

  /**
       * Handle requests to set the "Security System Target State" characteristic
       */
  async handleSecuritySystemTargetStateSet(value) {
    this.platform.log.info('Triggered SET SecuritySystemTargetState:', value);

    switch(value) {
      case this.platform.Characteristic.SecuritySystemTargetState.STAY_ARM:
        await this.sectorAlarm.partialArm();
        this.platform.log.info('Activated alarm in partial mode');
        break;
      case this.platform.Characteristic.SecuritySystemTargetState.NIGHT_ARM:
        await this.sectorAlarm.partialArm();
        this.platform.log.info('Activated alarm in partial mode');
        break;
      case this.platform.Characteristic.SecuritySystemTargetState.AWAY_ARM:
        await this.sectorAlarm.arm();
        this.platform.log.info('Activated alarm in armed mode');
        break;
      case this.platform.Characteristic.SecuritySystemTargetState.DISARM:
        await this.sectorAlarm.disarm();
        this.platform.log.info('Deactivate alarm');
        break;
    }
    this.currentState = value;
  }
}

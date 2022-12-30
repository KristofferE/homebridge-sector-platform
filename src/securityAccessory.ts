import { Service, PlatformAccessory, CharacteristicValue } from 'homebridge';
import { AlarmStatus } from './interfaces/Sector';
import { SectorPlatform } from './platform';
import { SectorAlarm } from './sector';

export class SecuritySystemAccessory {
  private service: Service;
  private targetState: CharacteristicValue | undefined;

  constructor(
    private readonly platform: SectorPlatform,
    private readonly accessory: PlatformAccessory,
    private readonly sectorAlarm: SectorAlarm,
  ) {
    const { AccessoryInformation, SecuritySystem } = this.platform.Service;
    const { Manufacturer,
      Model,
      SerialNumber,
      SecuritySystemCurrentState,
      SecuritySystemTargetState,
    } = this.platform.Characteristic;

    this.accessory.getService(AccessoryInformation)!
      .setCharacteristic(Manufacturer, 'Tech-IT')
      .setCharacteristic(Model, 'SectorAlarm-Security')
      .setCharacteristic(SerialNumber, '123456');

    // eslint-disable-next-line max-len
    this.service = this.accessory.getService(SecuritySystem) || this.accessory.addService(SecuritySystem);
    this.service.getCharacteristic(SecuritySystemCurrentState)
      .onGet(this.handleSecuritySystemCurrentStateGet.bind(this));

    this.service.getCharacteristic(SecuritySystemTargetState)
      .onGet(this.handleSecuritySystemTargetStateGet.bind(this))
      .onSet(this.handleSecuritySystemTargetStateSet.bind(this));

    setInterval(async () => {
      this.service.updateCharacteristic(SecuritySystemCurrentState, await this.handleSecuritySystemCurrentStateGet());
    }, 30000);
  }

  async handleSecuritySystemCurrentStateGet() {
    this.platform.log.debug('Triggered GET SecuritySystemCurrentState');
    const alarmState: AlarmStatus = await this.sectorAlarm.getAlarmState();
    const { SecuritySystemCurrentState } = this.platform.Characteristic;
    switch (alarmState) {
      case AlarmStatus.ARMED:
        return SecuritySystemCurrentState.AWAY_ARM;

      case AlarmStatus.PARTIALARMED:
        return SecuritySystemCurrentState.STAY_ARM;

      case AlarmStatus.DISARMED || AlarmStatus.UNAVAILABLE:
        return SecuritySystemCurrentState.DISARMED;

      default:
        return SecuritySystemCurrentState.DISARMED;
    }
  }

  async handleSecuritySystemTargetStateGet() {
    this.platform.log.debug('Triggered GET SecuritySystemTargetState');
    return this.targetState !== undefined ? this.targetState : await this.handleSecuritySystemCurrentStateGet();
  }

  async handleSecuritySystemTargetStateSet(value) {
    this.platform.log.debug('Triggered SET SecuritySystemTargetState:', value);
    const { SecuritySystemTargetState, SecuritySystemCurrentState } = this.platform.Characteristic;
    switch (value) {
      case SecuritySystemTargetState.STAY_ARM:
        await this.sectorAlarm.partialArm();
        this.service.updateCharacteristic(SecuritySystemCurrentState, SecuritySystemCurrentState.STAY_ARM);
        this.platform.log.debug('Activated alarm in partial mode');
        break;
      case SecuritySystemTargetState.NIGHT_ARM:
        await this.sectorAlarm.partialArm();
        this.service.updateCharacteristic(SecuritySystemCurrentState, SecuritySystemCurrentState.NIGHT_ARM);
        this.platform.log.debug('Activated alarm in partial mode');
        break;
      case SecuritySystemTargetState.AWAY_ARM:
        await this.sectorAlarm.arm();
        this.service.updateCharacteristic(SecuritySystemCurrentState, SecuritySystemCurrentState.AWAY_ARM);
        this.platform.log.debug('Activated alarm in armed mode');
        break;
      case SecuritySystemTargetState.DISARM:
        await this.sectorAlarm.disarm();
        this.service.updateCharacteristic(SecuritySystemCurrentState, SecuritySystemCurrentState.DISARMED);
        this.platform.log.debug('Deactivate alarm');
        break;
    }
  }
}

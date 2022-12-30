import { Service, PlatformAccessory, CharacteristicValue } from 'homebridge';
import { SectorAlarm } from './sector';
import { Door, DoorStatus, SectorJob } from './interfaces/Sector';

import { SectorPlatform } from './platform';
import { Device } from './interfaces/Device';

export class DoorAccessory {
  private service: Service;
  private deviceInfo: Device;
  private wantedPosition: CharacteristicValue | undefined;

  constructor(
    private readonly platform: SectorPlatform,
    private readonly accessory: PlatformAccessory,
    private readonly sectorAlarm: SectorAlarm,
  ) {
    const { AccessoryInformation, Door } = this.platform.Service;
    const { Manufacturer,
      Model,
      SerialNumber,
      Name,
      CurrentPosition,
      TargetPosition,
    } = this.platform.Characteristic;

    this.deviceInfo = accessory.context.device;
    this.accessory.getService(AccessoryInformation)!
      .setCharacteristic(Manufacturer, 'Tech-IT')
      .setCharacteristic(Model, 'SectorAlarm-Door')
      .setCharacteristic(SerialNumber, '123456');

    this.service = this.accessory.getService(Door) || this.accessory.addService(Door);

    this.service.setCharacteristic(Name, 'FrontDoorT');
    this.service.getCharacteristic(CurrentPosition)
      .onGet(this.getCurrent.bind(this));
    this.service.getCharacteristic(TargetPosition)
      .onGet(this.getTarget.bind(this))
      .onSet(this.setTarget.bind(this));

    setInterval(async () => {
      const { CurrentPosition } = this.platform.Characteristic;
      this.service.updateCharacteristic(CurrentPosition, await this.getCurrent());
    }, 30000);
  }

  async getCurrent(): Promise<CharacteristicValue> {
    const lock: Door | undefined = await this.sectorAlarm.getDoorState(this.deviceInfo.serialNo);
    this.platform.log.debug(`Get current position: ${lock !== undefined ? lock.Status : undefined}`);
    let position = 0;

    if (lock) {
      position = lock.Status === DoorStatus.OPEN ? 100 : 0;
    }
    return position;
  }

  async getTarget(): Promise<CharacteristicValue> {
    this.platform.log.debug(`Get target position: ${this.wantedPosition}`);
    return this.wantedPosition !== undefined ? this.wantedPosition : await this.getCurrent();
  }

  async setTarget(value: CharacteristicValue) {
    this.platform.log.debug(`Set target position: ${value}`);
    const { CurrentPosition } = this.platform.Characteristic;

    if (value > 0) {
      const sectorJobState = await this.sectorAlarm.unlockDoor(this.deviceInfo.serialNo);
      this.service.updateCharacteristic(CurrentPosition, sectorJobState === SectorJob.SUCCESS ? 100 : 0);
    } else {
      const sectorJobState = await this.sectorAlarm.lockDoor(this.deviceInfo.serialNo);
      this.service.updateCharacteristic(CurrentPosition, sectorJobState === SectorJob.SUCCESS ? 0 : 100);
    }
  }
}

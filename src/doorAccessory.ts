import { Service, PlatformAccessory, CharacteristicValue } from 'homebridge';
import { SectorAlarm } from './sector';
import { Door, DoorStatus, SectorJob } from './interfaces/Sector';

import { SectorPlatform } from './platform';
import { Device } from './interfaces/Device';

export class DoorAccessory {
  private service: Service;
  private deviceInfo: Device;
  private currentPosition: CharacteristicValue = 10;
  private wantedPosition: CharacteristicValue | undefined;

  constructor(
    private readonly platform: SectorPlatform,
    private readonly accessory: PlatformAccessory,
    private readonly sectorAlarm: SectorAlarm,
  ) {
    this.deviceInfo = accessory.context.device;
    this.accessory.getService(this.platform.Service.AccessoryInformation)!
      .setCharacteristic(this.platform.Characteristic.Manufacturer, 'Tech-IT')
      .setCharacteristic(this.platform.Characteristic.Model, 'SectorAlarm-Door')
      .setCharacteristic(this.platform.Characteristic.SerialNumber, '123456');

    this.service = this.accessory.getService(this.platform.Service.Door) || this.accessory.addService(this.platform.Service.Door);

    this.service.setCharacteristic(this.platform.Characteristic.Name, 'FrontDoorT');
    this.service.getCharacteristic(this.platform.Characteristic.CurrentPosition)
      .onGet(this.getCurrent.bind(this));
    this.service.getCharacteristic(this.platform.Characteristic.TargetPosition)
      .onGet(this.getTarget.bind(this))
      .onSet(this.setTarget.bind(this));

    setInterval(() => {
      this.service.updateCharacteristic(this.platform.Characteristic.CurrentPosition, this.currentPosition ? this.currentPosition : 0);
    }, 10000);
  }

  async getCurrent(): Promise<CharacteristicValue> {
    this.platform.log.debug(`Get current position: ${this.currentPosition}`);
    const lock: Door | undefined = await this.sectorAlarm.getDoorState(this.deviceInfo.serialNo);

    if (lock) {
      if (lock.Status === DoorStatus.OPEN) {
        this.service.updateCharacteristic(this.platform.Characteristic.CurrentPosition, 100);
        this.currentPosition = 100;
      } else {
        this.service.updateCharacteristic(this.platform.Characteristic.CurrentPosition, 0);
        this.currentPosition = 0;
      }
    }
    return this.currentPosition;
  }

  async getTarget(): Promise<CharacteristicValue> {
    this.platform.log.debug(`Get target position: ${this.wantedPosition}`);
    if (this.wantedPosition !== undefined) {
      return this.wantedPosition;
    } else {
      return this.currentPosition;
    }
  }

  async setTarget(value: CharacteristicValue) {
    this.platform.log.debug(`Set target position: ${value}`);
    if (value > 0) {
      const sectorJobState = await this.sectorAlarm.unlockDoor(this.deviceInfo.serialNo);
      if (sectorJobState === SectorJob.SUCCESS) {
        this.currentPosition = 100;
        this.service.updateCharacteristic(this.platform.Characteristic.CurrentPosition, 100);
      } else {
        this.currentPosition = 0;
        this.service.updateCharacteristic(this.platform.Characteristic.CurrentPosition, 0);
      }
    } else {
      const sectorJobState = await this.sectorAlarm.lockDoor(this.deviceInfo.serialNo);
      if (sectorJobState === SectorJob.SUCCESS) {
        this.currentPosition = 0;
        this.service.updateCharacteristic(this.platform.Characteristic.CurrentPosition, 0);
      } else {
        this.service.updateCharacteristic(this.platform.Characteristic.CurrentPosition, 100);
        this.currentPosition = 100;
      }
    }
  }
}

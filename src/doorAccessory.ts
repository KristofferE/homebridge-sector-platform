import { Service, PlatformAccessory, CharacteristicValue } from 'homebridge';
import { SectorAlarm } from './sector';
import { DoorState } from './interfaces/DoorState';

import { SectorPlatform } from './platform';

export class DoorAccessory {
  private service: Service;
  private currentPosition: CharacteristicValue = 10;
  private wantedPosition: CharacteristicValue | undefined;

  constructor(
    private readonly platform: SectorPlatform,
    private readonly accessory: PlatformAccessory,
    private readonly sectorAlarm: SectorAlarm,
  ) {

    // set accessory information
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
    this.platform.log.info(`Get current position: ${this.currentPosition}`);
    const listOfLocks: Array<DoorState> = this.sectorAlarm.getDoorStateSync();
    const data: DoorState = listOfLocks[0];

    if (data.Status === 'unlock') {
      this.currentPosition = 100;
    } else {
      this.currentPosition = 0;
    }
    return this.currentPosition;
  }

  async getTarget(): Promise<CharacteristicValue> {
    this.platform.log.info(`Get target position: ${this.wantedPosition}`);
    if (this.wantedPosition !== undefined) {
      return this.wantedPosition;
    } else {
      return this.currentPosition;
    }
  }

  async setTarget(value: CharacteristicValue) {
    this.platform.log.info(`Set target position: ${value}`);
    if (value > 0) {
      this.sectorAlarm.unlockDoor();
      this.currentPosition = 100;
    } else {
      this.sectorAlarm.lockDoor();
      this.currentPosition = 0;
    }
  }
}

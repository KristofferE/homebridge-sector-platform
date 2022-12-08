import { Service, PlatformAccessory, CharacteristicValue, Nullable, Logger } from 'homebridge';
import { SectorPlatform } from './platform';

export class TemperatureAccessory {
  private service: Service;
  private currentTemperature: CharacteristicValue = 0;

  constructor(
    private readonly platform: SectorPlatform,
    private readonly accessory: PlatformAccessory,
  ) {

    // set accessory information
    this.accessory.getService(this.platform.Service.AccessoryInformation)!
      .setCharacteristic(this.platform.Characteristic.Manufacturer, 'Tech-IT')
      .setCharacteristic(this.platform.Characteristic.Model, 'SectorAlarm-Temperature')
      .setCharacteristic(this.platform.Characteristic.SerialNumber, '123456');

    // eslint-disable-next-line max-len
    this.service = this.accessory.getService(this.platform.Service.TemperatureSensor) || this.accessory.addService(this.platform.Service.TemperatureSensor);
    this.service.getCharacteristic(this.platform.Characteristic.CurrentTemperature)
      .onGet(this.getCurrentTemperature.bind(this));
  }

  async getCurrentTemperature(): Promise<CharacteristicValue> {
    this.platform.log.info(`Get current position: ${this.currentTemperature}`);
    this.currentTemperature = 30;
    return this.currentTemperature;
  }
}

import { Service, PlatformAccessory, CharacteristicValue } from 'homebridge';
import { SectorPlatform } from './platform';
import { Temperature } from './interfaces/Sector';
import { SectorAlarm } from './sector';
import { Device } from './interfaces/Device';

export class TemperatureAccessory {
  private service: Service;
  private deviceInfo: Device;
  private currentTemperature: CharacteristicValue = 0;

  constructor(
    private readonly platform: SectorPlatform,
    private readonly accessory: PlatformAccessory,
    private sectorAlarm: SectorAlarm,
  ) {
    this.deviceInfo = accessory.context.device;
    // this.platform.log.info(`Device info: ${deviceInfo['serialNo']}`);
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
    const temperature: Temperature | undefined = await this.sectorAlarm.getTemperature(this.deviceInfo.serialNo);
    if (temperature) {
      this.currentTemperature = temperature.Temprature;
    } else {
      this.currentTemperature = 0;
    }
    return this.currentTemperature;
  }
}

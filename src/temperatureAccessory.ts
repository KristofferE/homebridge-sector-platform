import { Service, PlatformAccessory, CharacteristicValue } from 'homebridge';
import { SectorPlatform } from './platform';
import { Temperature } from './interfaces/Sector';
import { SectorAlarm } from './sector';
import { Device } from './interfaces/Device';

export class TemperatureAccessory {
  private service: Service;
  private deviceInfo: Device;

  constructor(
    private readonly platform: SectorPlatform,
    private readonly accessory: PlatformAccessory,
    private sectorAlarm: SectorAlarm,
  ) {
    const { AccessoryInformation, TemperatureSensor } = this.platform.Service;
    const { Manufacturer,
      Model,
      SerialNumber,
      CurrentTemperature,
    } = this.platform.Characteristic;

    this.deviceInfo = accessory.context.device;
    this.accessory.getService(AccessoryInformation)!
      .setCharacteristic(Manufacturer, 'Tech-IT')
      .setCharacteristic(Model, 'SectorAlarm-Temperature')
      .setCharacteristic(SerialNumber, '123456');

    // eslint-disable-next-line max-len
    this.service = this.accessory.getService(TemperatureSensor) || this.accessory.addService(TemperatureSensor);
    this.service.getCharacteristic(CurrentTemperature)
      .onGet(this.getCurrentTemperature.bind(this));
  }

  async getCurrentTemperature(): Promise<CharacteristicValue> {
    const temperature: Temperature | undefined = await this.sectorAlarm.getTemperature(this.deviceInfo.serialNo);
    this.platform.log.debug(`Get current position: ${temperature !== undefined ? temperature.Temprature : undefined}`);
    return temperature ? temperature.Temprature : 0;
  }
}

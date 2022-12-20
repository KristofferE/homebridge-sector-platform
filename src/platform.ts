import { API, DynamicPlatformPlugin, Logger, PlatformAccessory, PlatformConfig, Service, Characteristic } from 'homebridge';

import { PLATFORM_NAME, PLUGIN_NAME } from './settings';
import { DoorAccessory } from './doorAccessory';

import { Device, AccessoryType } from './interfaces/Device';
import { TemperatureAccessory } from './temperatureAccessory';
import { SecuritySystemAccessory } from './securityAccessory';
import { SectorAlarm } from './sector';

export class SectorPlatform implements DynamicPlatformPlugin {
  public readonly Service: typeof Service = this.api.hap.Service;
  public readonly Characteristic: typeof Characteristic = this.api.hap.Characteristic;
  private SectorAlarm: SectorAlarm;

  public readonly accessories: PlatformAccessory[] = [];

  constructor(
    public readonly log: Logger,
    public readonly config: PlatformConfig,
    public readonly api: API,
  ) {
    this.log.debug('Finished initializing platform:', this.config.name);

    this.SectorAlarm = new SectorAlarm({
      userId: config.userId,
      password: config.password,
      panelCode: config.panelCode,
      panelId: config.panelId,
    }, config, this.log);

    this.api.on('didFinishLaunching', () => {
      log.debug('Executed didFinishLaunching callback');
      this.discoverDevices();
    });
  }

  configureAccessory(accessory: PlatformAccessory) {
    this.log.info('Loading accessory from cache:', accessory.displayName);
    this.accessories.push(accessory);
  }

  async discoverDevices() {
    await this.SectorAlarm.init();
    const devices: Array<Device> = await this.SectorAlarm.getDevices();
    this.log.info(`Loaded devices: ${devices.length}`);

    for (const device of devices) {
      const uuid = this.api.hap.uuid.generate(device.serialNo);
      const existingAccessory = this.accessories.find(accessory => accessory.UUID === uuid);

      if (existingAccessory) {
        this.log.info('Restoring existing accessory from cache:', existingAccessory.displayName);

        if (device.accessoryType === AccessoryType.DOOR) {
          new DoorAccessory(this, existingAccessory, this.SectorAlarm);
        } else if (device.accessoryType === AccessoryType.TEMPERATURE) {
          new TemperatureAccessory(this, existingAccessory, this.SectorAlarm);
        } else if (device.accessoryType === AccessoryType.SECURITY) {
          new SecuritySystemAccessory(this, existingAccessory, this.SectorAlarm);
        }

      } else {
        this.log.info('Adding new accessory:', device.label);
        const accessory = new this.api.platformAccessory(device.label, uuid);
        accessory.context.device = device;

        if (device.accessoryType === AccessoryType.DOOR) {
          new DoorAccessory(this, accessory, this.SectorAlarm);
        } else if (device.accessoryType === AccessoryType.TEMPERATURE) {
          new TemperatureAccessory(this, accessory, this.SectorAlarm);
        } else if (device.accessoryType === AccessoryType.SECURITY) {
          new SecuritySystemAccessory(this, accessory, this.SectorAlarm);
        }
        this.api.registerPlatformAccessories(PLUGIN_NAME, PLATFORM_NAME, [accessory]);
      }
    }
  }
}

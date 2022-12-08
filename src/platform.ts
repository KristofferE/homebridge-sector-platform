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
      lockSerial: config.lockSerial,
      panelCode: config.panelCode,
      panelId: config.panelId,
    });

    this.api.on('didFinishLaunching', () => {
      log.debug('Executed didFinishLaunching callback');
      this.discoverDevices();
    });
  }

  configureAccessory(accessory: PlatformAccessory) {
    this.log.info('Loading accessory from cache:', accessory.displayName);
    this.accessories.push(accessory);
  }

  discoverDevices() {
    const devices: Array<Device> = [
      {
        accessoryType: 'door',
        uniqueId: 'sector-door',
        displayName: 'MyFrontDoor',
      },
      {
        accessoryType: 'temperature',
        uniqueId: 'temperature1',
        displayName: 'temperature1',
      },
      {
        accessoryType: 'temperature',
        uniqueId: 'temperature2',
        displayName: 'temperature2',
      },
      {
        accessoryType: 'security',
        uniqueId: 'security',
        displayName: 'myAlarm',
      },
    ];

    for (const device of devices) {
      const uuid = this.api.hap.uuid.generate(device.uniqueId);
      const existingAccessory = this.accessories.find(accessory => accessory.UUID === uuid);
      // const removeAccessory = this.accessories.find(accessory => accessory.UUID === 'd27abbb8-bcbe-47ec-9b05-aa3a9e9f6744');
      // this.log.info(`Remove: ${removeAccessory?.displayName}`);

      // if (removeAccessory) {

      //   // it is possible to remove platform accessories at any time using `api.unregisterPlatformAccessories`, eg.:
      //   // remove platform accessories when no longer present
      //   if (removeAccessory.UUID === 'd27abbb8-bcbe-47ec-9b05-aa3a9e9f6744') {
      //     this.api.unregisterPlatformAccessories(PLUGIN_NAME, PLATFORM_NAME, [removeAccessory]);
      //   }
      //   // this.log.info('Removing existing accessory from cache:', existingAccessory.displayName);
      // }

      if (existingAccessory) {
        this.log.info('Restoring existing accessory from cache:', existingAccessory.displayName);

        if (device.accessoryType === AccessoryType.DOOR) {
          new DoorAccessory(this, existingAccessory, this.SectorAlarm);
        } else if (device.accessoryType === AccessoryType.TEMPERATURE) {
          new TemperatureAccessory(this, existingAccessory);
        } else if (device.accessoryType === AccessoryType.SECURITY) {
          new SecuritySystemAccessory(this, existingAccessory);
        }

      } else {
        this.log.info('Adding new accessory:', device.displayName);
        const accessory = new this.api.platformAccessory(device.displayName, uuid);
        accessory.context.device = device;

        if (device.accessoryType === AccessoryType.DOOR) {
          new DoorAccessory(this, accessory, this.SectorAlarm);
        } else if (device.accessoryType === AccessoryType.TEMPERATURE) {
          new TemperatureAccessory(this, accessory);
        } else if (device.accessoryType === AccessoryType.SECURITY) {
          new SecuritySystemAccessory(this, accessory);
        }
        this.api.registerPlatformAccessories(PLUGIN_NAME, PLATFORM_NAME, [accessory]);
      }
    }
  }
}

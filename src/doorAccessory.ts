import { Service, PlatformAccessory, CharacteristicValue, Nullable } from 'homebridge';
import { SectorAlarm } from './sector';

import { SectorPlatform } from './platform';

/**
 * Platform Accessory
 * An instance of this class is created for each accessory your platform registers
 * Each accessory may expose multiple services of different service types.
 */
export class DoorAccessory {
  private service: Service;
  private currentPosition: CharacteristicValue = 10;
  private wantedPosition: CharacteristicValue | undefined;

  /**
   * These are just used to create a working example
   * You should implement your own code to track the state of your accessory
   */
  private exampleStates = {
    On: false,
    Brightness: 100,
  };

  constructor(
    private readonly platform: SectorPlatform,
    private readonly accessory: PlatformAccessory,
  ) {

    // set accessory information
    this.accessory.getService(this.platform.Service.AccessoryInformation)!
      .setCharacteristic(this.platform.Characteristic.Manufacturer, 'Tech-IT')
      .setCharacteristic(this.platform.Characteristic.Model, 'SectorAlarm-Door')
      .setCharacteristic(this.platform.Characteristic.SerialNumber, '123456');

    // get the LightBulb service if it exists, otherwise create a new LightBulb service
    // you can create multiple services for each accessory
    // this.service = this.accessory.getService(this.platform.Service.Lightbulb) || this.accessory.addService(this.platform.Service.Lightbulb);
    this.service = this.accessory.getService(this.platform.Service.Door) || this.accessory.addService(this.platform.Service.Door);

    // set the service name, this is what is displayed as the default name on the Home app
    // in this example we are using the name we stored in the `accessory.context` in the `discoverDevices` method.
    // this.service.setCharacteristic(this.platform.Characteristic.Name, accessory.context.device.exampleDisplayName);
    this.service.setCharacteristic(this.platform.Characteristic.Name, 'FrontDoorT');

    // each service must implement at-minimum the "required characteristics" for the given service type
    // see https://developers.homebridge.io/#/service/Lightbulb

    // register handlers for the On/Off Characteristic
    // this.service.getCharacteristic(this.platform.Characteristic.On)
    //   .onSet(this.setOn.bind(this))                // SET - bind to the `setOn` method below
    //   .onGet(this.getOn.bind(this));               // GET - bind to the `getOn` method below

    // // register handlers for the Brightness Characteristic
    // this.service.getCharacteristic(this.platform.Characteristic.Brightness)
    //   .onSet(this.setBrightness.bind(this));       // SET - bind to the 'setBrightness` method below
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
    return this.currentPosition;
  }

  async getTarget(): Promise<CharacteristicValue> {
    if (this.wantedPosition !== undefined) {
      return this.wantedPosition;
    } else {
      return this.currentPosition;
    }
  }

  async setTarget(value: CharacteristicValue) {
    this.currentPosition = value;
  }
}

import fetch, { Headers } from 'sync-fetch';
import * as jwt from 'jsonwebtoken';
import { Sector, Temperature, Door } from './interfaces/Sector';
import { Device, AccessoryType } from './interfaces/Device';

export class SectorAlarm {
  private baseUrl = 'https://mypagesapi.sectoralarm.net';
  private headers: Headers = new Headers();
  private userId: string;
  private password: string;
  // private lockSerial: string; // Retreived by system automatically
  private panelCode: string;
  private panelId: string;
  private platform = 'web';

  constructor(sectorConfig: Sector) {
    this.userId = sectorConfig.userId;
    this.password = sectorConfig.password;
    // this.lockSerial = sectorConfig.lockSerial;
    this.panelCode = sectorConfig.panelCode;
    this.panelId = sectorConfig.panelId;

    this.setHeaders();
    if (this.headers['Authorization'] === undefined) {
      this.getToken();
    } else if (this.headers['Authorization']) {
      this.checkTokenValidity();
    }
  }

  private setHeaders(): void {
    this.headers = {
      'API-Version': '6',
      'Platform': 'iOS',
      'User-Agent': '  SectorAlarm/387 CFNetwork/1206 Darwin/20.1.0',
      'Version': '2.0.27',
      'Connection': 'keep-alive',
      'Content-Type': 'application/json',
    };
  }

  private getToken(): void {
    const jsonData = {
      'UserId': this.userId,
      'Password': this.password,
    };
    const url = `${this.baseUrl}/api/Login/Login`;
    const responseMessage = fetch(url, {
      headers: this.headers,
      method: 'POST',
      body: JSON.stringify(jsonData),
    });

    const data = responseMessage.json();
    this.headers['Authorization'] = data['AuthorizationToken'];
  }

  private checkTokenValidity(): void {
    const decoded = jwt.decode(this.headers['Authorization'], { complete: true, json: true });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const payload = decoded?.payload as any;
    const dateNow = new Date('1970-01-01');
    dateNow.setSeconds(dateNow.getSeconds() + payload['exp']);
    const expires = dateNow;
    if (expires < new Date()) {
      this.getToken();
    }
  }

  public getDevices(): Array<Device> {
    const url = `${this.baseUrl}/api/Panel/GetPanel?${this.panelId}`;
    const responseMessage = fetch(url, {
      method: 'GET',
      headers: this.headers,
    });

    const sectorData = responseMessage.json();
    const locks: Array<Door> = sectorData['Locks'];
    const temps: Array<Temperature> = sectorData['Temperatures'];

    const devices: Array<Device> = new Array<Device>();
    locks.map(lock => devices.push({
      accessoryType: AccessoryType.DOOR,
      serialNo: lock.Serial,
      label: lock.Label,
    }));

    temps.map(temp => devices.push({
      accessoryType: AccessoryType.TEMPERATURE,
      serialNo: temp.SerialNo,
      label: temp.Label,
    }));

    return devices;
  }

  public getDoorState(serialNo: string): Door | undefined {
    const url = `${this.baseUrl}/api/Panel/GetLockStatus?panelId=${this.panelId}`;
    const responseMessage = fetch(url, {
      method: 'GET',
      headers: this.headers,
    });
    const doorStates: Array<Door> = responseMessage.json();
    const door: Door | undefined = doorStates.find(door => door.Serial === serialNo);
    return door;
  }

  public unlockDoor(serialNo: string): void {
    this.checkTokenValidity();
    const url = `${this.baseUrl}/api/Panel/Unlock`;

    fetch(url, {
      method: 'POST',
      headers: this.headers,

      body: JSON.stringify({
        lockSerial: serialNo,
        panelCode: this.panelCode,
        panelId: this.panelId,
        platform: this.platform,
      }),

    });
  }

  public lockDoor(serialNo: string): void {
    this.checkTokenValidity();
    const url = `${this.baseUrl}/api/Panel/Lock`;

    fetch(url, {
      method: 'POST',
      headers: this.headers,

      body: JSON.stringify({
        lockSerial: serialNo,
        panelCode: this.panelCode,
        panelId: this.panelId,
        platform: this.platform,
      }),

    });
  }

  public getTemperature(serialNo: string): Temperature | undefined {
    this.checkTokenValidity();
    const url = `${this.baseUrl}/api/Panel/GetTemperatures?panelId=${this.panelId}`;
    const responseMessage = fetch(url, {
      method: 'GET',
      headers: this.headers,
    });
    const temperatures: Array<Temperature> = responseMessage.json();
    const temp = temperatures.find(temp => temp.SerialNo === serialNo);
    return temp;
  }
}
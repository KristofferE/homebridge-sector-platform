// import fetch, { Headers } from 'node-fetch';
import axios, { AxiosHeaders } from 'axios';
import * as jwt from 'jsonwebtoken';
import { Sector, Temperature, Door, SectorJob, LoginInfo } from './interfaces/Sector';
import { Device, AccessoryType } from './interfaces/Device';

export class SectorAlarm {
  private baseUrl = 'https://mypagesapi.sectoralarm.net';
  private headers: any = new Headers();
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
    this.axiosConfig = {
      headers: this.headers,
    };
  }

  private setHeaders(): void {
    // this.headers = {
    //   'API-Version': '6',
    //   'Platform': 'iOS',
    //   'User-Agent': '  SectorAlarm/387 CFNetwork/1206 Darwin/20.1.0',
    //   'Version': '2.0.27',
    //   'Connection': 'keep-alive',
    //   'Content-Type': 'application/json',
    // };
    this.headers.set('API-Version', '6');
    this.headers.set('Platform', 'iOS');
    this.headers.set('User-Agent', 'SectorAlarm/387 CFNetwork/1206 Darwin/20.1.0');
    this.headers.set('Version', '2.0.27');
    this.headers.set('Connection', 'keep-alive');
    this.headers.set('Content-Type', 'application/json');
  }

  private async getToken(): Promise<void> {
    const jsonData = {
      'UserId': this.userId,
      'Password': this.password,
    };
    const url = `${this.baseUrl}/api/Login/Login`;
    // const responseMessage = await fetch(url, {
    //   headers: this.headers,
    //   method: 'POST',
    //   body: JSON.stringify(jsonData),
    // });
    const responseMessage = await axios.post<LoginInfo>(
      url,
      JSON.stringify(jsonData),
      this.axiosConfig,
    )
      .then(res => {
        // return res.data;
        this.headers.set('Authorization', res.data.AuthorizationToken);
      })
      .catch(error => {
        console.log(`Went to shit: ${error}`);
      })
      .then(final => {
        console.log(`Final: ${final}`);
      });

    // const loginInfo = await responseMessage.json() as LoginInfo;
    // this.headers['Authorization'] = responseMessage.AuthorizationToken;
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

  public async getDevices(): Promise<Array<Device>> {
    const url = `${this.baseUrl}/api/Panel/GetPanel?${this.panelId}`;
    // const responseMessage = await fetch(url, {
    //   method: 'GET',
    //   headers: this.headers,
    // });

    // const sectorData = await responseMessage.json() as any;
    const sectorData = await axios.get(url, this.axiosConfig)
      .then(res => {
        return res.data;
      });
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

  public async getDoorState(serialNo: string): Promise<Door | undefined> {
    const url = `${this.baseUrl}/api/Panel/GetLockStatus?panelId=${this.panelId}`;
    // const responseMessage = await fetch(url, {
    //   method: 'GET',
    //   headers: this.headers,
    // });
    // const doorStates: Array<Door> = await responseMessage.json() as Array<Door>;
    const doorStates = await axios.get<Array<Door>>(url, this.axiosConfig)
      .then(res => {
        return res.data;
      });
    return doorStates.find(door => door.Serial === serialNo);
  }

  public async unlockDoor(serialNo: string): Promise<SectorJob> {
    this.checkTokenValidity();
    const url = `${this.baseUrl}/api/Panel/Unlock`;

    // const responseMessage = await fetch(url, {
    //   method: 'POST',
    //   headers: this.headers,

    //   body: JSON.stringify({
    //     lockSerial: serialNo,
    //     panelCode: this.panelCode,
    //     panelId: this.panelId,
    //     platform: this.platform,
    //   }),

    // });
    const responseMessage = await axios.post(url, JSON.stringify({
      lockSerial: serialNo,
      panelCode: this.panelCode,
      panelId: this.panelId,
      platform: this.platform,
    }), this.axiosConfig);
    return responseMessage.status === 204 ? SectorJob.SUCCESS : SectorJob.FAILED;
  }

  public async lockDoor(serialNo: string): Promise<SectorJob> {
    this.checkTokenValidity();
    const url = `${this.baseUrl}/api/Panel/Lock`;

    // const responseMessage = await fetch(url, {
    //   method: 'POST',
    //   headers: this.headers,

    //   body: JSON.stringify({
    //     lockSerial: serialNo,
    //     panelCode: this.panelCode,
    //     panelId: this.panelId,
    //     platform: this.platform,
    //   }),

    // });
    const responseMessage = await axios.post(url, JSON.stringify({
      lockSerial: serialNo,
      panelCode: this.panelCode,
      panelId: this.panelId,
      platform: this.platform,
    }), this.axiosConfig);

    return responseMessage.status === 204 ? SectorJob.SUCCESS : SectorJob.FAILED;
  }

  public async getTemperature(serialNo: string): Promise<Temperature | undefined> {
    this.checkTokenValidity();
    const url = `${this.baseUrl}/api/Panel/GetTemperatures?panelId=${this.panelId}`;
    // const responseMessage = await fetch(url, {
    //   method: 'GET',
    //   headers: this.headers,
    // });
    // const temperatures: Array<Temperature> = await responseMessage.json() as Array<Temperature>;
    const temperatures = await axios.get<Array<Temperature>>(url, this.axiosConfig)
      .then(res => {
        return res.data;
      });
    const temp = temperatures.find(temp => temp.SerialNo === serialNo);
    return temp;
  }

  public async arm(): Promise<SectorJob> {
    this.checkTokenValidity();
    const url = `${this.baseUrl}/api/Panel/Arm`;
    // const responseMessage = await fetch(url, {
    //   method: 'POST',
    //   headers: this.headers,
    // });
    const responseMessage = await axios.post(url, this.axiosConfig);
    return responseMessage.status === 204 ? SectorJob.SUCCESS : SectorJob.FAILED;
  }

  public async partialArm(): Promise<SectorJob> {
    this.checkTokenValidity();
    const url = `${this.baseUrl}/api/Panel/PartialArm`;
    // const responseMessage = await fetch(url, {
    //   method: 'POST',
    //   headers: this.headers,
    // });
    const responseMessage = await axios.post(url, this.axiosConfig);
    return responseMessage.status === 204 ? SectorJob.SUCCESS : SectorJob.FAILED;
  }

  public async disarm(): Promise<SectorJob> {
    this.checkTokenValidity();
    const url = `${this.baseUrl}/api/Panel/Disarm`;
    // const responseMessage = await fetch(url, {
    //   method: 'POST',
    //   headers: this.headers,
    // });
    const responseMessage = await axios.post(url, this.axiosConfig);
    return responseMessage.status === 204 ? SectorJob.SUCCESS : SectorJob.FAILED;
  }
}
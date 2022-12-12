import axios from 'axios';
import * as jwt from 'jsonwebtoken';
import { Sector, Temperature, Door, SectorJob, LoginInfo, Panel, AlarmStatus } from './interfaces/Sector';
import { Device, AccessoryType } from './interfaces/Device';

export class SectorAlarm {
  private headers: any;
  private baseUrl = 'https://mypagesapi.sectoralarm.net';
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
  }

  private setHeaders(): void {
    this.headers = {
      'API-Version': '6',
      'Platform': 'iOS',
      'User-Agent': '  SectorAlarm/387 CFNetwork/1206 Darwin/20.1.0',
      'Version': '2.0.27',
      'Connection': 'keep-alive',
      'Content-Type': 'application/json',
      'Accept-Encoding': 'gzip, deflate',
      'Accept': '*/*',
    };
  }

  public async init(): Promise<void> {
    this.setHeaders();
    if (this.headers['Authorization'] === undefined) {
      await this.getToken();
    } else if (this.headers['Authorization']) {
      this.checkTokenValidity();
    }
  }

  private async getToken(): Promise<void> {
    const jsonData = {
      'UserId': this.userId,
      'Password': this.password,
    };
    const url = `${this.baseUrl}/api/Login/Login`;
    const responseMessage = await axios.post<LoginInfo>(
      url,
      JSON.stringify(jsonData),
      {
        headers: this.headers,
      },
    )
      .then(res => {
        this.headers['Authorization'] = res.data.AuthorizationToken;
      })
      .catch(error => {
        console.log(`Went to shit: ${error}`);
      })
      .then(final => {
        console.log(`Final: ${final}`);
      });
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

  public async getPanels(): Promise<Array<Panel>> {
    const url = `${this.baseUrl}/api/account/GetPanelList`;
    const panels: Array<Panel> = await axios.get<Array<Panel>>(url, { headers: this.headers })
      .then(res => {
        return res.data;
      });
    return panels;
  }

  public async getDevices(): Promise<Array<Device>> {
    const url = `${this.baseUrl}/api/Panel/GetPanel?${this.panelId}`;
    const sectorData = await axios.get(url, { headers: this.headers })
      .then(res => {
        return res.data;
      })
      .catch(error => {
        console.log(`Error: ${error}`);
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
    const doorStates = await axios.get<Array<Door>>(url, { headers: this.headers })
      .then(res => {
        return res.data;
      });
    return doorStates.find(door => door.Serial === serialNo);
  }

  public async unlockDoor(serialNo: string): Promise<SectorJob> {
    this.checkTokenValidity();
    const url = `${this.baseUrl}/api/Panel/Unlock`;
    const responseMessage = await axios.post(url, JSON.stringify({
      lockSerial: serialNo,
      panelCode: this.panelCode,
      panelId: this.panelId,
      platform: this.platform,
    }), { headers: this.headers });
    return responseMessage.status === 204 ? SectorJob.SUCCESS : SectorJob.FAILED;
  }

  public async lockDoor(serialNo: string): Promise<SectorJob> {
    this.checkTokenValidity();
    const url = `${this.baseUrl}/api/Panel/Lock`;
    const responseMessage = await axios.post(url, JSON.stringify({
      lockSerial: serialNo,
      panelCode: this.panelCode,
      panelId: this.panelId,
      platform: this.platform,
    }), { headers: this.headers });

    return responseMessage.status === 204 ? SectorJob.SUCCESS : SectorJob.FAILED;
  }

  public async getTemperature(serialNo: string): Promise<Temperature | undefined> {
    this.checkTokenValidity();
    const url = `${this.baseUrl}/api/Panel/GetTemperatures?panelId=${this.panelId}`;
    const temperatures = await axios.get<Array<Temperature>>(url, { headers: this.headers })
      .then(res => {
        return res.data;
      });
    const temp = temperatures.find(temp => temp.SerialNo === serialNo);
    return temp;
  }

  public async getAlarmState(): Promise<AlarmStatus> {
    // Retreive alarm status here...
    return AlarmStatus.DISARMED;
  }

  public async arm(): Promise<SectorJob> {
    this.checkTokenValidity();
    const url = `${this.baseUrl}/api/Panel/Arm`;
    const responseMessage = await axios.post(url, { headers: this.headers });
    return responseMessage.status === 204 ? SectorJob.SUCCESS : SectorJob.FAILED;
  }

  public async partialArm(): Promise<SectorJob> {
    this.checkTokenValidity();
    const url = `${this.baseUrl}/api/Panel/PartialArm`;
    const responseMessage = await axios.post(url, { headers: this.headers });
    return responseMessage.status === 204 ? SectorJob.SUCCESS : SectorJob.FAILED;
  }

  public async disarm(): Promise<SectorJob> {
    this.checkTokenValidity();
    const url = `${this.baseUrl}/api/Panel/Disarm`;
    const responseMessage = await axios.post(url, { headers: this.headers });
    return responseMessage.status === 204 ? SectorJob.SUCCESS : SectorJob.FAILED;
  }
}
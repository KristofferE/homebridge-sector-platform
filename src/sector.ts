import fetch, { Headers } from 'sync-fetch';
import * as jwt from 'jsonwebtoken';
import { Sector } from './interfaces/Sector';

export class SectorAlarm {
  private baseUrl = 'https://mypagesapi.sectoralarm.net';
  private headers: Headers = new Headers();
  private userId: string;
  private password: string;
  private lockSerial: string;
  private panelCode: string;
  private panelId: string;
  private platform = 'web';

  constructor(sectorConfig: Sector) {
    this.userId = sectorConfig.userId;
    this.password = sectorConfig.password;
    this.lockSerial = sectorConfig.lockSerial;
    this.panelCode = sectorConfig.panelCode;
    this.panelId = sectorConfig.panelId;

    this.setHeaders();
    if (this.headers['Authorization'] === undefined) {
      this.getToken();
    } else if (this.headers['Authorization']) {
      this.checkTokenValidity();
    }
  }

  private setHeaders() {
    this.headers = {
      'API-Version': '6',
      'Platform': 'iOS',
      'User-Agent': '  SectorAlarm/387 CFNetwork/1206 Darwin/20.1.0',
      'Version': '2.0.27',
      'Connection': 'keep-alive',
      'Content-Type': 'application/json',
    };
  }

  private getToken() {
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

  public getDoorStateSync() {
    const url = `${this.baseUrl}/api/Panel/GetLockStatus?panelId=${this.panelId}`;
    const responseMessage = fetch(url, {
      method: 'GET',
      headers: this.headers,
    });
    return responseMessage.json();
  }

  public unlockDoor() {
    this.checkTokenValidity();
    const url = `${this.baseUrl}/api/Panel/Unlock`;

    fetch(url, {
      method: 'POST',
      headers: this.headers,

      body: JSON.stringify({
        lockSerial: this.lockSerial,
        panelCode: this.panelCode,
        panelId: this.panelId,
        platform: this.platform,
      }),

    });
  }

  public lockDoor() {
    this.checkTokenValidity();
    const url = `${this.baseUrl}/api/Panel/Lock`;

    fetch(url, {
      method: 'POST',
      headers: this.headers,

      body: JSON.stringify({
        lockSerial: this.lockSerial,
        panelCode: this.panelCode,
        panelId: this.panelId,
        platform: this.platform,
      }),

    });
  }
}
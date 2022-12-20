
<p align="center">

<img src="https://github.com/homebridge/branding/raw/master/logos/homebridge-wordmark-logo-vertical.png" width="150">

</p>


## Setup plugin
When plugin is installed, you need to configure it with the required options. 

```json
{
    ...
    "platforms": [
         {
             "name": "homebridge-sector-plugin",
             "platform": "SectorPlatform",
             "userId": "user@name.com",
             "password": "top-secret-password",
             "panelCode": "your personal access code",
             "panelId": "Specific panelid for the sector site you want to manage",
             "showTemperatures": false
         }
     ],
}
```
### PanelCode: 
Would be the personal code you have created to turn on/off the alarm system. 
### PanelId: 
Can be found by inspecting the network log when logged into SectorAlarm MyPage. 

- Can only manage one site a time for the moment.
- Working on handling multiple. 
### ShowTemperatures: 
Due to slow api response time from sector, showing temperatures might slow down the platform. 


### Features to come
- Manage multiple SectorAlarm sites
- Manage registered SmartPlugs

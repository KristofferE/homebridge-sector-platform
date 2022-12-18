
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
PanelCode: Would be the personal code you have created to turn on/off the alarm system. 
ShowTemperatures: Due to slow api from sector, showing temperatures might slow down the platform. 

## Publish Package

When you are ready to publish your plugin to [npm](https://www.npmjs.com/), make sure you have removed the `private` attribute from the [`package.json`](./package.json) file then run:

```
npm publish
```

If you are publishing a scoped plugin, i.e. `@username/homebridge-xxx` you will need to add `--access=public` to command the first time you publish.

#### Publishing Beta Versions

You can publish *beta* versions of your plugin for other users to test before you release it to everyone.

```bash
# create a new pre-release version (eg. 2.1.0-beta.1)
npm version prepatch --preid beta

# publish to @beta
npm publish --tag=beta
```

Users can then install the  *beta* version by appending `@beta` to the install command, for example:

```
sudo npm install -g homebridge-example-plugin@beta
```



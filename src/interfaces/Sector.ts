import { Nullable } from 'homebridge';

export interface Sector {
	userId: string;
	password: string;
	lockSerial: string;
	panelCode: string;
	panelId: string;
}

export interface Temperature {
	Id: string;
	Label: string;
	SerialNo: string;
	Temprature: string; // Typo in SectorAlarm API
	DeviceId: string;
}

export interface Door {
	Label: string;
    PanelId: string;
    Serial: string;
    Status: string;
    SoundLevel: number;
    AutoLockEnabled: boolean;
    Languages: Nullable<string>;
}

export enum DoorStatus {
	OPEN = 'unlock',
	CLOSED = 'lock'
}

export interface PropertyContact {
	AppUserId: string;
	FirstName: string;
	LastName:string;
	PhoneNumber: string;
	AccessGroup: Nullable<number>;
	IsPropertyContact: boolean;
	IsInvite: boolean;
	AddSmartPlugUserOverride: boolean;
}

export interface Panel {
	PanelCodeLength: number;
	LockLanguage: number;
	HasAnnex: boolean;
	DisplayWizard: boolean;
	CanAddDoorLock: boolean;
	CanAddSmartplug: boolean;
	CanPartialArm: boolean;
	QuickArmEnabled: boolean;
	SupportsPanelUsers: boolean;
	SupportsTemporaryPanelUsers: boolean;
	SupportsRegisterDevices: boolean;
	InterviewDisplayStatus: boolean;
	PreInstallationWizardDone: boolean;
	CanChangeInstallationDate: boolean;
	ArcVideoConsent: Nullable<boolean>;
	WizardStep: boolean;
	PanelId: string;
	DisplayName: string;
	InstallationAddress: Nullable<string>;
	InstallationStatus: number;
	BookedStartDate: string;
	BookedEndDate: string;
	PropertyContact: PropertyContact;
	Wifi: Nullable<string>;
	HasVideo: boolean;
	Video: number;
	Access: Array<string>;
	Capabilities: Array<string>;
	Locks: Array<Door>;
	Smartplugs: [];
	Temperatures: Array<Temperature>;
	Photos: [];
}
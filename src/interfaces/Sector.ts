import { Nullable } from 'homebridge';

export interface Sector {
	userId: string;
	password: string;
	panelCode: string;
	panelId: string;
}

export interface Panel {
	PanelId: number;
	DisplayName: string;
	LegalOwnerName: string;
	AccessGroup: number;
	Status: number;
	InstallationStatus: number;
	IsDefaultPanel: boolean;
	PanelTime: string;
	Capabilities: Array<string>;
}

export interface PanelStatus {
	IsOnline: boolean;
	StatusTime: string;
	Status: AlarmStatus;
	AnnexStatus: AlarmStatus;
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

export enum AlarmStatus {
	UNAVAILABLE = 0,
	DISARMED = 1,
	PARTIALARMED = 2,
	ARMED = 3,
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
	PanelId: number;
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

export enum SectorJob {
	SUCCESS = 'success',
	FAILED = 'failed',
}

export interface User {
	UserId: number;
	UserName: string;
	FirstName: string;
	LastName: string;
	NationId: number;
	Nationality: number;
	UserCultureInfo: string;
	CustomerNo: string;
	CellPhone: string;
	Brand: number;
	IsEnterpriseCustomer: boolean;
	NationHasCRM: boolean;
	NationUserIRCam: boolean;
	NationCanAddSmartPlug: boolean;
	UpdatedTermsRequired: boolean;
	Features: Array<string>;
	UnreadMessages: number;
	Impersonation: boolean;
	ImpersonationUserName: Nullable<string>;
	ImpersonationUserId: number;
}

export interface Resources {
	CustomerServicePhone: string;
	TermsUrl: string;
	CustomerServiceUrl: string;
}

export interface LoginInfo {
	AuthorizationToken: string;
	User: User;
	Resources: Resources;
	DefaultPanelId: Nullable<number>;
}
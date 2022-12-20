export interface Device {
	accessoryType: string;
	serialNo: string;
	label: string;
}

export enum AccessoryType {
	DOOR = 'door',
	SECURITY = 'security',
	TEMPERATURE = 'temperature'
}
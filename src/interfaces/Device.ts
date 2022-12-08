export interface Device {
	accessoryType: string;
	uniqueId: string;
	displayName: string;
}

export enum AccessoryType {
	DOOR = 'door',
	SECURITY = 'security',
	TEMPERATURE = 'temperature'
}
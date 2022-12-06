import { Nullable } from "homebridge"

export interface DoorState {
	Label: string
	PanelId: string
	Serial: string
	Status: string
	SoundLevel: number
	AutoLockEnabled: boolean
	Languages: Nullable<string>
}
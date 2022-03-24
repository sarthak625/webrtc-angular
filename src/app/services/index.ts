import { FirebaseService } from "./firebase.service";
import { RtcService } from "./rtc.service";

export * from './firebase.service';
export * from './rtc.service';

export const services = [
    FirebaseService,
    RtcService,
];
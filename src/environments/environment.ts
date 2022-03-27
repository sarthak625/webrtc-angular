// This file can be replaced during build by using the `fileReplacements` array.
// `ng build --prod` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

export const environment = {
  production: false,
  servers: {
    iceServers: [
      {
        urls: ['stun:stun1.l.google.com:19302', 'stun:stun2.l.google.com:19302'],
      },
    ],
    iceCandidatePoolSize: 10,
  },
  socketServer: 'http://127.0.0.1:4000',
  apiServer: 'http://127.0.0.1:4000',

  firebase: {
    apiKey: "AIzaSyBfDEz8khr6A4h8A1zsVIrFTCBpOvmH3hU",
    authDomain: "fir-rtc-56621.firebaseapp.com",
    projectId: "fir-rtc-56621",
    storageBucket: "fir-rtc-56621.appspot.com",
    messagingSenderId: "758530780526",
    appId: "1:758530780526:web:1ecd0335d614ee4829e57f"
  }
};

/*
 * For easier debugging in development mode, you can import the following file
 * to ignore zone related error stack frames such as `zone.run`, `zoneDelegate.invokeTask`.
 *
 * This import should be commented out in production mode because it will have a negative impact
 * on performance if an error is thrown.
 */
// import 'zone.js/dist/zone-error';  // Included with Angular CLI.

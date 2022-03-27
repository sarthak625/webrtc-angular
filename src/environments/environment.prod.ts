export const environment = {
  production: true,
  servers: {
    iceServers: [
      {
        urls: ['stun:stun1.l.google.com:19302', 'stun:stun2.l.google.com:19302'],
      },
    ],
    iceCandidatePoolSize: 10,
  },
  firebase: {
    apiKey: "AIzaSyBfDEz8khr6A4h8A1zsVIrFTCBpOvmH3hU",
    authDomain: "fir-rtc-56621.firebaseapp.com",
    projectId: "fir-rtc-56621",
    storageBucket: "fir-rtc-56621.appspot.com",
    messagingSenderId: "758530780526",
    appId: "1:758530780526:web:1ecd0335d614ee4829e57f"
  }
};

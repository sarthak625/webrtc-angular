export const environment = {
  production: true,
  servers: {
    iceServers: [
      {
        urls: [
          'stun:stun3.l.google.com:19302',
          'stun:stun4.l.google.com:19302'
        ],
      },
    ],
    iceCandidatePoolSize: 10,
  },
  socketServer: 'https://nss.sarthaknegi.com',
  apiServer: 'https://sarthaknegi.com/node-signalling-server'
};

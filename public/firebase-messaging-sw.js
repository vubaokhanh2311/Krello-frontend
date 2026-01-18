importScripts(
  "https://www.gstatic.com/firebasejs/10.7.1/firebase-app-compat.js",
);
importScripts(
  "https://www.gstatic.com/firebasejs/10.7.1/firebase-messaging-compat.js",
);

firebase.initializeApp({
  apiKey: "AIzaSyCq_yBR19tkF7ZBDAKj7KI3qJQcH_74UvE",
  authDomain: "krello-11cfb.firebaseapp.com",
  projectId: "krello-11cfb",
  messagingSenderId: "841384297799",
  appId: "1:841384297799:web:f70e2c166aed019339b862",
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  self.registration.showNotification(
    payload.notification?.title ?? "Notification",
    {
      body: payload.notification?.body,
      icon: self.location.origin + "/logo.png",
      data: payload.data,
    },
  );
});

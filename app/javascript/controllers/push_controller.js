import { Controller } from "@hotwired/stimulus";

export default class extends Controller {
  connect() {
    var enableNotificationButton = document.getElementById('enable_notifications');

    if ("Notification" in window) {
      console.log('hi dog')
      let newthis = this
      enableNotificationButton.addEventListener("click", function(){
        Notification.requestPermission().then((permission) => {
        if (permission === "granted") {
          newthis.registerServiceWorker();
        } else if (permission === "denied") {
          console.log('DENIED')
          console.warn("User rejected to allow notifications.");
        } else {
          console.log('No PERMISSION')
          console.warn("User still didn't give an answer about notifications.");
        }
      })
      });
      
      Notification.requestPermission().then((permission) => {
        if (permission === "granted") {
          this.registerServiceWorker();
        } else if (permission === "denied") {
          console.log('DENIED')
          console.warn("User rejected to allow notifications.");
        } else {
          console.log('No PERMISSION')
          console.warn("User still didn't give an answer about notifications.");
        }
      });
    } else {
      console.warn("Push notifications not supported.");
    }
  }

  

  registerServiceWorker() {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker
        .register('/service_worker.js')
        .then((serviceWorkerRegistration) => {
          serviceWorkerRegistration.pushManager
            .getSubscription()
            .then((existingSubscription) => {
              if (!existingSubscription) {
                serviceWorkerRegistration.pushManager
                  .subscribe({
                    userVisibleOnly: true,
                    applicationServerKey: vapidPublicKey,
                  })
                  .then((subscription) => {
                    this.saveSubscription(subscription);
                  });
              }
            });
        })
        .catch((error) => {
          console.error("Error during registration Service Worker:", error);
        });
    }
  }

  saveSubscription(subscription) {
    const endpoint = subscription.endpoint;
    const p256dh = btoa(
      String.fromCharCode.apply(
        null,
        new Uint8Array(subscription.getKey("p256dh"))
      )
    );
    const auth = btoa(
      String.fromCharCode.apply(
        null,
        new Uint8Array(subscription.getKey("auth"))
      )
    );

    fetch("/admin/push_notifications/subscribe", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        "X-CSRF-Token": document
          .querySelector('meta[name="csrf-token"]')
          .getAttribute("content"),
      },
      body: JSON.stringify({ endpoint, p256dh, auth }),
    })
      .then((response) => {
        if (response.ok) {
          console.log("Subscription successfully saved on the server.");
        } else {
          console.error("Error saving subscription on the server.");
        }
      })
      .catch((error) => {
        console.error("Error sending subscription to the server:", error);
      });
  }
}
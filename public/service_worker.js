self.addEventListener('push', function(event) {
  const notificationData = JSON.parse(event.data.text());

  const options = {
    title: notificationData.title,
    body: notificationData.body,
    icon: notificationData.icon,
  };

  event.waitUntil(
    self.registration.showNotification(notificationData.title, options)
  );
});

  // urlB64ToUint8Array is a magic function that will encode the base64 public key
  // to Array buffer which is needed by the subscription option
  const urlB64ToUint8Array = (base64String) => {
    const padding = '='.repeat((4 - (base64String.length % 4)) % 4)
    const base64 = (base64String + padding).replace(/\-/g, '+').replace(/_/g, '/')
    const rawData = atob(base64)
    const outputArray = new Uint8Array(rawData.length)
    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i)
    }
    return outputArray
  }



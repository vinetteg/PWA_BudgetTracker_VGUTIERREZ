request.onupgradeneeded = function (e) {
  const db = request.result;
  db.createObjectStore(storeName, { keyPath: "_id" });
};

request.onerror = function (e) {
  console.log("There was an error");
};

function addToDatabase() {
  db = request.result;
  tx = db.transaction(storeName, "readwrite");
  store = tx.objectStore(storeName);

  fetch("/api/sdnous", {
    method: "POST",
  }).then();
}
request.onsuccess = function (e) {
  // get info from indexDB

  // store the info that's in indexdB into regular database if its online
  if (navigator.onLine) {
    addToDatabase();
  }
};

window.addEventListener("online", addToDatabase);

export function useIndexedDb(databaseName, storeName, method, object) {
  return new Promise((resolve, reject) => {
    const request = window.indexedDB.open(databaseName, 1);
    let db, tx, store;

    request.onupgradeneeded = function (e) {
      const db = request.result;
      db.createObjectStore(storeName, { keyPath: "_id" });
    };

    request.onerror = function (e) {
      console.log("There was an error");
    };

    request.onsuccess = function (e) {
      db = request.result;
      tx = db.transaction(storeName, "readwrite");
      store = tx.objectStore(storeName);

      db.onerror = function (e) {
        console.log("error");
      };
      if (method === "put") {
        store.put(object);
      }
      if (method === "get") {
        const all = store.getAll();
        all.onsuccess = function () {
          resolve(all.result);
        };
      }
      tx.oncomplete = function () {
        db.close();
      };
    };
  });
}

// export function checkForIndexedDb() {
//   if (!window.indexedDB) {
//     console.log("Your browser doesn't support a stable version of IndexedDB.");
//     return false;
//   }
//   return true;
// }

// request.onupgradeneeded = function (e) {
//   const db = request.result;
//   db.createObjectStore(storeName, { keyPath: "_id" });
// };

// request.onerror = function (e) {
//   console.log("There was an error");
// };

// function addToDatabase() {
//   db = request.result;
//   tx = db.transaction(storeName, "readwrite");
//   store = tx.objectStore(storeName);

//   fetch("/api/sdnous", {
//     method: "POST",
//   }).then();
// }
// request.onsuccess = function (e) {
//   // get info from indexDB

//   // store the info that's in indexdB into regular database if its online
//   if (navigator.onLine) {
//     addToDatabase();
//   }
// };

// window.addEventListener("online", addToDatabase);

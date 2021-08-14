let db;
let budgetVersion;

// Create a new db request for a "budget" database.
const request = indexedDB.open("BudgetDB", budgetVersion || 21);

request.onupgradeneeded = function (e) {
  console.log("Upgrade needed in IndexDB");

  const { oldVersion } = e;
  const newVersion = e.newVersion || db.version;

  console.log(`DB Updated from version ${oldVersion} to ${newVersion}`);

  db = e.target.result;

  if (db.objectStoreNames.length === 0) {
    db.createObjectStore("BudgetStore", { autoIncrement: true });
  }
};

request.onerror = function (e) {
  console.log(`Woops! ${e.target.errorCode}`);
};

function checkDatabase() {
  console.log("check db invoked");

  // Open a transaction on your BudgetStore db
  let transaction = db.transaction(["BudgetStore"], "readwrite");

  // access your BudgetStore object
  const store = transaction.objectStore("BudgetStore");

  // Get all records from store and set to a variable
  const getAll = store.getAll();

  // If the request was successful
  getAll.onsuccess = function () {
    // If there are items in the store, we need to bulk add them when we are back online
    if (getAll.result.length > 0) {
      fetch("/api/transaction/bulk", {
        method: "POST",
        body: JSON.stringify(getAll.result),
        headers: {
          Accept: "application/json, text/plain, */*",
          "Content-Type": "application/json",
        },
      })
        .then((response) => response.json())
        .then((res) => {
          // If our returned response is not empty
          if (res.length !== 0) {
            // Open another transaction to BudgetStore with the ability to read and write
            transaction = db.transaction(["BudgetStore"], "readwrite");

            // Assign the current store to a variable
            const currentStore = transaction.objectStore("BudgetStore");

            // Clear existing entries because our bulk add was successful
            currentStore.clear();
            console.log("Clearing store 🧹");
          }
        });
    }
  };
}

request.onsuccess = function (e) {
  console.log("success");
  db = e.target.result;

  // Check if app is online before reading from db
  if (navigator.onLine) {
    console.log("Backend online! 🗄️");
    checkDatabase();
  }
};

const saveRecord = (record) => {
  console.log("Save record invoked");
  // Create a transaction on the BudgetStore db with readwrite access
  const transaction = db.transaction(["BudgetStore"], "readwrite");

  // Access your BudgetStore object store
  const store = transaction.objectStore("BudgetStore");

  // Add record to your store with add method.
  store.add(record);
};

// Listen for app coming back online
window.addEventListener("online", checkDatabase);

// export function useIndexedDb(databaseName, storeName, method, object) {
//   return new Promise((resolve, reject) => {
//     const request = window.indexedDB.open(databaseName, 1);
//     let db, tx, store;

//     request.onupgradeneeded = function (e) {
//       const db = request.result;
//       db.createObjectStore(storeName, { keyPath: "_id" });
//     };

//     request.onerror = function (e) {
//       console.log("There was an error");
//     };

//     request.onsuccess = function (e) {
//       db = request.result;
//       tx = db.transaction(storeName, "readwrite");
//       store = tx.objectStore(storeName);

//       db.onerror = function (e) {
//         console.log("error");
//       };
//       if (method === "put") {
//         store.put(object);
//       }
//       if (method === "get") {
//         const all = store.getAll();
//         all.onsuccess = function () {
//           resolve(all.result);
//         };
//       }
//       tx.oncomplete = function () {
//         db.close();
//       };
//     };
//   });
// }

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

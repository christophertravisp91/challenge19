let db;
const request = indexedDB.open('budget_tracker',1);

request.onupgradeneeded = function(event) {
    const db = event.target.result;
    db.createObjectStore('new_budgetItem', { autoIncrement: true });
};

request.onsuccess = function(event) {
    db = event.target.result;
    if (navigator.onLine) {
        // uploadTransaction();
    }
};

request.onerror = function(event) {

    console.log(event.target.errorCode);
};

function saveRecord(record) {
    
    const transaction = db.transaction(['new_budgetItem'], 'readwrite');

    const budgetItemObjectStore = transaction.objectStore('new_budgetItem');

    budgetItemObjectStore.add(record);
}

function uploadTransaction() {
    const transaction = db.transaction(['new_budgetItem'], 'readwrite');

    const budgetObjectStore = transaction.objectStore('new_budgetItem');

    const getAll = budgetItemObjectStore.getAll();

    getAll.onsuccess = function() {
        if (getAll.result.length > 0) {
            fetch('/api/transaction', {
                method: 'POST',
                body: JSON.stringify(getAll.result),
                headers: {
                    Accept: 'application/json, text/plain, */*',
                    'Content-Type': 'application/json'
                }
            })
                .then(response => response.json())
                .then(serverResponse => {
                    if (serverResponse.message) {
                        throw new Error(serverResponse);
                    }

                    const transaction = db.transaction(['new_budgetItem'], 'readwrite');

                    const budgetItemObjectStore = transaction.objectStore('new_budgetItem');

                    budgetItemObjectStore.clear();

                    alert('All saved transactions has been submitted!');
                })
                .catch(err => {
                    console.log(err);
                });
        }
    }
}

window.addEventListener('online', uploadTransaction);

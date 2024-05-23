function downloadFile(blob, fileName) {
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', fileName);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
}

function updateFileName() {
    const fileInput = document.getElementById('fileInput');
    const fileNameElement = document.getElementById('fileName');
    if (fileInput.files.length > 0) {
        fileNameElement.textContent = fileInput.files[0].name;
    } else {
        fileNameElement.textContent = 'No file chosen';
    }
}

function encryptFile() {
    const fileInput = document.getElementById('fileInput');
    const password = document.getElementById('password').value;
    const file = fileInput.files[0];
    const keyString = localStorage.getItem('encryptionKey');

    if (!file || !password || !keyString) {
        alert('Please generate and save the key, select a file, and enter a password.');
        return;
    }

    const reader = new FileReader();
    reader.onload = function (e) {
        const fileData = e.target.result;
        const key = CryptoJS.enc.Utf8.parse(keyString);
        const encrypted = CryptoJS.AES.encrypt(fileData, key, { iv: key, padding: CryptoJS.pad.Pkcs7, mode: CryptoJS.mode.CBC });

        const zip = new JSZip();
        zip.file(file.name + '.enc', encrypted.toString());
        zip.file('encryption_key.txt', keyString);
        zip.generateAsync({ type: 'blob' }).then(function (blob) {
            const fileName = file.name + '.zip';
            downloadFile(blob, fileName);
        });
    };
    reader.readAsText(file);
}

function decryptFile() {
    const fileInput = document.getElementById('fileInput');
    const password = document.getElementById('password').value;
    const file = fileInput.files[0];
    const keyString = localStorage.getItem('encryptionKey');

    if (!file || !password || !keyString) {
        alert('Please generate and save the key, select a file, and enter a password.');
        return;
    }

    const reader = new FileReader();
    reader.onload = function (e) {
        const encryptedData = e.target.result;
        const key = CryptoJS.enc.Utf8.parse(keyString);
        try {
            const decrypted = CryptoJS.AES.decrypt(encryptedData, key, { iv: key, padding: CryptoJS.pad.Pkcs7, mode: CryptoJS.mode.CBC });
            const decryptedText = decrypted.toString(CryptoJS.enc.Utf8);

            if (!decryptedText) {
                throw new Error('Incorrect password or corrupted file');
            }

            const blob = new Blob([decryptedText], { type: 'text/plain' });
            const fileName = file.name.replace('.enc', '');
            downloadFile(blob, fileName);
        } catch (err) {
            alert('Failed to decrypt the file: ' + err.message);
        }
    };
    reader.readAsText(file);
}
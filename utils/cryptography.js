import CryptoJS from 'crypto-js';

const decrypt = (encryptedText, secretKey, fixedIV) => {
	const key = CryptoJS.enc.Utf8.parse(secretKey.padEnd(16, ' ')); // Pad to 16 bytes
	const iv = CryptoJS.enc.Utf8.parse(fixedIV.padEnd(16, ' ')); // Pad to 16 bytes

	const decrypted = CryptoJS.AES.decrypt(encryptedText, key, {
		iv: iv,
		mode: CryptoJS.mode.CBC,
		padding: CryptoJS.pad.Pkcs7,
	});
	return decrypted.toString(CryptoJS.enc.Utf8); // Convert to UTF-8 string
};

export { decrypt };

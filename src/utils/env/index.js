export function getEnv(key) {
	const value = process.env[key];

	if (!value) {
		throw new Error(`${key} not set`);
	}

	return value;
}

export function getToken() {
	return getEnv("TOKEN");
}

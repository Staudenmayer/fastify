export const verificationTimeout: number = Number.parseInt(
	process.env.VERIFICATION_TIMEOUT || '60',
	10,
);

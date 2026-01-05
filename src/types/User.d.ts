export default interface User {
	_id: string;
	username: string;
	email: string;
	password: string;
	verificationCode: string | null;
	verified: boolean;
	verifiedAt: Date | null;
	createdAt: Date;
}

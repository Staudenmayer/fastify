export default interface User {
	_id: string;
	username: string;
	email: string;
	password: string;
	verificationCode: string;
	verified: boolean;
	verifiedAt: Date;
	createdAt: Date;
}

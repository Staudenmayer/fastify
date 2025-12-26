export const password = {
	$id: 'password',
	title: 'password',
	type: 'string',
	description: 'The password of the account.',
	minLength: 10,
	example: 'password123#',
};

export const email = {
	$id: 'email',
	title: 'email',
	type: 'string',
	format: 'email',
	description: 'The email of the account.',
	example: 's.staudenmayer@outlook.com',
};

export const username = {
	$id: 'username',
	title: 'username',
	type: 'string',
	description: 'The username of the account.',
	minLength: 4,
	example: 'username',
};

export const id = {
	$id: 'userid',
	title: 'id',
	type: 'string',
	description: 'The accounts id.',
};

export const verified = {
	$id: 'userVerified',
	title: 'verified',
	type: 'boolean',
	description: 'Verification state of the account.',
};

export const verifiedAt = {
	$id: 'userVerifiedAt',
	title: 'verifiedAt',
	type: 'string',
	description: 'Verification date of the account.',
};

export const createdAt = {
	$id: 'userCreatedAt',
	title: 'createdAt',
	type: 'string',
	description: 'Account creation date.',
};

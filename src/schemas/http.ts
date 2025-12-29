export const error401 = {
	$id: 'error401',
	title: '401',
	type: 'object',
	properties: {
		message: {
			title: 'Unauthorized',
			type: 'string',
			description: 'The account is not authorized to access this path.',
		},
	},
};

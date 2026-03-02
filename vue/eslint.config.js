import prettier from 'eslint-config-prettier'
import vuetify from 'eslint-config-vuetify'

//const config = Object.assign(
//  await vuetify(),
//  prettier,
//  {
//    ingores: [
//      'out/**',
//      'dist/**',
//    ],
//  },
//)
const config = {
	...vuetify(),
	...prettier,
};
export default [
	{
		ignores: [
			'out/**',
			'dist/**',
		]
	},
	config,
];

import vuetify from 'eslint-config-vuetify';
import prettier from 'eslint-config-prettier';

export default {
	...vuetify({}), // Merges Vuetify rules
	...prettier, // Overrides formatting rules last
};

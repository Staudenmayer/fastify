<template>
	<div
		class="d-flex flex-column justify-center w-50 mx-auto"
		style="height: 100%"
	>
		<v-card
			class="mb-8 pa-4 d-flex justify-center flex-column"
			color="surface-variant"
			rounded="lg"
			variant="tonal"
		>
			<div class="pb-15 pt-8 text-h1 font-weight-bold text-center">Login</div>
			<v-form
				class="d-flex flex-column ga-5"
				@submit.prevent="handleLogin"
			>
				<v-text-field
					v-model="form.email"
					label="Email"
					placeholder="Email"
					prepend-inner-icon="mdi-email"
					required
					:rules="emailRules"
					variant="outlined"
				/>

				<password-field v-model="form.password" />

				<div class="d-flex justify-center">
					<v-btn
						block
						color="primary"
						:loading="loading"
						type="submit"
					>
						Sign In
					</v-btn>
				</div>
			</v-form>
			<v-btn
				class="mt-5"
				color="primary"
				to="/register"
				>Register</v-btn
			>
			<v-btn
				class="mt-5"
				color="primary"
				href="https://eu.posthog.com"
				target="_blank"
				>Posthog</v-btn
			>
		</v-card>
	</div>
</template>

<script setup lang="ts">
import { useAccountData } from '@/stores/account';

definePage({
	meta: {
		layout: 'blank',
	},
});

const form = reactive({
	email: '',
	password: '',
});
const showPassword = ref(false);
const router = useRouter();
const { login } = useAccountData();

const loading = ref(false);

// Form validation rules
const emailRules = [
	(v: string) => !!v || 'Email is required',
	(v: string) => /.+@.+\..+/.test(v) || 'Email must be valid',
];

async function handleLogin() {
	if (form.email && form.password) {
		loading.value = true;
		const loginSucceeded = await login({ email: form.email, password: form.password });
		if (loginSucceeded) {
			router.push('/');
		} else {
			form.password = '';
		}
		loading.value = false;
	}
}
</script>

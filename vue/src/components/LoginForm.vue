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

				<v-text-field
					v-model="form.password"
					label="Password"
					placeholder="Password"
					prepend-inner-icon="mdi-lock"
					required
					:rules="passwordRules"
					type="password"
					variant="outlined"
				/>

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
				href="https://eu.posthog.com"
				target="_blank"
				>Posthog</v-btn
			>
		</v-card>
	</div>
</template>

<script setup lang="ts">
const router = useRouter();
const form = reactive({
	email: '',
	password: '',
});

const loading = ref(false);

// Form validation rules
const emailRules = [
	(v: string) => !!v || 'Email is required',
	(v: string) => /.+@.+\..+/.test(v) || 'Email must be valid',
];

const passwordRules = [
	(v: string) => !!v || 'Password is required',
	(v: string) => v.length >= 6 || 'Password must be at least 6 characters',
];

async function handleLogin() {
	localStorage.setItem('token', 'test');
	router.push('/');
	return;
	if (form.email && form.password) {
		loading.value = true;

		try {
			// Replace with your actual login API call
			const response = await fetch('/api/login', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(form),
			});

			if (response.ok) {
				const data = await response.json();
				// Handle successful login (store token, redirect, etc.)
				console.log('Login successful:', data);
				localStorage.setItem('token', data.token);
				// router.push('/dashboard')
			} else {
				throw new Error('Login failed');
			}
		} catch (error) {
			console.error('Login error:', error);
			// Show error message to user
			alert('Login failed. Please check your credentials.');
		} finally {
			loading.value = false;
		}
	}
}
</script>

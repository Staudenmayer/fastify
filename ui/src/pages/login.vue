<template>
	<div class="mx-auto flex h-full w-1/2 flex-col justify-center">
		<v-card
			class="mb-8 flex flex-col justify-center p-4"
			color="surface-variant"
			rounded="lg"
			variant="tonal"
		>
			<div class="pb-[60px] pt-8 text-center text-[6rem] font-bold">Login</div>
			<v-btn
				class="mt-5"
				color="primary"
				@click="login"
				>Login</v-btn
			>
			<v-btn
				class="mt-5"
				color="primary"
				@click="logout"
				>Logout</v-btn
			>
		</v-card>
	</div>
</template>

<script setup lang="ts">
import { useAccountData } from '@/stores/account';
import { reactive, ref } from 'vue';
import { useRouter } from 'vue-router';
import PasswordField from '@/components/PasswordField.vue';

definePage({
	meta: {
		layout: 'blank',
	},
});

const form = reactive({
	email: '',
	password: '',
});
const router = useRouter();
const { login, logout } = useAccountData();
</script>

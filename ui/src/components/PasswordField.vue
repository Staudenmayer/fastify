<template>
	<v-text-field
		v-model="modelValue"
		:label="$props.text"
		:placeholder="$props.text"
		:prepend-inner-icon="$props.icon"
		:type="showPassword ? 'text' : 'password'"
		:append-inner-icon="showPassword ? 'mdi-eye-off' : 'mdi-eye'"
		@click:append-inner="togglePassword"
		:rules="passwordRules"
		variant="outlined"
		required
	/>
</template>

<script setup lang="ts">
import { ref } from 'vue';

interface Props {
	modelValue: string;
	text?: string;
	icon?: string;
}

const props = withDefaults(defineProps<Props>(), {
	text: 'Password',
	icon: 'mdi-lock',
});

const passwordRules = [
	(v: string) => !!v || 'Password is required',
	(v: string) => v.length >= 10 || 'Password must be at least 10 characters',
	(v: string) => /[A-Z]/.test(v) || 'Password must contain at least one uppercase letter',
	(v: string) => /[a-z]/.test(v) || 'Password must contain at least one lowercase letter',
	(v: string) => /[0-9]/.test(v) || 'Password must contain at least one number',
	(v: string) => /[^A-Za-z0-9]/.test(v) || 'Password must contain at least one symbol',
];

// Emits
const emit = defineEmits(['update:modelValue']);

const showPassword = ref(false);

// Computed binding for v-model
const modelValue = defineModel<string>({ required: true });

function togglePassword() {
	showPassword.value = !showPassword.value;
}
</script>

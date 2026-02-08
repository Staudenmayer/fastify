<template>
	<div class="pa-4">
		<h1>Item #{{ id }}</h1>
		<p>Item details for ID: {{ id }}</p>
		<v-btn @click="goBack">Back to List</v-btn>
	</div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router';

// Best practice: Use typed route with path parameter for full type safety
const route = useRoute<'/item/[id]'>();
const router = useRouter();

const id = route.params.id;

const goBack = () => {
	router.back();
};
</script>

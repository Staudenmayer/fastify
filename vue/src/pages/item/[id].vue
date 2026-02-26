<template>
	<Profile
		variant="account"
		:account="getAccount(id)"
	/>
</template>

<script setup lang="ts">
import { useAccountListData } from '@/stores/account-list';

// Best practice: Use typed route with path parameter for full type safety
const { getAccount } = useAccountListData();
const route = useRoute<'/item/[id]'>();
const id = ref<string>(route.params.id);
</script>

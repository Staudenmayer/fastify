<template>
	<v-menu
		v-model="menu"
		class="mr-5"
		location="bottom end"
		offset="8"
		transition="scale-transition"
	>
		<!-- Avatar button -->
		<template #activator="{ props }">
			<v-btn
				v-bind="props"
				class="avatar-btn"
				icon
				variant="text"
			>
				<v-avatar
					icon="mdi-account"
					image="https://avatars.githubusercontent.com/u/35968425?v=4&size=48"
					size="32"
				/>
			</v-btn>
		</template>

		<!-- Dropdown menu -->
		<v-card
			elevation="8"
			min-width="220"
			rounded="lg"
		>
			<v-list
				density="comfortable"
				nav
			>
				<!-- User info (optional but 🔥) -->
				<v-list-item>
					<template #prepend>
						<v-avatar size="32">
							<v-img src="https://avatars.githubusercontent.com/u/35968425?v=4&size=48" />
						</v-avatar>
					</template>

					<v-list-item-title class="font-weight-medium"> {{ name }} </v-list-item-title>
					<v-list-item-subtitle class="text-caption"> {{ email }} </v-list-item-subtitle>
				</v-list-item>

				<v-divider class="my-1" />

				<v-list-item
					v-for="item in items"
					:key="item.key"
					@click="item.onClick"
				>
					<template #prepend>
						<v-icon
							:color="item.color"
							size="18"
						>
							{{ item.icon }}
						</v-icon>
					</template>
					<v-list-item-title :class="getTextColor(item.color)">
						{{ item.text }}
					</v-list-item-title>
				</v-list-item>
			</v-list>
		</v-card>
	</v-menu>
</template>

<script setup lang="ts">
import { useAccountData } from '@/stores/account';
const router = useRouter();
const menu = ref(false);
const { id, email, name, logout: accountLogout } = useAccountData();

const items = ref([
	{
		key: 'profile',
		onClick: handleAccount,
		icon: 'mdi-account',
		text: 'Profile',
		color: 'default',
	},
	{
		key: 'logout',
		onClick: logout,
		icon: 'mdi-logout',
		text: 'Logout',
		color: 'error',
	},
]);

function getTextColor(color: string) {
	return `text-${color}`;
}

async function logout() {
	menu.value = false;
	await accountLogout();
	router.push('/login');
}

function handleAccount() {
	menu.value = false;
	router.push('/account');
}
</script>

<template>
	<v-app>
		<v-app-bar
			app
			density="compact"
			height="64"
		>
			<v-app-bar-nav-icon @click="drawer = !drawer" />
			<v-toolbar-title class="font-weight-bold"> My Application </v-toolbar-title>

			<v-spacer />

			<v-btn icon>
				<v-icon>mdi-bell</v-icon>
			</v-btn>
			<v-btn
				:icon="current.dark ? 'mdi-weather-sunny' : 'mdi-weather-night'"
				size="x-large"
				variant="text"
				@click="toggleTheme"
			/>

			<Avatar />
			<div class="pr-7" />
		</v-app-bar>

		<!-- Navigation Drawer -->
		<v-navigation-drawer
			v-model="drawer"
			app
			disable-resize-watcher
			width="256"
		>
			<v-list
				density="compact"
				nav
			>
				<v-list-item
					v-for="item in navItems"
					:key="item.title"
					color="primary"
					:prepend-icon="item.icon"
					:title="item.title"
					:to="item.to"
				/>
			</v-list>
		</v-navigation-drawer>

		<!-- Scrollable Main Content -->
		<v-main
			class="main-scroll px-2"
			@click="drawer = false"
		>
			<v-container
				fluid
				style="height: 100%"
			>
				<router-view />
			</v-container>
		</v-main>

		<!-- Footer -->
		<!--<AppFooter />-->
	</v-app>
</template>

<script setup lang="ts">
import { useTheme } from 'vuetify';

const drawer = ref(false);
const { toggle, current } = useTheme();

function toggleTheme() {
	toggle();
}

const navItems = [
	{ title: 'Dashboard', icon: 'mdi-view-dashboard', to: '/' },
	{ title: 'Accounts', icon: 'mdi-account-group', to: '/account-list' },
	{ title: 'Map', icon: 'mdi-map', to: '/map' },
];
</script>

<style scoped>
.main-scroll {
	height: 100vh;
	overflow-y: auto;
}
</style>

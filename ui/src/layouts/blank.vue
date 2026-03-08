<template>
	<v-app>
		<!-- Scrollable Main Content -->
		<v-main class="main-scroll">
			<v-container
				fluid
				style="height: 100%"
			>
				<router-view />
			</v-container>
		</v-main>

		<AppFooter />
	</v-app>
</template>

<script setup lang="ts"></script>

<template>
  <v-app>
    <!-- App Bar -->
    <v-btn :icon="current.dark ? 'mdi-weather-sunny' : 'mdi-weather-night'" size="x-large" variant="text" @click="toggleTheme" />
    <v-app-bar
      app
      density="compact"
      height="64"
    >
      <v-app-bar-nav-icon @click="drawer = !drawer" />
      <v-toolbar-title class="font-weight-bold">
        My Application
      </v-toolbar-title>

      <v-spacer />

      <v-btn icon>
        <v-icon>mdi-bell</v-icon>
      </v-btn>

      <Avatar />
      <div class="pr-7" />
    </v-app-bar>

    <!-- Navigation Drawer -->
    <v-navigation-drawer
      v-model="drawer"
      app
      width="256"
    >
      <v-list density="compact" nav>
        <v-list-item
          v-for="item in navItems"
          :key="item.title"
          color="primary"
          :prepend-icon="item.icon"
          :title="item.title"
          :to="item.to"
          @click="drawer = false"
        />
      </v-list>
    </v-navigation-drawer>

    <!-- Scrollable Main Content -->
    <v-main class="main-scroll pt-0 px-2">
      <v-container fluid style="height: 100%;">
        <router-view />
      </v-container>
    </v-main>

    <!-- Footer -->
    <AppFooter />
  </v-app>
</template>

<script setup lang="ts">
  import { useTheme } from 'vuetify'

  const drawer = ref(false)
  const { toggle, current } = useTheme()

  function toggleTheme () {
    toggle()
  }

  const navItems = [
    { title: 'Dashboard', icon: 'mdi-view-dashboard', to: '/' },
    { title: 'Users', icon: 'mdi-account-group', to: '/users' },
  ]
</script>

<style scoped>
.main-scroll {
  height: calc(100vh - 64px); /* App-bar height */
  overflow-y: auto;
}
</style>

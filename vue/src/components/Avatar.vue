<template>
  <v-menu
    v-model="menu"
    location="bottom end"
    offset="8"
    transition="scale-transition"
    class="mr-5"
  >
    <!-- Avatar button -->
    <template #activator="{ props }">
      <v-btn
        v-bind="props"
        icon
        class="avatar-btn"
        variant="text"
      >
        <v-avatar size="32" image="https://avatars.githubusercontent.com/u/35968425?v=4&size=48" icon="mdi-account"></v-avatar>
      </v-btn>
    </template>

    <!-- Dropdown menu -->
    <v-card min-width="220" elevation="8" rounded="lg">
      <v-list density="comfortable" nav>
        <!-- User info (optional but 🔥) -->
        <v-list-item>
          <template #prepend>
            <v-avatar size="32">
              <v-img src="https://avatars.githubusercontent.com/u/35968425?v=4&size=48" />
            </v-avatar>
          </template>

          <v-list-item-title class="font-weight-medium">
            John Doe
          </v-list-item-title>
          <v-list-item-subtitle class="text-caption">
            john@example.com
          </v-list-item-subtitle>
        </v-list-item>

        <v-divider class="my-1" />

        <v-list-item v-for="item in items" @click="item.onClick">
          <template #prepend>
            <v-icon size="18" :color="item.color">
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
const router = useRouter()
const menu = ref(false)

const items = ref([
  {
    onClick: handleProfile,
    icon: 'mdi-account',
    text: 'Profile',
    color: 'default'
  },
  {
    onClick: logout,
    icon: 'mdi-logout',
    text: 'Logout',
    color: 'error'
  }
])

function getTextColor(color: string) {
  return `text-${color}`;
}

function logout() {
  menu.value = false
  localStorage.removeItem('token')
  router.push('/login')
}

function handleProfile() {
  menu.value = false
  router.push('/profile')
}
</script>

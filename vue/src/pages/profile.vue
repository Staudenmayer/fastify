<template>
  <v-container class="py-10">
    <v-row justify="center">
      <v-col cols="12" sm="10" md="6">
        <v-card elevation="8" rounded="lg">
          <v-card-title class="text-h6">
            Edit Profile
          </v-card-title>

          <v-divider />

          <v-card-text>
            <v-form @submit.prevent="saveProfile">
              <!-- Avatar Upload Section -->
              <div class="d-flex flex-column align-center mb-6">
                <div
                  class="avatar-upload"
                  @click="triggerFileInput"
                  role="button"
                  tabindex="0"
                  @keydown.enter="triggerFileInput"
                  @keydown.space="triggerFileInput"
                >
                  <v-avatar size="96" class="mb-3" :image="avatarPreview" icon="mdi-account"></v-avatar>

                  <div class="avatar-overlay">
                    <v-icon size="24" color="white">mdi-camera-plus</v-icon>
                    <div class="upload-text">Upload photo</div>
                  </div>

                  <input
                    ref="fileInput"
                    type="file"
                    accept="image/*"
                    @change="onAvatarChange"
                    class="d-none"
                  />
                </div>
              </div>

              <!-- Username -->
              <v-text-field
                v-model="form.username"
                label="Username"
                prepend-inner-icon="mdi-account"
                variant="outlined"
                required
              />

              <!-- Email -->
              <v-text-field
                v-model="form.email"
                label="Email"
                prepend-inner-icon="mdi-email"
                variant="outlined"
                type="email"
                required
              />

              <!-- Password section -->
              <v-divider class="my-6" />

              <div class="text-subtitle-2 mb-3">
                Change Password
              </div>

              <v-text-field
                v-model="form.currentPassword"
                label="Current password"
                type="password"
                prepend-inner-icon="mdi-lock"
                variant="outlined"
              />

              <v-text-field
                v-model="form.newPassword"
                label="New password"
                type="password"
                prepend-inner-icon="mdi-lock-plus"
                variant="outlined"
              />

              <v-text-field
                v-model="form.confirmPassword"
                label="Confirm new password"
                type="password"
                prepend-inner-icon="mdi-lock-check"
                variant="outlined"
              />

              <!-- Actions -->
              <v-card-actions class="mt-4 px-0">
                <v-spacer />
                <v-btn
                  color="primary"
                  type="submit"
                  :loading="loading"
                  @click="$router.back()"
                >
                  Save Changes
                </v-btn>
              </v-card-actions>
            </v-form>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup lang="ts">
import { ref, onUnmounted } from 'vue'

const loading = ref(false)
const fileInput = ref<HTMLInputElement | null>(null)

const form = ref({
  username: 'JohnDoe',
  email: 'john@example.com',
  avatar: undefined as File | undefined,
  currentPassword: '',
  newPassword: '',
  confirmPassword: '',
})

const avatarPreview = ref(
  'https://avatars.githubusercontent.com/u/35968425?v=4&size=96'
)

function triggerFileInput() {
  fileInput.value?.click()
}

function onAvatarChange(event: Event) {
  const target = event.target as HTMLInputElement
  const files = target?.files
  if (!files || files.length === 0) return

  const file = files[0]
  if(file) {
    form.value.avatar = file
    avatarPreview.value = URL.createObjectURL(file)
  }

  // Reset input value to allow same file re-upload
  target.value = ''
}

async function saveProfile() {
  // Basic password validation
  if (
    form.value.newPassword &&
    form.value.newPassword !== form.value.confirmPassword
  ) {
    alert('Passwords do not match')
    return
  }

  loading.value = true

  try {
    /**
     * Example:
     * const payload = new FormData()
     * payload.append('username', form.value.username)
     * payload.append('email', form.value.email)
     * if (form.value.avatar) payload.append('avatar', form.value.avatar)
     * if (form.value.newPassword) payload.append('password', form.value.newPassword)
     *
     * await api.put('/me', payload)
     */
  } finally {
    loading.value = false
  }
}

// Cleanup object URLs
onUnmounted(() => {
  if (avatarPreview.value && !avatarPreview.value.startsWith('https')) {
    URL.revokeObjectURL(avatarPreview.value)
  }
})
</script>

<style scoped>
.avatar-upload {
  position: relative;
  display: inline-block;
  cursor: pointer;
  transition: transform 0.2s ease;
}

.avatar-upload:hover {
  transform: scale(1.05);
}

.avatar-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  opacity: 0;
  transition: opacity 0.3s ease;
  color: white;
  font-weight: 500;
}

.avatar-upload:hover .avatar-overlay {
  opacity: 1;
}

.upload-text {
  font-size: 12px;
  margin-top: 4px;
  text-align: center;
  line-height: 1.2;
}

.d-none {
  display: none !important;
}
</style>

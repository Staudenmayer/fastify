<template>
  <v-container class="fill-height d-flex align-center" max-width="900">
    <div>
      <v-img
        class="mb-4"
        height="150"
        src="@/assets/logo.png"
      />

      <div class="mb-8 text-center">
        <div class="text-body-2 font-weight-light mb-n1">Welcome to</div>
        <h1 class="text-h2 my-0 font-weight-bold">Vuetify</h1>
      </div>

      <v-card class="mb-8 py-4 d-flex ga-5 justify-center" color="surface-variant" rounded="lg" variant="tonal">
        <v-btn @click="getData" color="primary">Test</v-btn>
          <v-btn @click="add" color="primary">Add Count {{ count }}</v-btn>
          <v-btn @click="sub" color="primary">Subtract Count {{ count }}</v-btn>
          <v-btn href="https://eu.posthog.com" target="_blank" color="primary">Posthog</v-btn>
      </v-card>

      <v-card class="mb-8 pa-4 d-flex justify-center flex-column" color="surface-variant" rounded="lg" variant="tonal">
        <v-form @submit.prevent="handleLogin">
          <v-text-field
            v-model="form.email"
            variant="outlined"
            placeholder="Email"
            label="Email"
            prepend-inner-icon="mdi-email"
            :rules="emailRules"
            required>
          </v-text-field>

          <v-text-field
            v-model="form.password"
            variant="outlined"
            placeholder="Password"
            label="Password"
            type="password"
            prepend-inner-icon="mdi-lock"
            :rules="passwordRules"
            required>
          </v-text-field>

          <div class="d-flex justify-center">
            <v-btn
              color="primary"
              type="submit"
              :loading="loading"
              block>
              Sign In
            </v-btn>
          </div>
        </v-form>
      </v-card>

      <v-row>
        <v-col cols="12">
          <v-card
            class="py-4"
            color="surface-variant"
            image="https://cdn.vuetifyjs.com/docs/images/one/create/feature.png"
            prepend-icon="mdi-rocket-launch-outline"
            rounded="lg"
            variant="tonal"
          >
            <template #image>
              <v-img position="top right" />
            </template>

            <template #title>
              <h2 class="text-h5 font-weight-bold">
                Get started
              </h2>
            </template>

            <template #subtitle>
              <div class="text-subtitle-1">
                Change this page by updating <v-kbd>{{ `<HelloWorld />` }}</v-kbd> in <v-kbd>components/HelloWorld.vue</v-kbd>.
              </div>
            </template>
          </v-card>
        </v-col>

        <v-col v-for="link in links" :key="link.href" cols="6">
          <v-card
            append-icon="mdi-open-in-new"
            class="py-4"
            color="surface-variant"
            :href="link.href"
            :prepend-icon="link.icon"
            rel="noopener noreferrer"
            rounded="lg"
            :subtitle="link.subtitle"
            target="_blank"
            :title="link.title"
            variant="tonal"
          />
        </v-col>
      </v-row>
    </div>
  </v-container>
</template>

<script setup lang="ts">
  import axios from 'axios';
  import { useOTEL } from '@/composables/otel.ts';
  const { meter, logger } = useOTEL();
  const count = ref(0);

  const upDownCounter =  meter.createUpDownCounter('test_up_down_counter', {
    description: 'Example of a UpDownCounter',
  });

  function add() {
    count.value += 1;
    logger.info('User clicked button', {
      buttonId: 'save',
      count: count.value,
    });
    upDownCounter.add(1);
  }

  function sub() {
    count.value -= 1;
    logger.info('User clicked button', {
      buttonId: 'save',
      count: count.value
    });
    upDownCounter.add(-1);
  }
  const links = [
    {
      href: 'https://vuetifyjs.com/',
      icon: 'mdi-text-box-outline',
      subtitle: 'Learn about all things Vuetify in our documentation.',
      title: 'Documentation',
    },
    {
      href: 'https://vuetifyjs.com/introduction/why-vuetify/#feature-guides',
      icon: 'mdi-star-circle-outline',
      subtitle: 'Explore available framework Features.',
      title: 'Features',
    },
    {
      href: 'https://vuetifyjs.com/components/all',
      icon: 'mdi-widgets-outline',
      subtitle: 'Discover components in the API Explorer.',
      title: 'Components',
    },
    {
      href: 'https://discord.vuetifyjs.com',
      icon: 'mdi-account-group-outline',
      subtitle: 'Connect with Vuetify developers.',
      title: 'Community',
    },
  ]

  async function getData() {
    let data = await axios.get('https://google.com');
    console.log(data.data);
  }

  const form = reactive({
    email: '',
    password: ''
  })

  const loading = ref(false)

  // Form validation rules
  const emailRules = [
    (v: string) => !!v || 'Email is required',
    (v: string) => /.+@.+\..+/.test(v) || 'Email must be valid'
  ]

  const passwordRules = [
    (v: string) => !!v || 'Password is required',
    (v: string) => v.length >= 6 || 'Password must be at least 6 characters'
  ]

const handleLogin = async () => {
  if (form.email && form.password) {
    loading.value = true

    try {
      // Replace with your actual login API call
      const response = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      })

      if (response.ok) {
        const data = await response.json()
        // Handle successful login (store token, redirect, etc.)
        console.log('Login successful:', data)
        localStorage.setItem('token', data.token)
        // router.push('/dashboard')
      } else {
        throw new Error('Login failed')
      }
    } catch (error) {
      console.error('Login error:', error)
      // Show error message to user
      alert('Login failed. Please check your credentials.')
    } finally {
      loading.value = false
    }
  }
}
</script>

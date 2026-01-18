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
  const { meter } = useOTEL();
  const count = ref(0);
  const upDownCounter =   meter.getMeter('counter', '1.0.0').createUpDownCounter('test_up_down_counter', {
    description: 'Example of a UpDownCounter',
  });

  function add() {
    count.value += 1;
    upDownCounter.add(1);
  }

  function sub() {
    count.value -= 1;
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
</script>

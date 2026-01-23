// stores/user.js
import { defineStore } from 'pinia'

export type ProfileData = {
  name: string
  email: string
  loggedIn: boolean
}

export const useProfileData = defineStore('profile', {
  state: () => ({
    name: '',
    email: '',
    loggedIn: false,
  }),
  actions: {
    login (profileData: ProfileData) {
      this.name = profileData.name
      this.email = profileData.email
      this.loggedIn = true
    },
    logout () {
      this.name = ''
      this.email = ''
      this.loggedIn = false
    },
  },
})

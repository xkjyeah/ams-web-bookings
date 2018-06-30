<template>
  <div class="login">
    <div v-if="!user">
      <h3>Login with Google</h3>
      <p>(This is the easiest and fastest. We will only receive your email address.)</p>
      <v-btn @click="loginGoogle" color="primary">Login with Google</v-btn>
      <br/>
      <br/>
      <br/>
      <br/>

      <h3>Login with Email/Password</h3>
      <v-radio-group v-model="mode">
        <v-radio value="login" label="Log In" />
        <v-radio value="signup" label="Sign up" />
        <v-radio value="reset" label="Reset password" />
      </v-radio-group>
      <v-form>
        <v-text-field label="Email"
          v-model="email" placeholder="e.g. john@example.com" />
        <v-text-field label="Password" type="password" v-model="password" placeholder="*******"
          v-show="mode == 'login' || mode == 'signup'"/>
        <v-btn v-if="mode == 'login'" @click="loginPassword">Login</v-btn>
        <v-btn v-if="mode == 'signup'" @click="signupPassword">Sign up</v-btn>
        <v-btn v-if="mode == 'reset'" @click="resetPassword">Send password reset email</v-btn>
      </v-form>
    </div>
    <div v-else-if="user && !user.emailVerified">
      <p>Thank you for signing up!</p>
      <p>
        We have sent you a verification email. Please verify your account
        to proceed
      </p>
      <p>
        <v-btn @click="sendVerification">Re-send Verification Email</v-btn>
      </p>
    </div>
    <div v-else>
      You are already logged in
    </div>
  </div>
</template>
<style scoped lang="scss">
.login {
  max-width: 400px;
  margin: 0 auto;
}
</style>
<script>
import {mapState, mapActions} from 'vuex';
const {fbSignInGoogle, fbSignInPassword, fbSignUpPassword,
       fbResetPassword} = require('../firebase.js')

export default {
  data() {
    return {
      email: null, password: null,
      mode: 'login',
      postSignUp: false,
    };
  },
  watch: {
    /* Automatic redirect to make bookings page */
    'user.email': {
      immediate: true,
      handler (e) {
        if (e) {
          window.location.href = "#/"
        }
      }
    }
  },
  computed: {
    ...mapState(['user']),
  },
  methods: {
    ...mapActions(['flashError']),
    loginGoogle() {
      fbSignInGoogle()
      .catch((err) => this.flashError({
        ...err,
        type: 'error'
      }));
    },
    loginPassword() {
      fbSignInPassword(this.email, this.password)
      .catch((err) => this.flashError({
        ...err,
        type: 'error'
      }));
    },
    signupPassword() {
      fbSignUpPassword(this.email, this.password)
      .then((auth) => auth.user.sendEmailVerification())
      .then(() => this.flashError({
        message: 'Sign up successful!',
        type: 'success',
      }))
      .catch((err) => this.flashError({
        ...err,
        type: 'error'
      }));
    },
    resetPassword() {
      fbResetPassword(this.email, this.password)
      .then(() => this.flashError({
        message: 'Reset email sent!',
        type: 'success',
      }))
      .catch((err) => this.flashError({
        ...err,
        type: 'error'
      }));
    },
    sendVerification() {
      this.user.sendEmailVerification()
      .then(() => this.flashError({
        message: 'Verification email sent!',
        type: 'success',
      }))
      .catch((err) => this.flashError({
        ...err,
        type: 'error'
      }));
    }
  }
}
</script>

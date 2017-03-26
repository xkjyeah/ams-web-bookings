<template>
  <div class="login">
    <div v-if="!user">
      <h3>Login with Google</h3>
      <el-button @click="loginGoogle" type="primary">Login with Google</el-button>

      <h3>Login with Email/Password</h3>
      <el-radio-group v-model="mode">
        <el-radio-button label="login">Log In</el-radio-button>
        <el-radio-button label="signup">Sign up</el-radio-button>
        <el-radio-button label="reset">Reset password</el-radio-button>
      </el-radio-group>
      <el-form>
        <el-form-item label="Email">
          <el-input :disabled="mode == 'request'"
            v-model="email" placeholder="e.g. john@example.com" />
        </el-form-item>
        <el-form-item label="Password" v-show="mode == 'login' || mode == 'signup'">
          <el-input type="password" v-model="password" placeholder="*******" />
        </el-form-item>
        <el-button v-if="mode == 'login'" @click="loginPassword">Login</el-button>
        <el-button v-if="mode == 'signup'" @click="signupPassword">Sign up</el-button>
        <el-button v-if="mode == 'reset'" @click="resetPassword">Send password reset email</el-button>
      </el-form>
    </div>
    <div v-else-if="user && !user.emailVerified">
      <p>Thank you for signing up!</p>
      <p>
        We have sent you a verification email. Please verify your account
        to proceed
      </p>
      <p>
        <el-button @click="sendVerification">Re-send Verification Email</el-button>
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

<template>

  <nav class="navbar navbar-inverse navbar-fixed-top">
    <div class="container">
      <div class="navbar-header">
        <button type="button" class="navbar-toggle collapsed" data-toggle="collapse" data-target="#bs-nav-demo" aria-expanded="false">
          <span class="sr-only">Toggle navigation</span>
          <span class="icon-bar"></span>
          <span class="icon-bar"></span>
          <span class="icon-bar"></span>
        </button>
        <a class="navbar-brand" href="#"><i class="fa fa-plug" aria-hidden="true"></i> Electrify</a>
      </div>
      <div class="collapse navbar-collapse" id="bs-nav-demo">
        <ul class="nav navbar-nav">
          <li><router-link to="/"><i class="fa fa-home" aria-hidden="true"></i> Home</router-link></li>
          <li><router-link to="/plans-editor"><i class="fa fa-cog" aria-hidden="true"></i> Admin Panel</router-link></li>
        </ul>
        <ul class="nav navbar-nav navbar-right" v-if="user">
          <li><a><i class="fa fa-user-circle-o" aria-hidden="true"></i> {{ user.email }}</a></li>
          <li><a @click="signOut"><i class="fa fa-sign-out" aria-hidden="true"></i> Log Out</a></li>
        </ul>
        <ul class="nav navbar-nav navbar-right" v-else>
          <li><a @click="signIn"><i class="fa fa-user-plus" aria-hidden="true"></i> Sign In</a></li>
          <li><a href="#"><i class="fa fa-user-circle" aria-hidden="true"></i> Login</a></li>
        </ul>
      </div>
    </div>
  </nav>

</template>

<script>
import {mapActions, mapState} from 'vuex';

export default {
  methods: {
    ...mapActions(['signIn', 'signOut'])
  },
  computed: {
    ...mapState(['user'])
  }
}
</script>

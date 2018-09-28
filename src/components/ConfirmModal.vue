<template>
<v-dialog :value="modal" persistent max-width="290">
    <v-card v-if="modal">
    <v-card-title class="headline">{{modal.title}}</v-card-title>
    <v-card-text>{{modal.message}}</v-card-text>
    <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn flat @click.native="modal.resolve(false)">{{modal.negativeText}}</v-btn>
        <v-btn :color="modal.positiveColor" @click.native="modal.resolve(true)">{{modal.positiveText}}</v-btn>
    </v-card-actions>
    </v-card>
</v-dialog>
</template>

<script>
import {mapState} from 'vuex'

export default {
  computed: {
    ...mapState(['modal'])
  }
}
</script>


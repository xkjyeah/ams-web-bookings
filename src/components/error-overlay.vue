<template>
  <v-dialog :value="title" @input="$emit('cancel', $event)" max-width="400px">
    <v-card>
      <v-card-title>
        <v-alert :type="type" :value="true">{{title}}</v-alert>
      </v-card-title>
      <v-card-actions>
        <v-btn color="primary" @click.stop="$emit('cancel', false)">Close</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>
<script>
export default {
  props: ['title', 'type'],
  data() {
    return {
      email: null, password: null,
    };
  },
}
</script>

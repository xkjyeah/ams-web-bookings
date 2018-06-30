<template>
<div>
  <v-fade-transition>
    <v-layout row wrap>
      <v-flex sm8>
        <h4>Common destinations:</h4>
        <v-btn
          small
          style="text-transform: none"
          v-for="(prefilled, index) in prefilledAddresses" :key="index"
          :color="clicked === prefilled ? 'primary' : ''"
          @click="$emit('address-found', prefilled.full), clicked=prefilled, postcodeShown = false">
          {{prefilled.short}}
        </v-btn>

        <v-btn
          small
          style="text-transform: none"
          :color="postcodeShown ? 'primary' : ''"
          @click="showPostcode()">
          Other
        </v-btn>
        <v-fade-transition>
          <v-text-field v-if="postcodeShown" ref="postcode" v-model="postcode" :label="label"
            placeholder="(Optional)" />
        </v-fade-transition>
      </v-flex>
    </v-layout>
  </v-fade-transition>
  <!-- <v-fade-transition>
    <v-layout row wrap v-if="postcodeShown">
      <v-flex>
        <v-btn
          small
          style="text-transform: none"
          @click="postcodeShown = false"
          color="primary">
          Other
        </v-btn>
      </v-flex>
      <v-flex>
        <v-text-field ref="postcode" v-model="postcode" :label="label" />
      </v-flex>
    </v-layout>
  </v-fade-transition> -->
</div>
</template>

<script>
import axios from 'axios'
import querystring from 'querystring'

function prepareData(d) {
  return (
    // ((d.BUILDING === 'NIL') ? '\n' : `${d.BUILDING}\n`) +
    (d.ADDRESS)
  )
}

export default {
  props: {
    label: {},
    prefilledAddresses: {
      type: Array,
      default: () => [],
    }
  },
  data () {
    return {
      postcode: '',
      postcodeShown: false,
      clicked: null,
    }
  },
  watch: {
    postcode (postcode) {
      if (postcode.match(/^[0-9]{6}$/)) {
        const promise = this.$postcodePromise =
          axios.get('https://developers.onemap.sg/commonapi/search?' + querystring.stringify({
            searchVal: postcode,
            returnGeom: 'N',
            getAddrDetails: 'Y',
            pageNum: '1'
          }))
          .then((r) => {
            if (promise === this.$postcodePromise) {
              if (r.data.results && r.data.results.length > 0) {
                this.$emit('address-found', prepareData(r.data.results[0]))
              }
            }
          })
      }
    }
  },
  methods: {
    showPostcode () {
      this.postcodeShown = true
      this.clicked = false
      this.$nextTick(() => {
        this.$refs.postcode.$el.querySelector('input').focus()
      })
    }
  }
}
</script>


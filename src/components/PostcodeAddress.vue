<template>
  <v-layout row wrap>
    <v-flex sm4>
      <v-text-field v-model="postcode" :label="label" type="tel" />
    </v-flex>
    <v-flex sm8>
      <v-btn
        small
        style="text-transform: none"
        v-for="(prefilled, index) in prefilledAddresses" :key="index"
        @click="$emit('address-found', prefilled.full)">
        {{prefilled.short}}
      </v-btn>
    </v-flex>
  </v-layout>
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
  }
}
</script>


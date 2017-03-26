<template>
<table class="calendar" :class="{disabled: disabled}">
  <caption>
    <el-button @click="addMonth(-1)" class="btn btn-default">&lt;</el-button>
    {{dateformat(monthDate, 'mmmm')}}
    <el-button @click="addMonth(1)" class="btn btn-default">&gt;</el-button>
  </caption>
  <thead>
    <tr>
      <th v-for="t in 7">{{days[t - 1]}}</th>
    </tr>
  </thead>
  <tbody>
    <tr v-for="week in weeks">
      <td v-for="day in week.days"
          @click="dateClicked(day)"
          :class="{
            'is-primary': day.isPrimary,
            'is-today': day.isToday,
            'is-selected': day.isSelected
          }">
        <template v-if="day.number">
          {{day.number}}
        </template>
      </td>
    </tr>
  </tbody>
</table>
</template>
<style lang="scss">
.calendar {
  td, th {
    text-align: center;
  }
  caption {
    text-align: center;
  }

  &.disabled {
    opacity: 0.5;
  }
}
.calendar td {
  cursor: pointer;
  width: 2em;

  &:hover {
    background-color: #DDD;
  }

  &.is-primary {
    color: #000;
  }
  &:not(.is-primary) {
    color: #ccc;
  }
  &.is-today {
    border: solid 1px red;
  }
  &.is-selected {
    background-color: #CCC;
  }
}
</style>
<script>
const dateformat = require('../util/dateformat')
const _ = require('lodash');

export default {
  props: ['value', 'today', 'disabled'],
  data() {
    const today = new Date()
    today.setHours(0,0,0,0)

    return {
      monthDate: today,
      selectedDays: []
    }
  },
  watch: {
    value(v) {
      if (!v) {
        this.selectedDays = []
      } else if (v instanceof Array && v.length == 2) {
        this.selectedDays = _.clone(v);
      }
    },
    today(m) {
      if (m) {
        const theMonth = new Date(m.getTime())
        theMonth.setHours(0,0,0,0)
        theMonth.setDate(1)

        this.monthDate = theMonth
      }
    },
  },
  computed: {
    todayDate() {
      const today = new Date()
      today.setHours(0,0,0,0)

      return today;
    },
    days() {
      return 'M,T,W,T,F,S,S'.split(',')
    },
    startDay() {
      var m = new Date(this.monthDate.getTime())
      m.setDate(1)

      // sunday is always zero
      var day = (m.getDay() - 1 + 7) % 7
      m.setDate(m.getDate() - day)

      return m;
    },
    weeks() {
      return _.range(0,5).map(weeknum => ({
        days: _.range(0,7).map(day => {
          var m = new Date(this.startDay.getTime())
          m.setDate(m.getDate() + weeknum * 7 + day)

          return {
            number: m.getDate(),
            moment: m,
            isPrimary: m.getMonth() == this.monthDate.getMonth() &&
              m.getYear() == this.monthDate.getYear(),
            isToday: m.getTime() == this.todayDate.getTime(),
            isSelected: this.isSelected(m),
          }
        })
      }))
    }
  },
  methods: {
    dateformat,
    isSelected(day) {
      if (!this.selectedDays || !this.selectedDays.length) {
        return false;
      } else if (this.selectedDays.length == 1) {
        return this.selectedDays[0].getTime() == day.getTime();
      } else if (this.selectedDays.length == 2) {
        var min = _.minBy(this.selectedDays, x => x.valueOf())
        var max = _.maxBy(this.selectedDays, x => x.valueOf())

        return min.valueOf() <= day.valueOf() &&
          day.valueOf() <= max.valueOf()
      }
    },
    dateClicked(dt) {
      if (this.disabled) return;

      this.selectedDays.push(dt.moment);

      console.log(this.selectedDays)

      /* Handle the multiple date selection problem */
      if (this.selectedDays.length >= 3) {
        this.selectedDays = this.selectedDays.slice(2, this.selectedDays.length)
      }

      this.$emit('dateClicked', dt);
      this.$emit('input', this.selectedDays);
    },
    addMonth(n) {
      if (this.disabled) return;
      this.monthDate = new Date(this.monthDate.getTime())
      this.monthDate.setMonth(this.monthDate.getMonth() + n)
    }
  },
}
</script>

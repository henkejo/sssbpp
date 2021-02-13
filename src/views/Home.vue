<template>
  <div class="containers">
    <ul>
      <li class="slot" v-for="apt in apartments" :key="apt.id">
        <p>{{ apt.address }}</p>
      </li>
    </ul>
  </div>
</template>

<script>
import { db } from '../db'
let apartments = [];

export default {
  data: () => ({
    apartments,
  }),
  mounted() {
    this.loadApts();
  },
  methods: {
    loadApts() {
      db.collection('apts').get().then(querySnapshot => {
          querySnapshot.docs.map(doc => {
            let apt = doc.data();
            apt.id = doc.id;
            apartments.push(apt)
          });
      })
    }
  },
  beforeDestroy() {
    apartments = [];
  }
};

</script>

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
      this.axios.get("http://localhost:5000/apts").then((response) => {
        console.log(response.data)
      });
    }
  },
  beforeDestroy() {
    apartments = [];
  }
};

</script>

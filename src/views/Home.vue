<template>
  <div class="containers">
    <ul>
      <li class="slot" v-for="apt in this.apartments" :key="apt.id">
        <p>{{ apt.Address }}</p>
      </li>
    </ul>
  </div>
</template>

<script>
export default {
  data: () => ({
    apartments: [],
  }),
  mounted() {
    this.loadApts();
  },
  methods: {
    loadApts() {
      if (this.apartments.length === 0) {
        this.axios.get("http://localhost:5000/apts").then((response) => {
          this.apartments = response.data;
          console.log(this.apartments);
        }); 
      }
    }
  }
};

</script>

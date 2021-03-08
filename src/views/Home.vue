<template>
  <div class="container">
    <section class="section is-size-5 has-text-left" v-for="hood in this.apartments" :key="hood[0].Hood">
      <h1 class="title">{{ hood[0].Hood  }}</h1>
      <div class="columns is-multiline is-mobile">
        <div class="column is-half-mobile is-one-third-tablet is-one-third-desktop" v-for="apt in hood" v-bind:key="apt.ObjNr">
          <b-collapse aria-id="contentIdForA11y2" class="panel" animation="slide" :open="false">
            <template #trigger>
                <div class="panel-heading is-size-7 is-size-6-desktop" role="button" aria-controls="contentIdForA11y2">
                    <div class="columns is-mobile">
                      <div class="column has-text-left">
                        <strong>{{ apt.Address }}</strong><br>
                        <strong>{{ "lgh " + apt.AptNr }}</strong>
                      </div>
                      <div class="column has-text-right is-one-third is-size-8">
                        <strong>{{ apt.Rent + " kr"}}</strong><br>
                        <strong>{{ apt.Sqm + " kvm"}}</strong>
                      </div>
                    </div>
                </div>
            </template>
            <div class="panel-block">
                Lorem ipsum dolor sit amet, consectetur adipiscing elit. <br/>
                Nulla accumsan, metus ultrices eleifend gravida, nulla nunc varius lectus, nec rutrum justo nibh eu lectus. <br/>
                Ut vulputate semper dui. Fusce erat odio, sollicitudin vel erat vel, interdum mattis neque.
            </div>
          </b-collapse>
        </div>
      </div>
    </section>
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
          this.apartments = this._.groupBy(response.data, 'Hood');
          console.log(this.apartments);
        }); 
      }
    }
  }
};

</script>

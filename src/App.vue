<template>
  <div id="app" class="container is-max-desktop">
    <b-navbar :shadow="true" :spaced="true">
      <template #brand>
          <b-navbar-item tag="router-link" :to="{ path: '/' }">
              Lediga lägenheter
          </b-navbar-item>
          <b-navbar-item tag="router-link" :to="{ path: '/about' }">
              Statistik
          </b-navbar-item>
      </template>
      <template #end>
          <b-navbar-dropdown label="Info">
              <b-navbar-item href="#">
                  Om
              </b-navbar-item>
              <b-navbar-item href="#">
                  Rapportera en bugg
              </b-navbar-item>
          </b-navbar-dropdown>
      </template>
    </b-navbar>
    <router-view/>
  </div>
</template>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
}

#nav {
  padding: 30px;
}

#nav a {
  font-weight: bold;
  color: #2c3e50;
}

#nav a.router-link-exact-active {
  color: #42b983;
}
</style>

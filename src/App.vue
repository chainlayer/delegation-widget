<template>
  <div id="app" style="vertical-align:top">
    <h3>Validating Networks</h3>
    <CosmosLedger msg="Delegation"/>
    <TerraLedger msg="Delegation"/>
    <IrisLedger msg="Delegation"/>
  </div>
</template>

<script>
import IrisLedger from './components/IrisLedger.vue'
import CosmosLedger from './components/CosmosLedger.vue'
import TerraLedger from './components/TerraLedger.vue'
import Big from 'big.js';

export default {
  name: 'app',
  components: {
    IrisLedger,
    CosmosLedger,
    TerraLedger,
  },
  data: function() {
    return {
      cosmosStake: Big(0),
      terraStake: Big(0),
      irisStake: Big(0),
    };
  },
  methods: {
  }
}
</script>

<style>
#app {
  font-family: 'Avenir', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}
div.v--modal {
  padding: 5px;
  text-align: center;
}
</style>

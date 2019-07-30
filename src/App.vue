<template>
  <div id="app" style="vertical-align:top">
    <h3>ChainLayer Delegation Tool</h3>
    <hr>
    <div class="alert alert-warning" v-if="this.$browserDetect.meta.name!='Chrome'">Delegating with Ledger only supported on Chrome</div>
    <CosmosLedger msg="Delegation"/>
    <TerraLedger msg="Delegation"/>
    <IrisLedger msg="Delegation"/>
    <hr>
    <div class="alert alert-warning">Delegating on Windows 10 with a Ledger Nano S has had issues since the last Windows update. See <a href="https://www.ledger.com/your-ledger-device-and-the-upcoming-windows-10-update/" rel="nofollow noreferrer noopener">this Ledger post</a> for details</div>
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

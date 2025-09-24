<script lang="ts">
  import { Router, Route } from "svelte-routing";
  import Home from './routes/+page.svelte';
  import AddLead from './routes/add-lead/+page.svelte';
  import ListLead from './routes/list-lead/+page.svelte';

  export let url = "";
</script>

<Router {url}>
  <main>
    <Route path="/" component={Home} />
    <Route path="/add-lead" component={AddLead} />
    <Route path="/list-lead" component={ListLead} />
  </main>
</Router>

<style>
  main {
    padding: 10px;
    max-width: 1200px;
    margin: 0 auto;
  }
</style>
<script>
  import { onMount } from 'svelte';
  import { Router, Route, Link } from "svelte-routing";
  import Form from './components/Form.svelte';
  import DebugPanel from './components/DebugPanel.svelte';
  
  // Dynamically import routes
  import Home from './routes/+page.svelte';
  import ListLead from './routes/list-lead/+page.svelte';
  
  // Get the base URL for the router
  export let url = "";
  let customerData = null;
  
  onMount(() => {
    // Listen for SmaxAI messages
    window.addEventListener('message', handleSmaxMessage);
    
    return () => {
      window.removeEventListener('message', handleSmaxMessage);
    };
  });
  
  function handleSmaxMessage(event) {
    if (typeof event.data === 'object' && event.data.name === '__SM_FORM_CUSTOMER') {
      customerData = event.data?.data?.customer;
    }
  }
</script>

<Router {url}>
  <main>
    <Route path="/" component={Home} />
    <Route path="/add-lead" let:params>
      <Form {customerData} />
      <DebugPanel {customerData} />
    </Route>
    <Route path="/list-lead" component={ListLead} />
  </main>
</Router>

<style>
  main {
    padding: 10px;
    max-width: 1200px; /* Increased for list-lead view */
    margin: 0 auto;
  }
</style> 
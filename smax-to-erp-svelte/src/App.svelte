<script>
  import { onMount } from 'svelte';
  import Form from './components/Form.svelte';
  import DebugPanel from './components/DebugPanel.svelte';
  
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

<main>
  <Form {customerData} />
  <DebugPanel {customerData} />
</main>

<style>
  main {
    padding: 10px;
    max-width: 400px;
    margin: 0 auto;
  }
</style> 
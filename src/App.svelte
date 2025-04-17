<script lang="ts">
  import { onMount } from 'svelte';
  import Form from './components/Form.svelte';
  import DebugPanel from './components/DebugPanel.svelte';
  import { customerData } from './stores/customerStore';
  import { initializeFormComponents } from './utils/formUtils';

  onMount(() => {
    // Initialize form components when the app mounts
    initializeFormComponents();
  });
</script>

<div class="form-container">
  <Form />
  <DebugPanel />
</div>

<style>
  .form-container {
    width: 100%;
    max-width: 400px;
    margin: 0 auto;
    background-color: #fff;
    padding: 15px;
    border-radius: 8px;
    box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
  }
</style> 
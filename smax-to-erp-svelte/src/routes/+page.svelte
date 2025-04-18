<script>
  import { onMount } from 'svelte';
  import { navigate } from 'svelte-routing';

  let showRoutes = true;

  function navigateTo(path) {
    navigate(path);
  }

  onMount(() => {
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.has('integration_id')) {
      // If integration_id is present, we're in SMAX iframe mode
      // Auto-redirect to add-lead by default
      navigate('/add-lead' + window.location.search);
    }
  });
</script>

<div class="container py-5">
  <h1 class="mb-4 text-center">SMAX to ERP</h1>
  
  <div class="d-grid gap-3 col-md-6 mx-auto">
    <button class="btn btn-primary btn-lg" on:click={() => navigateTo('/add-lead')}>
      <i class="bi bi-plus-circle me-2"></i> Tạo Lead mới
    </button>
    
    <button class="btn btn-secondary btn-lg" on:click={() => navigateTo('/list-lead')}>
      <i class="bi bi-list-ul me-2"></i> Xem danh sách Lead
    </button>
  </div>
</div>

<style>
  .container {
    height: 100vh;
    display: flex;
    flex-direction: column;
    justify-content: center;
  }
</style> 
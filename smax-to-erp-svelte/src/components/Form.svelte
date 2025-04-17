<script>
  import { onMount, onDestroy } from 'svelte';
  import { createLead } from '../lib/api';
  import { loadExternalLibraries } from '../lib/external-libs';
  
  export let customerData;
  
  const STORAGE_PREFIX = 'smax_erp_form_';
  let formStorageKey = '';
  
  let formData = {
    id: '',
    pid: '',
    platform: '',
    gid: '',
    page_pid: '',
    picture: '',
    name: '',
    birthdate: '',
    gender: '',
    phone: '',
    email: '',
    address: '',
    departure_date: formatDate(new Date()),
    return_date: formatDate(addDays(new Date(), 3)),
    adult: '1',
    children: '0',
    erp_id: '',
    erp_unique_id: '',
    type: '',
    ticket_priority: 'normal',
    ticket_name: '',
    ticket_description: '',
    pic: ''
  };
  
  let errors = {};
  let isLoading = false;
  let editor;

  // Watch for changes in formData and save to localStorage
  $: if (formStorageKey && formData) {
    saveFormToStorage();
  }

  // Watch for customerData changes
  $: if (customerData) {
    // Set storage key based on page_pid
    if (customerData.page_pid) {
      formStorageKey = STORAGE_PREFIX + customerData.page_pid;
      // Try to restore data from storage first
      const storedData = loadFormFromStorage();
      if (storedData) {
        formData = { ...formData, ...storedData };
      } else {
        // If no stored data, use customerData
        formData = {
          ...formData,
          id: customerData.id || '',
          pid: customerData.pid || '',
          platform: customerData.platform || '',
          gid: customerData.gid || '',
          page_pid: customerData.page_pid || '',
          picture: customerData.picture || '',
          name: customerData.name || '',
          phone: customerData.phone || '',
          email: customerData.email || '',
          address: customerData.address || ''
        };
      }
    }
  }
  
  onMount(async () => {
    // Load external libraries first
    const loaded = await loadExternalLibraries();
    if (!loaded) {
      console.error('Failed to load external libraries');
      return;
    }

    // Initialize components after libraries are loaded
    initializeDatepickers();
    initializeTinyMCE();

    return () => {
      if (window.tinymce && tinymce.get('ticket_description')) {
        tinymce.get('ticket_description').remove();
      }
    };
  });
  
  function initializeDatepickers() {
    try {
      const datepickerInputs = document.querySelectorAll('.datepicker');
      datepickerInputs.forEach(input => {
        window.$(input).datepicker({
          format: 'dd/mm/yyyy',
          autoclose: true,
          todayHighlight: true,
          language: 'vi',
          orientation: 'bottom auto'
        }).on('changeDate', (e) => {
          const fieldName = input.getAttribute('name');
          if (fieldName) {
            const date = window.$(input).datepicker('getFormattedDate');
            formData[fieldName] = date;
            saveFormToStorage(); // Save when date changes
          }
        });

        // Set initial values if they exist
        if (formData[input.getAttribute('name')]) {
          window.$(input).datepicker('update', formData[input.getAttribute('name')]);
        }
      });
    } catch (error) {
      console.error('Error initializing datepickers:', error);
    }
  }
  
  function initializeTinyMCE() {
    try {
      if (!window.tinymce) {
        console.error('TinyMCE not loaded');
        return;
      }

      window.tinymce.init({
        selector: '#ticket_description',
        height: 150,
        menubar: false,
        plugins: 'link lists table',
        toolbar: 'undo redo | bold italic | alignleft aligncenter | bullist numlist | link',
        content_style: 'body { font-family: "Roboto", sans-serif; font-size: 13px; }',
        branding: false,
        promotion: false,
        statusbar: false,
        resize: false,
        toolbar_location: 'top',
        forced_root_block: 'p',
        toolbar_mode: 'wrap',
        toolbar_sticky: false,
        icons: 'small',
        setup: function(editor) {
          editor.on('change', function() {
            formData.ticket_description = editor.getContent();
            saveFormToStorage(); // Save when editor content changes
          });
          
          editor.on('init', function() {
            // Set initial content if exists
            if (formData.ticket_description) {
              editor.setContent(formData.ticket_description);
            }
            
            // Add custom styling
            const style = document.createElement('style');
            style.innerHTML = `
              .tox .tox-toolbar__group { padding: 0 !important; margin: 0 !important; }
              .tox .tox-tbtn { height: 20px !important; width: 20px !important; margin: 0 !important; padding: 0 !important; }
              .tox .tox-tbtn svg { transform: scale(0.5) !important; width: 16px !important; height: 16px !important; }
              .tox .tox-toolbar { padding: 0 !important; }
              .tox .tox-edit-area { padding: 0 !important; }
              .tox .tox-tbtn--enabled, .tox .tox-tbtn:hover { background: #e3e3e3 !important; }
              .tox-icon svg, .tox-collection__item-icon svg { width: 14px !important; height: 14px !important; transform: scale(0.7) !important; }
            `;
            document.head.appendChild(style);
          });
        }
      });
    } catch (error) {
      console.error('Error initializing TinyMCE:', error);
    }
  }
  
  async function handleSubmit() {
    if (!validateForm()) return;
    
    isLoading = true;
    try {
      const response = await createLead(formData);
      handleResponse(response);
      // Clear storage after successful submission
      if (formStorageKey) {
        localStorage.removeItem(formStorageKey);
      }
    } catch (error) {
      handleError(error);
    } finally {
      isLoading = false;
    }
  }
  
  function validateForm() {
    errors = {};
    let isValid = true;
    
    if (!formData.name) {
      errors.name = 'Vui lòng nhập họ tên';
      isValid = false;
    }
    
    if (formData.phone && !validatePhone(formData.phone)) {
      errors.phone = 'Vui lòng nhập số điện thoại hợp lệ';
      isValid = false;
    }
    
    if (formData.email && !validateEmail(formData.email)) {
      errors.email = 'Vui lòng nhập email hợp lệ';
      isValid = false;
    }
    
    if (!formData.ticket_name) {
      errors.ticket_name = 'Vui lòng nhập tên yêu cầu';
      isValid = false;
    }
    
    if (!formData.pic) {
      errors.pic = 'Vui lòng chọn người phụ trách';
      isValid = false;
    }
    
    return isValid;
  }
  
  function validatePhone(phone) {
    return /^[+]?[(]?[0-9]{3}[)]?[-\s.]?[0-9]{3}[-\s.]?[0-9]{4,6}$/.test(phone);
  }
  
  function validateEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }
  
  function formatDate(date) {
    return date.getDate().toString().padStart(2, '0') + '/' + 
           (date.getMonth() + 1).toString().padStart(2, '0') + '/' + 
           date.getFullYear();
  }
  
  function addDays(date, days) {
    const result = new Date(date);
    result.setDate(result.getDate() + days);
    return result;
  }
  
  function handleResponse(response) {
    if (response?.[0]?.success === true && response[0].data?.code) {
      const codeMatch = response[0].data.code.match(/\D*(\d+)/);
      const leadId = codeMatch?.[1];
      
      if (leadId) {
        showSuccess(`Đã thêm lead <a href="https://erp.nucuoimekong.vn/admin/lead/${leadId}/show" target="_blank">#${leadId}</a>`);
      } else {
        showSuccess(`Đã thêm lead thành công: ${response[0].data.code}`);
      }
    } else {
      showSuccess('Yêu cầu đã được gửi thành công. Vui lòng kiểm tra trong hệ thống ERP.');
    }
  }
  
  function handleError(error) {
    console.error('Error:', error);
    if (error.name === 'AbortError') {
      showError('Máy chủ ERP đang xử lý quá lâu. Vui lòng kiểm tra sau vài phút.');
    } else {
      showError('Không thể kết nối đến máy chủ ERP. Vui lòng thử lại.');
    }
  }
  
  function showSuccess(message) {
    const successContainer = document.getElementById('success-container');
    const successMessage = document.getElementById('success-message');
    if (successContainer && successMessage) {
      successContainer.style.display = 'block';
      successMessage.innerHTML = message;
    }
  }
  
  function showError(message) {
    const errorContainer = document.getElementById('error-container');
    const errorMessage = document.getElementById('error-message');
    if (errorContainer && errorMessage) {
      errorContainer.style.display = 'block';
      errorMessage.textContent = message;
    }
  }

  // Save form data to localStorage
  function saveFormToStorage() {
    try {
      const dataToSave = { ...formData };
      localStorage.setItem(formStorageKey, JSON.stringify(dataToSave));
    } catch (error) {
      console.error('Error saving form data to localStorage:', error);
    }
  }

  // Load form data from localStorage
  function loadFormFromStorage() {
    try {
      const storedData = localStorage.getItem(formStorageKey);
      return storedData ? JSON.parse(storedData) : null;
    } catch (error) {
      console.error('Error loading form data from localStorage:', error);
      return null;
    }
  }

  // Update form fields to use bind:value with auto-save
  function handleInput(field, value) {
    formData[field] = value;
    saveFormToStorage();
  }
</script>

<div class="form-container">
  <form id="userForm">
    <!-- Hidden fields -->
    <input type="hidden" bind:value={formData.id}>
    <input type="hidden" bind:value={formData.pid}>
    <input type="hidden" bind:value={formData.platform}>
    <input type="hidden" bind:value={formData.gid}>
    <input type="hidden" bind:value={formData.page_pid}>
    <input type="hidden" bind:value={formData.picture}>
    
    <!-- Customer Information Section -->
    <div class="form-section-title">Thông tin khách hàng</div>
    
    <div class="mb-2">
      <div class="input-group">
        <span class="input-group-text">
          <div class="avatar-circle">
            {#if formData.picture}
              <img src={formData.picture} alt="Avatar">
            {:else}
              <span class="avatar-placeholder"><i class="bi bi-person"></i></span>
            {/if}
          </div>
        </span>
        <input 
          type="text" 
          class="form-control" 
          placeholder="Họ tên"
          bind:value={formData.name}
          on:input={() => handleInput('name', formData.name)}
          class:error={errors.name}
        >
      </div>
      {#if errors.name}
        <div class="error-message">{errors.name}</div>
      {/if}
    </div>
    
    <div class="row mb-2">
      <div class="col-6 col-small-12 mb-2">
        <div class="input-group">
          <span class="input-group-text"><i class="bi bi-calendar"></i></span>
          <input 
            type="text" 
            class="form-control datepicker" 
            placeholder="Ngày sinh"
            name="birthdate"
            bind:value={formData.birthdate}
          >
        </div>
      </div>
      <div class="col-6 col-small-12 mb-2">
        <div class="input-group">
          <span class="input-group-text"><i class="bi bi-gender-ambiguous"></i></span>
          <select class="form-control" bind:value={formData.gender}>
            <option value="">Giới tính</option>
            <option value="male">Nam</option>
            <option value="female">Nữ</option>
          </select>
        </div>
      </div>
    </div>
    
    <div class="row mb-2">
      <div class="col-6 col-small-12 mb-2">
        <div class="input-group">
          <span class="input-group-text"><i class="bi bi-phone"></i></span>
          <input 
            type="tel" 
            class="form-control" 
            placeholder="Số điện thoại"
            bind:value={formData.phone}
            on:input={() => handleInput('phone', formData.phone)}
            class:error={errors.phone}
          >
        </div>
        {#if errors.phone}
          <div class="error-message">{errors.phone}</div>
        {/if}
      </div>
      <div class="col-6 col-small-12 mb-2">
        <div class="input-group">
          <span class="input-group-text"><i class="bi bi-envelope"></i></span>
          <input 
            type="email" 
            class="form-control" 
            placeholder="Email"
            bind:value={formData.email}
            on:input={() => handleInput('email', formData.email)}
            class:error={errors.email}
          >
        </div>
        {#if errors.email}
          <div class="error-message">{errors.email}</div>
        {/if}
      </div>
    </div>
    
    <div class="mb-2">
      <div class="input-group">
        <span class="input-group-text"><i class="bi bi-geo-alt"></i></span>
        <input 
          type="text" 
          class="form-control" 
          placeholder="Địa chỉ"
          bind:value={formData.address}
        >
      </div>
    </div>
    
    <!-- ERP Information Section -->
    <div class="form-section">
      <div class="form-section-title">Thông tin ERP</div>
      
      <div class="row mb-2">
        <div class="col-6 col-small-12 mb-2">
          <div class="input-group">
            <span class="input-group-text"><i class="bi bi-calendar-check"></i></span>
            <input 
              type="text" 
              class="form-control datepicker" 
              placeholder="Ngày đi"
              name="departure_date"
              bind:value={formData.departure_date}
            >
          </div>
        </div>
        <div class="col-6 col-small-12 mb-2">
          <div class="input-group">
            <span class="input-group-text"><i class="bi bi-calendar-x"></i></span>
            <input 
              type="text" 
              class="form-control datepicker" 
              placeholder="Ngày về"
              name="return_date"
              bind:value={formData.return_date}
            >
          </div>
        </div>
      </div>
      
      <div class="row mb-2">
        <div class="col-6 col-small-12 mb-2">
          <div class="input-group">
            <span class="input-group-text"><i class="bi bi-people"></i></span>
            <input 
              type="number" 
              class="form-control" 
              placeholder="Người lớn"
              bind:value={formData.adult}
              min="1"
            >
          </div>
        </div>
        <div class="col-6 col-small-12 mb-2">
          <div class="input-group">
            <span class="input-group-text"><i class="bi bi-person-hearts"></i></span>
            <input 
              type="number" 
              class="form-control" 
              placeholder="Trẻ em"
              bind:value={formData.children}
              min="0"
            >
          </div>
        </div>
      </div>
      
      <div class="row mb-2">
        <div class="col-6 col-small-12 mb-2">
          <div class="input-group">
            <span class="input-group-text"><i class="bi bi-hash"></i></span>
            <input 
              type="text" 
              class="form-control" 
              placeholder="ID ERP"
              bind:value={formData.erp_id}
            >
          </div>
        </div>
        <div class="col-6 col-small-12 mb-2">
          <div class="input-group">
            <span class="input-group-text"><i class="bi bi-fingerprint"></i></span>
            <input 
              type="text" 
              class="form-control" 
              placeholder="Unique ID"
              bind:value={formData.erp_unique_id}
            >
          </div>
        </div>
      </div>
      
      <div class="row mb-2">
        <div class="col-6 col-small-12 mb-2">
          <div class="input-group">
            <span class="input-group-text"><i class="bi bi-layers"></i></span>
            <select class="form-control" bind:value={formData.type}>
              <option value="">Loại lead</option>
              <option value="1">Lead ghép</option>
              <option value="2">Lead đoàn</option>
            </select>
          </div>
        </div>
        <div class="col-6 col-small-12 mb-2">
          <div class="input-group">
            <span class="input-group-text"><i class="bi bi-flag"></i></span>
            <select class="form-control" bind:value={formData.ticket_priority}>
              <option value="normal">Bình thường</option>
              <option value="urgent">Khẩn cấp</option>
            </select>
          </div>
        </div>
      </div>
      
      <div class="mb-2">
        <div class="input-group">
          <span class="input-group-text"><i class="bi bi-ticket"></i></span>
          <input 
            type="text" 
            class="form-control" 
            placeholder="Tên yêu cầu"
            bind:value={formData.ticket_name}
            on:input={() => handleInput('ticket_name', formData.ticket_name)}
            class:error={errors.ticket_name}
          >
        </div>
        {#if errors.ticket_name}
          <div class="error-message">{errors.ticket_name}</div>
        {/if}
      </div>
      
      <div class="mb-3">
        <label class="form-label">
          <i class="bi bi-card-text me-2"></i>Mô tả yêu cầu
        </label>
        <textarea 
          id="ticket_description"
          bind:value={formData.ticket_description}
        ></textarea>
      </div>
      
      <div class="mb-2">
        <div class="input-group">
          <span class="input-group-text"><i class="bi bi-person-check"></i></span>
          <select 
            class="form-control" 
            bind:value={formData.pic}
            on:change={(e) => handleInput('pic', e.target.value)}
            class:error={errors.pic}
          >
            <option value="">Chọn người phụ trách</option>
            <option value="dinh.cao@nucuoimekong.vn">dinh.cao@nucuoimekong.vn</option>
            <option value="dinh.dao@nucuoimekong.vn">dinh.dao@nucuoimekong.vn</option>
            <option value="hieu.huynh@nucuoimekong.vn">hieu.huynh@nucuoimekong.vn</option>
            <option value="huu.huynh@nucuoimekong.vn">huu.huynh@nucuoimekong.vn</option>
            <option value="jimmy@mekongsmiletour.com">jimmy@mekongsmiletour.com</option>
            <option value="kim.vo@nucuoimekong.vn">kim.vo@nucuoimekong.vn</option>
            <option value="nhi.truong@nucuoimekong.vn">nhi.truong@nucuoimekong.vn</option>
            <option value="ngan.nguyen@nucuoimekong.vn">ngan.nguyen@nucuoimekong.vn</option>
            <option value="tien.truong@nucuoimekong.vn">tien.truong@nucuoimekong.vn</option>
            <option value="vy.ho@nucuoimekong.vn">vy.ho@nucuoimekong.vn</option>
          </select>
        </div>
        {#if errors.pic}
          <div class="error-message">{errors.pic}</div>
        {/if}
      </div>
    </div>
    
    <div class="d-grid gap-2 mt-3">
      <button 
        type="button" 
        class="btn-success" 
        on:click={handleSubmit} 
        disabled={isLoading}
      >
        {#if isLoading}
          <span class="loading"></span> Đang xử lý...
        {:else}
          Tạo Lead ERP
        {/if}
      </button>
    </div>
  </form>
  
  <div id="success-container" class="alert alert-success mt-3" style="display: none;">
    <p id="success-message" class="mb-0"></p>
  </div>
  
  <div id="error-container" class="alert alert-danger mt-3" style="display: none;">
    <p id="error-message" class="mb-0"></p>
  </div>
</div>

<style>
  .form-container {
    width: 100%;
    max-width: 400px;
    margin: 0 auto;
    background-color: white;
    padding: 15px;
    border-radius: 8px;
    box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
  }
  
  .row {
    display: flex;
    flex-wrap: wrap;
    margin: 0 -5px;
  }
  
  .col-6 {
    flex: 0 0 50%;
    max-width: 50%;
    padding: 0 5px;
  }
  
  :global(.alert) {
    padding: 12px;
    border-radius: 4px;
    margin-top: 12px;
  }
  
  :global(.alert-success) {
    background-color: #d4edda;
    border-color: #c3e6cb;
    color: #155724;
  }
  
  :global(.alert-danger) {
    background-color: #f8d7da;
    border-color: #f5c6cb;
    color: #721c24;
  }
  
  :global(.me-2) {
    margin-right: 8px;
  }
  
  :global(.form-label) {
    display: block;
    margin-bottom: 8px;
    color: var(--text-color);
  }
</style> 
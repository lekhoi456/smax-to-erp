<script>
  import { onMount, onDestroy } from 'svelte';
  import { createLead } from '../lib/api';
  import { loadExternalLibraries } from '../lib/external-libs';
  
  export let customerData;
  
  const STORAGE_PREFIX = 'smax_erp_form_';
  const STORAGE_EXPIRY_DAYS = 7;
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
    departure_date: formatDate(addDays(new Date(), 1)),
    return_date: formatDate(addDays(new Date(), 2)),
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
  let editorContent;

  async function initializeDatepickers() {
    try {
      // Wait for jQuery to be available
      if (!window.$) {
        console.error('jQuery is not loaded');
        return;
      }

      const $ = window.$;
      const datepickerInputs = document.querySelectorAll('.datepicker');
      
      datepickerInputs.forEach(input => {
        try {
          $(input).datepicker({
            format: 'dd/mm/yyyy',
            autoclose: true,
            todayHighlight: true,
            language: 'vi',
            orientation: 'bottom auto',
            container: input.parentElement // Add this to ensure proper positioning
          }).on('changeDate', (e) => {
            const fieldName = input.getAttribute('name');
            if (fieldName) {
              const date = $(input).datepicker('getFormattedDate');
              formData[fieldName] = date;
              saveFormToStorage();
            }
          });

          // Set initial values if they exist
          if (formData[input.getAttribute('name')]) {
            $(input).datepicker('update', formData[input.getAttribute('name')]);
          }
        } catch (err) {
          console.error('Error initializing individual datepicker:', err);
        }
      });
    } catch (error) {
      console.error('Error in initializeDatepickers:', error);
    }
  }

  // Clean up expired localStorage items
  function cleanupStorage() {
    try {
      const now = new Date().getTime();
      
      // Get all keys from localStorage that start with our prefix
      Object.keys(localStorage).forEach(key => {
        if (key.startsWith(STORAGE_PREFIX)) {
          try {
            const item = localStorage.getItem(key);
            if (!item) return;
            
            const data = JSON.parse(item);
            
            // Check if item has timestamp and is expired
            if (data._timestamp && (now - data._timestamp) > (STORAGE_EXPIRY_DAYS * 24 * 60 * 60 * 1000)) {
              localStorage.removeItem(key);
            }
          } catch (e) {
            // If item is invalid, remove it
            localStorage.removeItem(key);
          }
        }
      });
    } catch (error) {
      console.error('Error cleaning up storage:', error);
    }
  }

  onMount(async () => {
    // Clean up expired items when component mounts
    cleanupStorage();
    
    // Listen for SMAX messages
    window.addEventListener('message', handleSmaxMessage);
    
    // Request data from SMAX immediately
    requestSmaxData();

    // Load external libraries first
    const loaded = await loadExternalLibraries();
    if (!loaded) {
      console.error('Failed to load external libraries');
      return;
    }

    // Small delay to ensure libraries are ready
    await new Promise(resolve => setTimeout(resolve, 100));
    
    // Initialize components after libraries are loaded
    initializeDatepickers();
    initializeEditor();

    return () => {
      window.removeEventListener('message', handleSmaxMessage);
      // Cleanup datepickers
      const $ = window.$;
      if ($) {
        $('.datepicker').datepicker('destroy');
      }
    };
  });

  function requestSmaxData() {
    try {
      const integrationId = window.location.href.split('=')[1];
      window.parent.postMessage({
        name: '__SM_FORM_CUSTOMER',
        data: {
          integration_id: integrationId,
        }
      }, '*');
      console.log('Requested data from SMAX with integration_id:', integrationId);
    } catch (error) {
      console.error('Error requesting data from SMAX:', error);
    }
  }

  function handleSmaxMessage(event) {
    try {
      // Log incoming message for debugging

      if (typeof event.data === 'object' && event.data.name === '__SM_FORM_CUSTOMER') {
        if (event.data?.data?.customer) {
          const customer = event.data.data.customer;
          // Set storage key based on customer id
          if (customer.id) {
            formStorageKey = STORAGE_PREFIX + customer.id;
            handleCustomerDataChange(customer);
          }
        }
      }
    } catch (error) {
      console.error('Error handling SMAX message:', error);
    }
  }

  function handleCustomerDataChange(newCustomerData) {
    
    // Validate required fields
    if (!newCustomerData.id) {
      console.warn('Missing id in customer data');
      return;
    }

    // First, try to load data from localStorage
    const storedData = loadFormFromStorage();

    // Start with default form data
    let mergedData = { ...formData };

    // If we have stored data, use it as base
    if (storedData) {
      mergedData = { ...mergedData, ...storedData };
    }

    // Then, only override non-empty fields from SMAX
    const smaxData = {
      id: newCustomerData.id || mergedData.id,
      pid: newCustomerData.pid || mergedData.pid,
      platform: newCustomerData.platform || mergedData.platform,
      gid: newCustomerData.gid || mergedData.gid,
      page_pid: newCustomerData.page_pid || mergedData.page_pid,
      picture: newCustomerData.picture || mergedData.picture,
      name: newCustomerData.name || mergedData.name,
      phone: newCustomerData.phone || mergedData.phone,
      email: newCustomerData.email || mergedData.email,
      address: newCustomerData.address || mergedData.address
    };

    // Apply SMAX data
    formData = {
      ...mergedData,
      ...smaxData
    };

    // If this is completely new data (no stored data), set default dates
    if (!storedData) {
      formData.departure_date = formatDate(addDays(new Date(), 1));
      formData.return_date = formatDate(addDays(new Date(), 2));
    }

    
    // Save the merged data to storage
    saveFormToStorage();
  }

  // Save form data to localStorage with timestamp
  function saveFormToStorage() {
    if (!formStorageKey) return;
    
    try {
      const dataToSave = {
        ...formData,
        _timestamp: new Date().getTime()
      };
      localStorage.setItem(formStorageKey, JSON.stringify(dataToSave));
    } catch (error) {
      console.error('Error saving form data to localStorage:', error);
    }
  }

  // Load form data from localStorage and check expiry
  function loadFormFromStorage() {
    if (!formStorageKey) return null;
    
    try {
      const storedData = localStorage.getItem(formStorageKey);
      if (!storedData) return null;
      
      const parsedData = JSON.parse(storedData);
      
      // Check if data is expired
      const now = new Date().getTime();
      if (parsedData._timestamp && (now - parsedData._timestamp) > (STORAGE_EXPIRY_DAYS * 24 * 60 * 60 * 1000)) {
        localStorage.removeItem(formStorageKey);
        return null;
      }
      
      // Remove timestamp before returning
      const { _timestamp, ...dataWithoutTimestamp } = parsedData;
      return dataWithoutTimestamp;
      
    } catch (error) {
      console.error('Error loading form data from localStorage:', error);
      return null;
    }
  }

  // Watch for changes in formData and save to localStorage
  $: if (formStorageKey && formData) {
    saveFormToStorage();
  }

  function initializeEditor() {
    const editor = document.getElementById('ticket_description');
    const toolbar = document.getElementById('editor-toolbar');

    if (!editor || !toolbar) return;

    // Set initial content if exists
    if (formData.ticket_description) {
      editor.innerHTML = formData.ticket_description;
    }

    // Update formData when content changes
    editor.addEventListener('input', () => {
      formData.ticket_description = editor.innerHTML;
    });

    // Handle toolbar button clicks
    toolbar.addEventListener('click', (e) => {
      const button = e.target.closest('.editor-btn');
      if (!button) return;

      const command = button.dataset.command;
      
      switch (command) {
        case 'bold':
        case 'italic':
        case 'underline':
          document.execCommand(command, false);
          break;
        case 'ul':
          document.execCommand('insertUnorderedList', false);
          break;
        case 'ol':
          document.execCommand('insertOrderedList', false);
          break;
        case 'link':
          const url = prompt('Enter URL:');
          if (url) {
            document.execCommand('createLink', false, url);
          }
          break;
      }

      // Update active state
      if (['bold', 'italic', 'underline'].includes(command)) {
        button.classList.toggle('active', document.queryCommandState(command));
      }

      editor.focus();
    });

    // Update button states on selection change
    editor.addEventListener('keyup', updateToolbarState);
    editor.addEventListener('mouseup', updateToolbarState);
    editor.addEventListener('selectionchange', updateToolbarState);
  }
  
  function updateToolbarState() {
    const toolbar = document.getElementById('editor-toolbar');
    if (!toolbar) return;

    ['bold', 'italic', 'underline'].forEach(command => {
      const button = toolbar.querySelector(`[data-command="${command}"]`);
      if (button) {
        button.classList.toggle('active', document.queryCommandState(command));
      }
    });
  }
  
  async function handleSubmit() {
    if (!validateForm()) return;
    
    isLoading = true;

    try {
      // Set a timeout of 30 seconds
      const timeoutDuration = 30000;
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Request timed out')), timeoutDuration);
      });

      // Create lead with timeout
      const response = await Promise.race([
        createLead(formData),
        timeoutPromise
      ]);

      if (!response) {
        throw new Error('No response received');
      }

      // Check if response is wrapped in an array
      const responseData = Array.isArray(response) ? response[0] : response;

      if (responseData.success === true && responseData.data && responseData.data.code) {
        const codeMatch = responseData.data.code.match(/LU(\d+)/);
        
        if (codeMatch && codeMatch[1]) {
          const leadId = codeMatch[1];
          showSuccess(`Đã thêm lead <a href="https://erp.nucuoimekong.vn/admin/lead/${leadId}/show" target="_blank">#${leadId}</a>`);
          
          // Clear form storage after successful submission
          if (formStorageKey) {
            localStorage.removeItem(formStorageKey);
          }
          
          // Reset form data to defaults
          formData = {
            ...formData,
            ticket_name: '',
            ticket_description: '',
            ticket_priority: 'normal',
            departure_date: formatDate(addDays(new Date(), 1)),
            return_date: formatDate(addDays(new Date(), 2)),
            adult: '1',
            children: '0'
          };
        } else {
          showSuccess(`Đã thêm lead thành công: ${responseData.data.code}`);
        }
      } else if (responseData.message) {
        showSuccess(responseData.message);
      } else {
        showSuccess('Yêu cầu đã được gửi thành công. Vui lòng kiểm tra trong hệ thống ERP.');
      }

    } catch (error) {
      console.error('Error in handleSubmit:', error);
      if (error.name === 'AbortError' || error.message === 'Request timed out') {
        showError('Máy chủ ERP đang xử lý quá lâu. Vui lòng kiểm tra sau vài phút.');
      } else {
        showError('Không thể kết nối đến máy chủ ERP. Vui lòng thử lại.');
      }
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
      
      // Hide error after 5 seconds
      setTimeout(() => {
        errorContainer.style.display = 'none';
      }, 5000);
    }
  }

  // Update form fields to use bind:value with auto-save
  function handleInput(field, value) {
    formData[field] = value;
    saveFormToStorage();
  }

  function execCommand(command) {
    document.execCommand(command, false, null);
  }

  function handleEditorCommand(event) {
    const button = event.target.closest('.editor-btn');
    if (!button) return;

    const command = button.dataset.command;
    
    if (command === 'createLink') {
      const url = prompt('Enter the URL:');
      if (url) {
        document.execCommand('createLink', false, url);
      }
    } else {
      execCommand(command);
    }
    
    // Update formData
    formData.ticket_description = editorContent.innerHTML;
  }

  onMount(() => {
    editorContent = document.querySelector('.editor-content');
    
    // Add click handler for toolbar buttons
    const toolbar = document.querySelector('.editor-toolbar');
    toolbar.addEventListener('click', handleEditorCommand);
    
    // Handle placeholder text
    editorContent.addEventListener('focus', () => {
      if (editorContent.innerHTML === '') {
        editorContent.innerHTML = '';
      }
    });
    
    editorContent.addEventListener('blur', () => {
      if (editorContent.innerHTML === '') {
        editorContent.innerHTML = '';
      }
    });
    
    // Update formData when content changes
    editorContent.addEventListener('input', () => {
      formData.ticket_description = editorContent.innerHTML;
    });
    
    return () => {
      // Cleanup event listeners
      toolbar.removeEventListener('click', handleEditorCommand);
      editorContent.removeEventListener('input', () => {});
    };
  });
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
    
    <!-- Customer Information -->
    <div class="form-section">
      <div class="form-section-title">Thông tin khách hàng</div>
      
      <div class="form-group">
        <div class="input-group">
          <span class="input-group-text">
            {#if formData.picture}
              <img src={formData.picture} alt="Avatar" class="avatar">
            {:else}
              <i class="bi bi-person"></i>
            {/if}
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
      
      <div class="form-row">
        <div class="form-group">
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
        <div class="form-group">
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
      
      <div class="form-row">
        <div class="form-group">
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
        <div class="form-group">
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
      
      <div class="form-group">
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
    </div>
    
    <!-- ERP Information -->
    <div class="form-section">
      <div class="form-section-title">Thông tin ERP</div>
      
      <div class="form-row">
        <div class="form-group">
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
        <div class="form-group">
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
      
      <div class="form-row">
        <div class="form-group">
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
        <div class="form-group">
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
      
      <div class="form-group">
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
      
      <div class="form-group">
        <div class="editor-container">
          <div class="editor-toolbar">
            <button type="button" class="editor-btn" data-command="bold" title="Bold">
              <i class="fas fa-bold"></i>
            </button>
            <button type="button" class="editor-btn" data-command="italic" title="Italic">
              <i class="fas fa-italic"></i>
            </button>
            <button type="button" class="editor-btn" data-command="underline" title="Underline">
              <i class="fas fa-underline"></i>
            </button>
            <button type="button" class="editor-btn" data-command="insertUnorderedList" title="Bullet List">
              <i class="fas fa-list-ul"></i>
            </button>
            <button type="button" class="editor-btn" data-command="insertOrderedList" title="Numbered List">
              <i class="fas fa-list-ol"></i>
            </button>
            <button type="button" class="editor-btn" data-command="createLink" title="Insert Link">
              <i class="fas fa-link"></i>
            </button>
          </div>
          <div 
            class="editor-content" 
            contenteditable="true" 
            data-placeholder="Mô tả yêu cầu..."
            bind:innerHTML={formData.ticket_description}
          ></div>
        </div>
      </div>
      
      <div class="form-group">
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
    
    <button 
      type="button" 
      class="submit-btn" 
      on:click={handleSubmit} 
      disabled={isLoading}
    >
      {#if isLoading}
        <span class="loading"></span> Đang xử lý...
      {:else}
        Tạo Lead ERP
      {/if}
    </button>
  </form>
  
  <div id="success-container" class="alert alert-success" style="display: none;">
    <p id="success-message" class="mb-0"></p>
  </div>
  
  <div id="error-container" class="alert alert-danger" style="display: none;">
    <p id="error-message" class="mb-0"></p>
  </div>
</div>

<style>
  .form-container {
    width: 100%;
    max-width: 400px;
    margin: 0 auto;
    background-color: white;
    padding: 8px;
    border-radius: 4px;
  }
  
  .form-section {
    margin-bottom: 12px;
  }
  
  .form-section-title {
    font-weight: 600;
    margin-bottom: 6px;
    color: #495057;
    font-size: 0.9rem;
    padding-bottom: 4px;
  }
  
  .form-row {
    display: flex;
    gap: 8px;
    margin-bottom: 6px;
  }
  
  .form-group {
    flex: 1;
    margin-bottom: 6px;
  }
  
  .input-group {
    position: relative;
    display: flex;
    align-items: stretch;
  }
  
  .input-group-text {
    position: absolute;
    left: 0;
    top: 0;
    bottom: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 36px;
    color: #6c757d;
    pointer-events: none;
    background: #fff;
  }

  .input-group-text img {
    width: 20px;
    height: 20px;
    border-radius: 50%;
    object-fit: cover;
  }
  
  .input-group .form-control {
    padding-left: 44px;
    width: 100%;
  }
  
  .form-control {
    width: 100%;
    padding: 6px 12px;
    border: 1px solid #ced4da;
    border-radius: 4px;
    font-size: 0.9rem;
    background: transparent;
    transition: border-color 0.15s ease-in-out, box-shadow 0.15s ease-in-out;
    position: relative;
  }

  .form-control::placeholder {
    color: #6c757d;
    opacity: 0.8;
  }

  .input-group:focus-within .form-control {
    border-color: #0d6efd;
    box-shadow: 0 0 0 2px rgba(13, 110, 253, 0.25);
    background: transparent;
  }

  .input-group:focus-within .input-group-text {
    color: #0d6efd;
    background: transparent;
  }

  .input-group i {
    font-size: 0.9rem;
  }

  /* Error state */
  .form-control.error {
    border-color: #dc3545;
  }

  .input-group:focus-within .form-control.error {
    border-color: #dc3545;
    box-shadow: 0 0 0 2px rgba(220, 53, 69, 0.25);
  }

  .input-group:focus-within .form-control.error + .input-group-text {
    color: #dc3545;
  }
  
  .error-message {
    color: #dc3545;
    font-size: 0.75rem;
    margin-top: 2px;
  }
  
  .submit-btn {
    width: 100%;
    padding: 8px;
    background-color: #28a745;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    font-size: 0.9rem;
    margin-top: 8px;
  }
  
  .submit-btn:disabled {
    background-color: #6c757d;
    cursor: not-allowed;
  }
  
  .alert {
    padding: 8px;
    border-radius: 4px;
    margin-top: 8px;
    font-size: 0.9rem;
  }
  
  .alert-success {
    background-color: #d4edda;
    border-color: #c3e6cb;
    color: #155724;
  }
  
  .alert-danger {
    background-color: #f8d7da;
    border-color: #f5c6cb;
    color: #721c24;
  }
  
  /* Editor styles */
  .editor-container {
    border: 1px solid #ced4da;
    border-radius: 4px;
    overflow: hidden;
    max-height: 120px;
  }
  
  .editor-toolbar {
    padding: 4px;
    background-color: #f8f9fa;
    border-bottom: 1px solid #ced4da;
    display: flex;
    gap: 3px;
  }
  
  .editor-btn {
    background: none;
    border: none;
    padding: 3px 6px;
    cursor: pointer;
    border-radius: 4px;
    color: #6c757d;
    font-size: 0.8rem;
  }
  
  .editor-btn:hover {
    background-color: #e9ecef;
    color: #495057;
  }
  
  .editor-content {
    min-height: 80px;
    max-height: 80px;
    padding: 6px;
    outline: none;
    overflow-y: auto;
    font-size: 0.9rem;
  }
  
  .editor-content[data-placeholder]:empty:before {
    content: attr(data-placeholder);
    color: #6c757d;
    pointer-events: none;
  }
</style> 
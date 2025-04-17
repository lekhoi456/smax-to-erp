<script lang="ts">
  import { customerData } from '../stores/customerStore';
  import { validateForm, submitToERP } from '../utils/formUtils';
  import { onMount } from 'svelte';

  let isLoading = false;
  let successMessage = '';
  let errorMessage = '';
  let showSuccess = false;
  let showError = false;

  async function handleSubmit() {
    if (validateForm(true)) {
      isLoading = true;
      showSuccess = false;
      showError = false;

      const result = await submitToERP();

      if (result.success) {
        successMessage = result.message;
        showSuccess = true;
        if (result.leadId) {
          successMessage += ` <a href="https://erp.nucuoimekong.vn/admin/lead/${result.leadId}/show" target="_blank">Xem chi tiết</a>`;
        }
      } else {
        errorMessage = result.message;
        showError = true;
      }

      isLoading = false;
    }
  }

  $: customer = $customerData;
</script>

<form id="userForm" on:submit|preventDefault={handleSubmit}>
  <!-- Hidden fields -->
  <input type="hidden" id="id" bind:value={customer.id} />
  <input type="hidden" id="pid" bind:value={customer.pid} />
  <input type="hidden" id="gid" bind:value={customer.gid} />
  <input type="hidden" id="page_pid" bind:value={customer.page_pid} />
  <input type="hidden" id="picture" bind:value={customer.picture} />

  <!-- Customer Information Section -->
  <div class="form-section-title">Thông tin khách hàng</div>

  <div class="mb-2">
    <div class="input-group">
      <span class="input-group-text" id="avatar-container">
        <div class="avatar-circle" id="avatar-circle">
          {#if customer.picture}
            <img src={customer.picture} alt={customer.name || 'User'} />
          {:else}
            <span class="avatar-placeholder"><i class="bi bi-person"></i></span>
          {/if}
        </div>
      </span>
      <input type="text" id="name" bind:value={customer.name} class="form-control" placeholder="Họ tên" />
    </div>
    <div class="error-message" id="name-error">Vui lòng nhập họ tên</div>
  </div>

  <div class="row mb-2">
    <div class="col-6 col-small-12 mb-2">
      <div class="input-group">
        <span class="input-group-text"><i class="bi bi-calendar"></i></span>
        <input type="text" id="birthdate" bind:value={customer.birthdate} class="form-control datepicker" placeholder="Ngày sinh" />
      </div>
    </div>
    <div class="col-6 col-small-12 mb-2">
      <div class="input-group">
        <span class="input-group-text"><i class="bi bi-gender-ambiguous"></i></span>
        <select id="gender" bind:value={customer.gender} class="form-select form-control">
          <option value="">Giới tính</option>
          <option value="male">Nam</option>
          <option value="female">Nữ</option>
        </select>
      </div>
      <div class="error-message" id="gender-error">Vui lòng chọn giới tính</div>
    </div>
  </div>

  <div class="row mb-2">
    <div class="col-6 col-small-12 mb-2">
      <div class="input-group">
        <span class="input-group-text"><i class="bi bi-phone"></i></span>
        <input type="tel" id="phone" bind:value={customer.phone} class="form-control" placeholder="Số điện thoại" />
      </div>
      <div class="error-message" id="phone-error">Vui lòng nhập số điện thoại hợp lệ</div>
    </div>
    <div class="col-6 col-small-12 mb-2">
      <div class="input-group">
        <span class="input-group-text"><i class="bi bi-envelope"></i></span>
        <input type="email" id="email" bind:value={customer.email} class="form-control" placeholder="Email" />
      </div>
      <div class="error-message" id="email-error">Vui lòng nhập email hợp lệ</div>
    </div>
  </div>

  <div class="mb-2">
    <div class="input-group">
      <span class="input-group-text"><i class="bi bi-geo-alt"></i></span>
      <input type="text" id="address" bind:value={customer.address} class="form-control" placeholder="Địa chỉ" />
    </div>
    <div class="error-message" id="address-error">Vui lòng nhập địa chỉ</div>
  </div>

  <!-- ERP Information Section -->
  <div class="form-section">
    <div class="form-section-title">Thông tin ERP</div>

    <div class="row mb-2">
      <div class="col-6 col-small-12 mb-2">
        <div class="input-group">
          <span class="input-group-text"><i class="bi bi-calendar-check"></i></span>
          <input type="text" id="departure_date" bind:value={customer.departure_date} class="form-control datepicker" placeholder="Ngày đi" />
        </div>
      </div>
      <div class="col-6 col-small-12 mb-2">
        <div class="input-group">
          <span class="input-group-text"><i class="bi bi-calendar-x"></i></span>
          <input type="text" id="return_date" bind:value={customer.return_date} class="form-control datepicker" placeholder="Ngày về" />
        </div>
      </div>
    </div>

    <div class="row mb-2">
      <div class="col-6 col-small-12 mb-2">
        <div class="input-group">
          <span class="input-group-text"><i class="bi bi-people"></i></span>
          <input type="number" id="adult" bind:value={customer.adult} class="form-control" placeholder="Người lớn" min="1" />
        </div>
      </div>
      <div class="col-6 col-small-12 mb-2">
        <div class="input-group">
          <span class="input-group-text"><i class="bi bi-person-hearts"></i></span>
          <input type="number" id="children" bind:value={customer.children} class="form-control" placeholder="Trẻ em" min="0" />
        </div>
      </div>
    </div>

    <div class="row mb-2">
      <div class="col-6 col-small-12 mb-2">
        <div class="input-group">
          <span class="input-group-text"><i class="bi bi-hash"></i></span>
          <input type="text" id="erp_id" bind:value={customer.erp_id} class="form-control" placeholder="ID ERP" />
        </div>
      </div>
      <div class="col-6 col-small-12 mb-2">
        <div class="input-group">
          <span class="input-group-text"><i class="bi bi-fingerprint"></i></span>
          <input type="text" id="erp_unique_id" bind:value={customer.erp_unique_id} class="form-control" placeholder="Unique ID" />
        </div>
      </div>
    </div>

    <div class="row mb-2">
      <div class="col-6 col-small-12 mb-2">
        <div class="input-group">
          <span class="input-group-text"><i class="bi bi-layers"></i></span>
          <select id="type" bind:value={customer.type} class="form-select form-control">
            <option value="">Loại lead</option>
            <option value="1">Lead ghép</option>
            <option value="2">Lead đoàn</option>
          </select>
        </div>
      </div>
      <div class="col-6 col-small-12 mb-2">
        <div class="input-group">
          <span class="input-group-text"><i class="bi bi-flag"></i></span>
          <select id="ticket_priority" bind:value={customer.ticket_priority} class="form-select form-control">
            <option value="normal" selected>Bình thường</option>
            <option value="urgent">Khẩn cấp</option>
          </select>
        </div>
      </div>
    </div>

    <div class="mb-2">
      <div class="input-group">
        <span class="input-group-text"><i class="bi bi-ticket"></i></span>
        <input type="text" id="ticket_name" bind:value={customer.ticket_name} class="form-control" placeholder="Tên yêu cầu" />
      </div>
      <div class="error-message" id="ticket_name-error">Vui lòng nhập tên yêu cầu</div>
    </div>

    <div class="mb-3">
      <label for="ticket_description" class="form-label"><i class="bi bi-card-text me-2"></i>Mô tả yêu cầu</label>
      <textarea id="ticket_description" bind:value={customer.ticket_description}></textarea>
    </div>

    <div class="mb-2">
      <div class="input-group">
        <span class="input-group-text"><i class="bi bi-person-check"></i></span>
        <select id="pic" bind:value={customer.pic} class="form-select form-control">
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
      <div class="error-message" id="pic-error">Vui lòng chọn người phụ trách</div>
    </div>
  </div>

  <div class="d-grid gap-2 mt-3">
    <button type="submit" class="btn btn-success" disabled={isLoading}>
      {#if isLoading}
        <span class="loading"></span> Đang xử lý...
      {:else}
        Tạo Lead ERP
      {/if}
    </button>
  </div>
</form>

{#if showSuccess}
  <div class="alert alert-success mt-3" role="alert">
    <p class="mb-0">{@html successMessage}</p>
  </div>
{/if}

{#if showError}
  <div class="alert alert-danger mt-3" role="alert">
    <p class="mb-0">{errorMessage}</p>
  </div>
{/if}

<style>
  .form-section {
    border-top: 1px solid #dee2e6;
    padding-top: 15px;
    margin-top: 15px;
  }

  .form-section-title {
    font-weight: 600;
    margin-bottom: 12px;
    color: #0d6efd;
    font-size: 15px;
  }

  .loading {
    display: inline-block;
    width: 18px;
    height: 18px;
    border: 3px solid rgba(255,255,255,.3);
    border-radius: 50%;
    border-top-color: #fff;
    animation: spin 1s ease-in-out infinite;
    margin-right: 6px;
    vertical-align: middle;
  }

  @keyframes spin {
    to { transform: rotate(360deg); }
  }

  .error-message {
    color: #dc3545;
    font-size: 12px;
    margin-top: 3px;
    display: none;
  }

  .avatar-circle {
    width: 32px;
    height: 32px;
    border-radius: 50%;
    background-color: #e9ecef;
    display: flex;
    align-items: center;
    justify-content: center;
    overflow: hidden;
  }

  .avatar-circle img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  .avatar-placeholder {
    color: #6c757d;
    font-size: 16px;
  }
</style> 
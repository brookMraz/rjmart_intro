import { $, $$, byId } from './dom-utils.js';
import { api } from './request.js?v=202604303';

const FOCUS_AFTER_PANEL_SWITCH_MS = 100;

function switchFloatPanel(panelName) {
  const managerPanel = byId('manager-form-content');
  const buyerPanel = byId('buyer-panel-content');
  const successPanel = byId('success-panel-content');
  const phoneConsultPanel = byId('phone-consult-panel-content');
  const mainPanel = byId('main-panel');
  const floatingWindow = $('.floating-window');

  if (!managerPanel || !buyerPanel || !successPanel || !phoneConsultPanel || !mainPanel) {
    return;
  }

  mainPanel.classList.remove('float-form-panel--phone-consult');
  mainPanel.style.display = 'block';
  managerPanel.style.display = 'none';
  buyerPanel.classList.remove('active');
  successPanel.classList.remove('active');
  phoneConsultPanel.classList.remove('active');
  floatingWindow?.classList.remove('phone-consult-active');

  if (panelName === 'phone-consult') {
    mainPanel.classList.add('float-form-panel--phone-consult');
    phoneConsultPanel.classList.add('active');
    floatingWindow?.classList.add('phone-consult-active');
    return;
  }

  if (panelName === 'manager') {
    managerPanel.style.display = 'flex';
  } else if (panelName === 'buyer') {
    buyerPanel.classList.add('active');
  } else if (panelName === 'success') {
    successPanel.classList.add('active');
  }
}

function validatePhone(phone) {
  return /^1[3-9]\d{9}$/.test(phone);
}

function showError(input) {
  input.classList.add('error');
  input.closest('.float-input-wrapper')?.classList.add('has-error');
}

function hideError(input) {
  input.classList.remove('error');
  input.closest('.float-input-wrapper')?.classList.remove('has-error');
}

function clearFormErrors(inputs) {
  inputs.forEach(input => {
    if (input) {
      hideError(input);
    }
  });
}

function setSubmitState(isSubmitting, message = '', type = '') {
  const submitButton = $('.float-submit-btn');
  const submitStatus = byId('float-submit-status');

  if (submitButton) {
    submitButton.disabled = isSubmitting;
    submitButton.classList.toggle('is-loading', isSubmitting);
    submitButton.textContent = isSubmitting ? '提交中...' : '提交您的申请';
  }

  if (submitStatus) {
    submitStatus.textContent = message;
    submitStatus.className = `float-submit-status${type ? ` ${type}` : ''}`;
  }
}

async function submitBizClue(config, payload) {
  if (!config.bizClueSubmitUrl) {
    throw new Error('未配置申请提交接口');
  }

  return api.post(config.bizClueSubmitUrl, payload);
}

export function initFloatingForm(config) {
  let isSubmitting = false;

  $$('.float-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      const tabType = tab.getAttribute('data-tab');
      if (tabType === 'buyer') {
        switchFloatPanel('buyer');
      } else if (tabType === 'manager' || tabType === 'manager-back') {
        switchFloatPanel('manager');
      }
    });
  });

  byId('buyer-register-btn')?.addEventListener('click', () => {
    window.open(config.buyerRegisterUrl, '_blank');
  });

  const floatCloseBtn = byId('float-close-btn');
  const floatForm = byId('float-form');
  const floatName = byId('float-name');
  const floatPhone = byId('float-phone');
  const floatCompany = byId('float-company');
  const floatMessage = byId('float-message');
  const mainPanel = byId('main-panel');
  const floatingWindow = $('.floating-window');
  const formInputs = [floatName, floatPhone, floatCompany, floatMessage];

  floatCloseBtn?.addEventListener('click', () => {
    if (mainPanel) {
      mainPanel.style.display = 'none';
    }
    floatingWindow?.classList.remove('phone-consult-active');
  });

  floatName?.addEventListener('input', () => {
    if (!isSubmitting) {
      setSubmitState(false);
    }
    if (floatName.value.trim()) {
      hideError(floatName);
    }
  });

  floatPhone?.addEventListener('input', () => {
    if (!isSubmitting) {
      setSubmitState(false);
    }
    if (validatePhone(floatPhone.value.trim())) {
      hideError(floatPhone);
    }
  });

  floatCompany?.addEventListener('input', () => {
    if (!isSubmitting) {
      setSubmitState(false);
    }
    if (floatCompany.value.trim()) {
      hideError(floatCompany);
    }
  });

  floatMessage?.addEventListener('input', () => {
    if (!isSubmitting) {
      setSubmitState(false);
    }
  });

  floatForm?.addEventListener('submit', async event => {
    event.preventDefault();
    if (isSubmitting) {
      return;
    }
    if (!floatName || !floatPhone || !floatCompany) {
      return;
    }

    let isValid = true;

    if (!floatName.value.trim()) {
      showError(floatName);
      isValid = false;
    } else {
      hideError(floatName);
    }

    if (!validatePhone(floatPhone.value.trim())) {
      showError(floatPhone);
      isValid = false;
    } else {
      hideError(floatPhone);
    }

    if (!floatCompany.value.trim()) {
      showError(floatCompany);
      isValid = false;
    } else {
      hideError(floatCompany);
    }

    if (isValid) {
      const payload = {
        name: floatName.value.trim(),
        phone: floatPhone.value.trim(),
        organization: floatCompany.value.trim(),
        message: floatMessage?.value.trim() || '',
        source: config.bizClueSource ?? 1,
        channel: config.bizClueChannel ?? 4
      };

      setSubmitState(true);
      isSubmitting = true;
      try {
        await submitBizClue(config, payload);
        switchFloatPanel('success');
        floatForm.reset();
        clearFormErrors(formInputs);
        setSubmitState(false);
      } catch (error) {
        setSubmitState(false, error.message || '提交失败，请稍后再试', 'is-error');
      } finally {
        isSubmitting = false;
      }
    }
  });

  byId('trial-btn')?.addEventListener('click', () => {
    switchFloatPanel('manager');
    setTimeout(() => {
      floatName?.focus();
    }, FOCUS_AFTER_PANEL_SWITCH_MS);
  });

  byId('phone-consult-btn')?.addEventListener('click', () => {
    switchFloatPanel('phone-consult');
  });

  switchFloatPanel('manager');
}

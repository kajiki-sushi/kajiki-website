(function () {
  const WEBHOOK_URL = "https://hook.eu1.make.com/vii9a2bjut66mgomyptl8we0km3aitde";
  const SUCCESS_MESSAGE = "Ajout\u00e9.";
  const ERROR_MESSAGE = "Erreur. R\u00e9essayez.";

  function getNotificationForms() {
    return document.querySelectorAll("[data-notification-form], .notifications-form");
  }

  function findWithinScope(scope, selectors) {
    for (const selector of selectors) {
      const match = scope.querySelector(selector);
      if (match) return match;
    }

    return null;
  }

  function getFormParts(form) {
    const container = form.closest(".notifications-content") || form.parentElement || document;

    return {
      emailInput: findWithinScope(form, [
        "[data-notification-email]",
        ".notifications-input",
        'input[type="email"]'
      ]),
      consentInput: findWithinScope(container, [
        "[data-notification-consent]",
        '.notifications-consent input[type="checkbox"]',
        'input[type="checkbox"]'
      ]),
      statusEl: findWithinScope(container, [
        "[data-notification-status]",
        ".notifications-status"
      ]),
      submitButton: findWithinScope(form, [
        'button[type="submit"]',
        'input[type="submit"]'
      ])
    };
  }

  function setStatus(statusEl, message) {
    if (statusEl) {
      statusEl.textContent = message;
    }
  }

  async function handleSubmit(event) {
    event.preventDefault();

    const form = event.currentTarget;
    const { emailInput, consentInput, statusEl, submitButton } = getFormParts(form);

    if (!emailInput) return;

    const email = emailInput.value.trim();
    setStatus(statusEl, "");
    emailInput.value = email;

    if (!email || !emailInput.checkValidity()) {
      emailInput.focus();
      setStatus(statusEl, ERROR_MESSAGE);
      return;
    }

    if (consentInput && consentInput.required && !consentInput.checked) {
      consentInput.focus();
      setStatus(statusEl, ERROR_MESSAGE);
      return;
    }

    if (submitButton) {
      submitButton.disabled = true;
    }

    try {
      const response = await fetch(WEBHOOK_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          email
        })
      });

      if (!response.ok) {
        throw new Error(`Webhook request failed with status ${response.status}`);
      }

      form.reset();
      setStatus(statusEl, SUCCESS_MESSAGE);
    } catch (error) {
      setStatus(statusEl, ERROR_MESSAGE);
    } finally {
      if (submitButton) {
        submitButton.disabled = false;
      }
    }
  }

  function initNotificationForms() {
    getNotificationForms().forEach((form) => {
      if (form.dataset.notificationBound === "true") return;

      form.dataset.notificationBound = "true";
      form.addEventListener("submit", handleSubmit);
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initNotificationForms);
  } else {
    initNotificationForms();
  }
})();

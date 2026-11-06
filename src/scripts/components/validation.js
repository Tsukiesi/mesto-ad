const getErrorElement = (formElement, inputElement) =>
  formElement.querySelector(`#${inputElement.id}-error`);

const showInputError = (formElement, inputElement, errorMessage, settings) => {
  const errorElement = getErrorElement(formElement, inputElement);

  inputElement.classList.add(settings.inputErrorClass);
  errorElement.textContent = errorMessage;
  errorElement.classList.add(settings.errorClass);
};

const hideInputError = (formElement, inputElement, settings) => {
  const errorElement = getErrorElement(formElement, inputElement);

  inputElement.classList.remove(settings.inputErrorClass);
  errorElement.classList.remove(settings.errorClass);
  errorElement.textContent = "";
};

const checkInputValidity = (formElement, inputElement, settings) => {
  // Сбрасываем прошлое кастомное сообщение, иначе поле останется невалидным
  inputElement.setCustomValidity("");

  if (inputElement.validity.patternMismatch && inputElement.dataset.errorMessage) {
    inputElement.setCustomValidity(inputElement.dataset.errorMessage);
  }

  if (inputElement.validity.valid) {
    hideInputError(formElement, inputElement, settings);
  } else {
    showInputError(formElement, inputElement, inputElement.validationMessage, settings);
  }
};

const hasInvalidInput = (inputList) =>
  inputList.some((inputElement) => !inputElement.validity.valid);

const disableSubmitButton = (buttonElement, settings) => {
  buttonElement.disabled = true;
  buttonElement.classList.add(settings.inactiveButtonClass);
};

const enableSubmitButton = (buttonElement, settings) => {
  buttonElement.disabled = false;
  buttonElement.classList.remove(settings.inactiveButtonClass);
};

const toggleButtonState = (inputList, buttonElement, settings) => {
  if (hasInvalidInput(inputList)) {
    disableSubmitButton(buttonElement, settings);
  } else {
    enableSubmitButton(buttonElement, settings);
  }
};

const setEventListeners = (formElement, settings) => {
  const inputList = Array.from(formElement.querySelectorAll(settings.inputSelector));
  const buttonElement = formElement.querySelector(settings.submitButtonSelector);

  toggleButtonState(inputList, buttonElement, settings);

  inputList.forEach((inputElement) => {
    inputElement.addEventListener("input", () => {
      checkInputValidity(formElement, inputElement, settings);
      toggleButtonState(inputList, buttonElement, settings);
    });
  });
};

export const clearValidation = (formElement, settings) => {
  const inputList = Array.from(formElement.querySelectorAll(settings.inputSelector));
  const buttonElement = formElement.querySelector(settings.submitButtonSelector);

  inputList.forEach((inputElement) => {
    inputElement.setCustomValidity("");
    hideInputError(formElement, inputElement, settings);
  });

  disableSubmitButton(buttonElement, settings);
};

export const enableValidation = (settings) => {
  const formList = Array.from(document.querySelectorAll(settings.formSelector));

  formList.forEach((formElement) => {
    setEventListeners(formElement, settings);
  });
};

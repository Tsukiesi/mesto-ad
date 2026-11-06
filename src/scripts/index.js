import {
  createCardElement,
  deleteCard,
  updateCardLikes,
} from "./components/card.js";
import {
  openModalWindow,
  closeModalWindow,
  setCloseModalWindowEventListeners,
} from "./components/modal.js";
import { enableValidation, clearValidation } from "./components/validation.js";
import {
  getUserInfo,
  getCardList,
  setUserInfo,
  setUserAvatar,
  addCard,
  deleteCardFromServer,
  changeLikeCardStatus,
} from "./components/api.js";

// Настройки валидации форм
const validationSettings = {
  formSelector: ".popup__form",
  inputSelector: ".popup__input",
  submitButtonSelector: ".popup__button",
  inactiveButtonClass: "popup__button_disabled",
  inputErrorClass: "popup__input_type_error",
  errorClass: "popup__error_visible",
};

const placesWrap = document.querySelector(".places__list");
const profileFormModalWindow = document.querySelector(".popup_type_edit");
const profileForm = profileFormModalWindow.querySelector(".popup__form");
const profileTitleInput = profileForm.querySelector(".popup__input_type_name");
const profileDescriptionInput = profileForm.querySelector(
  ".popup__input_type_description",
);

const cardFormModalWindow = document.querySelector(".popup_type_new-card");
const cardForm = cardFormModalWindow.querySelector(".popup__form");
const cardNameInput = cardForm.querySelector(".popup__input_type_card-name");
const cardLinkInput = cardForm.querySelector(".popup__input_type_url");

const imageModalWindow = document.querySelector(".popup_type_image");
const imageElement = imageModalWindow.querySelector(".popup__image");
const imageCaption = imageModalWindow.querySelector(".popup__caption");

const openProfileFormButton = document.querySelector(".profile__edit-button");
const openCardFormButton = document.querySelector(".profile__add-button");

const profileTitle = document.querySelector(".profile__title");
const profileDescription = document.querySelector(".profile__description");
const profileAvatar = document.querySelector(".profile__image");

const avatarFormModalWindow = document.querySelector(".popup_type_edit-avatar");
const avatarForm = avatarFormModalWindow.querySelector(".popup__form");
const avatarInput = avatarForm.querySelector(".popup__input");

const cardInfoModalWindow = document.querySelector(".popup_type_info");
const cardInfoModalTitle = cardInfoModalWindow.querySelector(".popup__title");
const cardInfoModalInfoList = cardInfoModalWindow.querySelector(".popup__info");
const cardInfoModalText = cardInfoModalWindow.querySelector(".popup__text");
const cardInfoModalUsersList =
  cardInfoModalWindow.querySelector(".popup__list");

const infoDefinitionTemplate = document.getElementById(
  "popup-info-definition-template",
);
const infoUserPreviewTemplate = document.getElementById(
  "popup-info-user-preview-template",
);

let currentUserId = null;

const formatDate = (date) =>
  date.toLocaleDateString("ru-RU", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

const renderLoading = (isLoading, button, defaultText, loadingText) => {
  button.textContent = isLoading ? loadingText : defaultText;
};

const renderUserInfo = ({ name, about, avatar }) => {
  profileTitle.textContent = name;
  profileDescription.textContent = about;
  profileAvatar.style.backgroundImage = `url(${avatar})`;
};

const createInfoString = (term, description) => {
  const infoItem = infoDefinitionTemplate.content
    .querySelector(".popup__info-item")
    .cloneNode(true);

  infoItem.querySelector(".popup__info-term").textContent = term;
  infoItem.querySelector(".popup__info-description").textContent = description;

  return infoItem;
};

const createUserPreview = (user) => {
  const userItem = infoUserPreviewTemplate.content
    .querySelector(".popup__list-item")
    .cloneNode(true);

  userItem.textContent = user.name;

  return userItem;
};

const handlePreviewPicture = ({ name, link }) => {
  imageElement.src = link;
  imageElement.alt = name;
  imageCaption.textContent = name;
  openModalWindow(imageModalWindow);
};

const handleLikeCard = ({ cardId, isLiked, cardElement }) => {
  changeLikeCardStatus(cardId, isLiked)
    .then((cardData) => {
      updateCardLikes(cardElement, cardData.likes, currentUserId);
    })
    .catch((err) => {
      console.log(err);
    });
};

const handleDeleteCard = (cardId, cardElement) => {
  deleteCardFromServer(cardId)
    .then(() => {
      deleteCard(cardElement);
    })
    .catch((err) => {
      console.log(err);
    });
};

const handleInfoClick = (cardId) => {
  getCardList()
    .then((cards) => {
      const cardData = cards.find((card) => card._id === cardId);

      if (!cardData) {
        return;
      }

      cardInfoModalInfoList.textContent = "";
      cardInfoModalUsersList.textContent = "";

      cardInfoModalTitle.textContent = "Информация о карточке";
      cardInfoModalInfoList.append(
        createInfoString("Описание:", cardData.name),
        createInfoString(
          "Дата создания:",
          formatDate(new Date(cardData.createdAt)),
        ),
        createInfoString("Владелец:", cardData.owner.name),
        createInfoString("Количество лайков:", cardData.likes.length),
      );

      cardInfoModalText.textContent = cardData.likes.length
        ? "Лайкнули:"
        : "Пока никто не лайкнул";
      cardData.likes.forEach((user) => {
        cardInfoModalUsersList.append(createUserPreview(user));
      });

      openModalWindow(cardInfoModalWindow);
    })
    .catch((err) => {
      console.log(err);
    });
};

const renderCard = (cardData, method = "append") => {
  placesWrap[method](
    createCardElement(cardData, currentUserId, {
      onPreviewPicture: handlePreviewPicture,
      onLikeIcon: handleLikeCard,
      onDeleteCard: handleDeleteCard,
      onInfoClick: handleInfoClick,
    }),
  );
};

const handleProfileFormSubmit = (evt) => {
  evt.preventDefault();
  const submitButton = evt.submitter;
  const defaultText = submitButton.textContent;

  renderLoading(true, submitButton, defaultText, "Сохранение...");
  setUserInfo({
    name: profileTitleInput.value,
    about: profileDescriptionInput.value,
  })
    .then((userData) => {
      renderUserInfo(userData);
      closeModalWindow(profileFormModalWindow);
    })
    .catch((err) => {
      console.log(err);
    })
    .finally(() => {
      renderLoading(false, submitButton, defaultText, "Сохранение...");
    });
};

const handleAvatarFormSubmit = (evt) => {
  evt.preventDefault();
  const submitButton = evt.submitter;
  const defaultText = submitButton.textContent;

  renderLoading(true, submitButton, defaultText, "Сохранение...");
  setUserAvatar(avatarInput.value)
    .then((userData) => {
      renderUserInfo(userData);
      avatarForm.reset();
      closeModalWindow(avatarFormModalWindow);
    })
    .catch((err) => {
      console.log(err);
    })
    .finally(() => {
      renderLoading(false, submitButton, defaultText, "Сохранение...");
    });
};

const handleCardFormSubmit = (evt) => {
  evt.preventDefault();
  const submitButton = evt.submitter;
  const defaultText = submitButton.textContent;

  renderLoading(true, submitButton, defaultText, "Создание...");
  addCard({
    name: cardNameInput.value,
    link: cardLinkInput.value,
  })
    .then((cardData) => {
      renderCard(cardData, "prepend");
      cardForm.reset();
      closeModalWindow(cardFormModalWindow);
    })
    .catch((err) => {
      console.log(err);
    })
    .finally(() => {
      renderLoading(false, submitButton, defaultText, "Создание...");
    });
};

profileForm.addEventListener("submit", handleProfileFormSubmit);
cardForm.addEventListener("submit", handleCardFormSubmit);
avatarForm.addEventListener("submit", handleAvatarFormSubmit);

openProfileFormButton.addEventListener("click", () => {
  profileTitleInput.value = profileTitle.textContent;
  profileDescriptionInput.value = profileDescription.textContent;
  clearValidation(profileForm, validationSettings);
  openModalWindow(profileFormModalWindow);
});

profileAvatar.addEventListener("click", () => {
  avatarForm.reset();
  clearValidation(avatarForm, validationSettings);
  openModalWindow(avatarFormModalWindow);
});

openCardFormButton.addEventListener("click", () => {
  cardForm.reset();
  clearValidation(cardForm, validationSettings);
  openModalWindow(cardFormModalWindow);
});

const allPopups = document.querySelectorAll(".popup");
allPopups.forEach((popup) => {
  setCloseModalWindowEventListeners(popup);
});

enableValidation(validationSettings);

Promise.all([getCardList(), getUserInfo()])
  .then(([cards, userData]) => {
    currentUserId = userData._id;
    renderUserInfo(userData);
    cards.forEach((cardData) => {
      renderCard(cardData);
    });
  })
  .catch((err) => {
    console.log(err);
  });

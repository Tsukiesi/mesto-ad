const LIKE_ACTIVE_CLASS = "card__like-button_is-active";

const getTemplate = () => {
  return document
    .getElementById("card-template")
    .content.querySelector(".card")
    .cloneNode(true);
};

export const deleteCard = (cardElement) => {
  cardElement.remove();
};

export const updateCardLikes = (cardElement, likes, userId) => {
  const likeButton = cardElement.querySelector(".card__like-button");
  const likeCount = cardElement.querySelector(".card__like-count");
  const isLiked = likes.some((user) => user._id === userId);

  likeButton.classList.toggle(LIKE_ACTIVE_CLASS, isLiked);
  likeCount.textContent = likes.length;
};

export const createCardElement = (
  data,
  userId,
  { onPreviewPicture, onLikeIcon, onDeleteCard, onInfoClick },
) => {
  const cardElement = getTemplate();
  const likeButton = cardElement.querySelector(".card__like-button");
  const deleteButton = cardElement.querySelector(
    ".card__control-button_type_delete",
  );
  const infoButton = cardElement.querySelector(
    ".card__control-button_type_info",
  );
  const cardImage = cardElement.querySelector(".card__image");

  cardImage.src = data.link;
  cardImage.alt = data.name;
  cardElement.querySelector(".card__title").textContent = data.name;

  updateCardLikes(cardElement, data.likes, userId);

  // Иконка удаления показывается только автору карточки
  if (data.owner._id !== userId) {
    deleteButton.remove();
  } else if (onDeleteCard) {
    deleteButton.addEventListener("click", () =>
      onDeleteCard(data._id, cardElement),
    );
  }

  if (onLikeIcon) {
    likeButton.addEventListener("click", () =>
      onLikeIcon({
        cardId: data._id,
        isLiked: likeButton.classList.contains(LIKE_ACTIVE_CLASS),
        cardElement,
      }),
    );
  }

  if (onPreviewPicture) {
    cardImage.addEventListener("click", () =>
      onPreviewPicture({ name: data.name, link: data.link }),
    );
  }

  if (onInfoClick) {
    infoButton.addEventListener("click", () => onInfoClick(data._id));
  }

  return cardElement;
};

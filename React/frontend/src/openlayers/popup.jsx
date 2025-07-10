export function showPopup(message = "İşlem başarılı!", type = "success") {
  const popup = document.createElement("div");
  popup.className = `popup-message ${type}`;
  popup.innerHTML = `
    <span class="popup-text">${message}</span>
    <button class="popup-close">&times;</button>
  `;

  document.body.appendChild(popup);

 
  setTimeout(() => {
    popup.classList.add("show");
  }, 10);

  const autoClose = setTimeout(() => {
    popup.classList.remove("show");
    setTimeout(() => {
      popup.remove();
    }, 300);
  }, 2000);

  
  popup.querySelector(".popup-close").addEventListener("click", () => {
    clearTimeout(autoClose); 
    popup.classList.remove("show");
    setTimeout(() => {
      popup.remove();
    }, 300);
  });
}

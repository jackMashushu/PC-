window.onload = () => {
  const buttons = document.querySelectorAll(".multi-button button");
  buttons.forEach((button, index) => {
    button.addEventListener("mouseover", () => {
      if (index > 0) {
        const prevTooltip = buttons[index - 1].querySelector("div");
        prevTooltip.classList.remove("animate-right");
        prevTooltip.classList.add("animate-left");
      }
      if (index < buttons.length - 1) {
        const nextTooltip = buttons[index + 1].querySelector("div");
        nextTooltip.classList.remove("animate-left");
        nextTooltip.classList.add("animate-right");
      }
    });
  });
};
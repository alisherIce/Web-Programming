(() => {
  const form = document.getElementById("feedback-form");
  if (!form) return;

  const choices = form.querySelectorAll(".feedback-choice");
  const more = document.getElementById("feedback-more");
  const label = document.getElementById("feedback-label");
  const text = document.getElementById("feedback-text");
  const done = document.getElementById("feedback-done");
  let rating = null;

  choices.forEach((button) => {
    button.addEventListener("click", () => {
      rating = button.dataset.rating;
      choices.forEach((choice) => {
        choice.setAttribute("aria-pressed", String(choice === button));
      });
      label.textContent = rating === "up"
        ? "What worked well?"
        : "What could be better?";
      more.hidden = false;
      text.focus();
    });
  });

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    if (!rating) return;

    // This static GitHub Pages version demonstrates the feedback interaction.
    // It does not send or store visitor feedback on a server.
    console.info("Portfolio feedback:", {
      rating,
      feedback: text.value.trim()
    });

    form.hidden = true;
    done.hidden = false;
  });
})();

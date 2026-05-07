(function () {
  const cartState = document.querySelector("#cart-state");
  const orderMessage = document.querySelector("#order-message");
  const orderSummary = document.querySelector("#order-summary");
  const summaryPlan = document.querySelector("#summary-plan");
  const summaryPrice = document.querySelector("#summary-price");
  const selectedPlan = { name: "", price: 0 };

  function updateOrderSummary() {
    if (!orderSummary || !summaryPlan || !summaryPrice) return;

    if (!selectedPlan.name) {
      orderSummary.hidden = true;
      return;
    }

    summaryPlan.textContent = selectedPlan.name;
    summaryPrice.textContent = `${selectedPlan.price} €`;
    orderSummary.hidden = false;
  }

  document.querySelectorAll(".add-plan").forEach((button) => {
    button.addEventListener("click", () => {
      const card = button.closest(".price-card");
      selectedPlan.name = card?.dataset.plan || "Paket";
      selectedPlan.price = Number(card?.dataset.price || 0);

      if (cartState) {
        cartState.textContent = `${selectedPlan.name} ausgewählt: ${selectedPlan.price} € pro Monat inkl. USt.`;
      }

      updateOrderSummary();
    });
  });

  const checkoutForm = document.querySelector("#checkout-form");
  if (checkoutForm && orderMessage) {
    checkoutForm.addEventListener("submit", (event) => {
      event.preventDefault();

      if (!selectedPlan.name) {
        orderMessage.textContent = "Bitte wählen Sie zuerst ein Paket aus.";
        return;
      }

      orderMessage.textContent = `Demo-Bestellung für ${selectedPlan.name} erfasst. Diese Website löst keine Zahlung aus.`;
      checkoutForm.reset();
      selectedPlan.name = "";
      selectedPlan.price = 0;
      if (cartState) cartState.textContent = "Noch kein Paket ausgewählt.";
      updateOrderSummary();
    });
  }
})();

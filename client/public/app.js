const toCurrency = price => {
  return new Intl.NumberFormat("ru-RU", {
    currency: "rub",
    style: "currency"
  }).format(price);
};

document.querySelectorAll(".price").forEach(node => {
  node.textContent = toCurrency(node.textContent);
});

const $cart = document.querySelector(".cart");

if ($cart) {
  $cart.addEventListener("click", ({ target }) => {
    if (target.classList.contains("js-remove")) {
      const { id } = target.dataset;

      fetch(`cart/remove/${id}`, {
        method: "delete"
      })
        .then(res => res.json())
        .then(cart => {
          if (cart.courses.length) {
            const html = cart.courses
              .map(({ title, count, id }) => {
                return `
                <tr>
                  <td>${title}</td>
                  <td>${count}</td>
                  <td>
                    <button class="btn btn-small js-remove" data-id="${id}">Delete</button>
                  </td>
                </tr>
              `;
              })
              .join("");

            $cart.querySelector("tbody").innerHTML = html;
            $cart.querySelector(".price").textContent = toCurrency(cart.price);
          } else {
            $cart.innerHTML = "<p>Cart is Empty</p>";
          }
        });
    }
  });
}

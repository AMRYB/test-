function updateCartQty(btn, change) {
   const span = btn.parentElement.querySelector('span');
   let current = parseInt(span.innerText);
   current += change;
   if (current < 1) current = 1;
   span.innerText = current;
}
function selectPayment(element) {
   document.querySelectorAll('.payment-btn').forEach(btn => btn.classList.remove('active'));
   element.classList.add('active');
}
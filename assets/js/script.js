document.addEventListener('DOMContentLoaded', function () {

   const buttons = document.querySelectorAll('.product__heart, .product__bag');

   buttons.forEach((button) => {
      button.addEventListener('click', function (event) {
         event.preventDefault();
         event.stopPropagation();
      });
   });
});
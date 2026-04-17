document.addEventListener("click", function (event) {
   var target = event.target.closest("[data-click]");
   if (!target) {
      return;
   }

   var expression = target.getAttribute("data-click");
   if (!expression) {
      return;
   }

   Function(expression).call(target);
});
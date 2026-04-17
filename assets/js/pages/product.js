let qty = 1;

function updateQty(change) {
   qty += change;
   if (qty < 1) qty = 1;
   document.getElementById('qtyText').innerText = qty;
}

function changeImage(element, src) {
   document.getElementById('mainImage').style.opacity = '0.5';
   setTimeout(() => {
      document.getElementById('mainImage').src = src;
      document.getElementById('mainImage').style.opacity = '1';
   }, 150);

   document.querySelectorAll('.thumbnail').forEach(t => t.classList.remove('active'));
   element.classList.add('active');
}

function selectSize(element) {
   document.querySelectorAll('.size-btn').forEach(btn => btn.classList.remove('active'));
   element.classList.add('active');
}

function selectColor(element) {
   document.querySelectorAll('.color-btn').forEach(btn => btn.classList.remove('active'));
   element.classList.add('active');
}
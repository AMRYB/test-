const hamburger = document.querySelector('.hamburger');
const sidebar = document.getElementById('sidebar');
const overlay = document.getElementById('sidebarOverlay');
const closeBtn = document.getElementById('closeSidebar');

function openSidebar() {
   sidebar.classList.add('active');
   overlay.classList.add('active');
   document.body.style.overflow = 'hidden';
}

function closeSidebar() {
   sidebar.classList.remove('active');
   overlay.classList.remove('active');
   document.body.style.overflow = '';
}

hamburger.addEventListener('click', openSidebar);
closeBtn.addEventListener('click', closeSidebar);
overlay.addEventListener('click', closeSidebar);
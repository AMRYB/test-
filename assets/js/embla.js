document.addEventListener('DOMContentLoaded', function () {
   const emblaNode = document.querySelector('.embla');
   const options = {
      loop: false
   };
   const emblaApi = EmblaCarousel(emblaNode, options);

   console.log(emblaApi.slideNodes());

   const dotsNode = document.querySelector('.embla__dots');

   const setupDots = () => {
      const slideCount = emblaApi.slideNodes().length;
      const dotsFragment = document.createDocumentFragment();

      for (let i = 0; i < slideCount; i++) {
         const dot = document.createElement('button');
         dot.classList.add('embla__dot');
         dot.addEventListener('click', () => emblaApi.scrollTo(i));
         dotsFragment.appendChild(dot);
      }

      dotsNode.appendChild(dotsFragment);
      console.log('Dots created:', dotsNode.children.length);
   };

   const selectDot = () => {
      const previous = dotsNode.querySelector('.is-selected');
      const selected = dotsNode.children[emblaApi.selectedScrollSnap()];

      if (previous) previous.classList.remove('is-selected');
      if (selected) selected.classList.add('is-selected');
   };

   emblaApi.on('select', selectDot);

   setupDots();
   selectDot();
});
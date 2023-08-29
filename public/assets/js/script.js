import people from './components/Data.js';

//Declaration
const navbar = document.querySelector('.navbar');
const scrollTop = document.querySelector('.scroll-top');

//fixed-nav
if (scrollTop)
  window.onscroll = () => {
    if (window.scrollY > 10) {
      navbar.classList.add('nav-active');
      scrollTop.classList.remove('opacity-0');
    } else {
      navbar.classList.remove('nav-active');
      scrollTop.classList.add('opacity-0');
    }
  };
//typing animation
if (document.getElementById('typed'))
  var typed = new Typed('#typed', {
    strings: ['For Students', 'For Researchers', 'For Curious Mind', 'For Analysts'],
    backSpeed: 30,
    backDelay: 1300,
    typeSpeed: 30,
    loop: true,
  });

//Date
const dateText = document.querySelector('.text-date-footer');

const date = new Date().getFullYear();
// dateText.innerHTML = ` Copyright © <strong>HiFiles</strong> ${date}. All rights reserved.`;

//Slider
//declaration
const container = document.querySelector('.slide-container');
const nextBtn = document.querySelector('.next-btn');
const prevBtn = document.querySelector('.prev-btn');

//set slide
if (container) {
  container.innerHTML = people
    .map((person, slideIndex) => {
      //more logic later
      let position = 'next';
      //if the slideIndex is 0 =>active class,if the slideIndex is last =>last class,others next class
      if (slideIndex === 0) {
        position = 'active'; //for the first item
      }
      if (slideIndex === people.length - 1) {
        position = 'last'; //for the last item
      }
      const { img, name, job, text } = person;
      return `<article class="slide ${position}">
            <img
              src="${img}"
              alt="${img}"
              class="slider-img"
            />
            <h4>${name}</h4>
            <p class="slider-title">${job}</p>
            <p class="slider-text">
             ${text}
            </p>
          </article>`;
    })
    .join('');

  //Slider functionallity
  //the type parameter will change the classlist change for prev btn
  const startSlider = (type) => {
    const active = document.querySelector('.active');
    const last = document.querySelector('.last');
    let next = active.nextElementSibling;
    //when we run out of elments
    if (!next) {
      next = container.firstElementChild;
    }

    //remove
    active.classList.remove(['active']); //classlist returns in the form of array so we ['class'] syntax to specify the class we want to remove
    last.classList.remove(['last']);
    next.classList.remove(['next']);
    //<!--TODO: this is crucial to place it between removing and adding the classlist
    if (type === 'prev') {
      active.classList.add('next');
      last.classList.add('active');
      next = last.previousElementSibling;
      //if we run out of last
      if (!next) {
        next = container.lastElementChild; //first we assign the last elment to be next
      }
      next.classList.remove(['next']); //we remove the next class and assign it to be last
      next.classList.add('last');
      return; //important to return the function from here to ignore the rest of functionallity in the bottom
    }
    //add
    active.classList.add('last');
    last.classList.add('next');
    next.classList.add('active');
  };
  //next btn

  nextBtn.addEventListener('click', () => {
    startSlider();
  });
  //prev btn
  prevBtn.addEventListener('click', () => {
    startSlider('prev');
  });
}

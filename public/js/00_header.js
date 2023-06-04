$(document).ready(function(){
  $('#off-canvas-toggler-btn').click(toggleOffCanvas);
  $('.navigation-dropdown-btn').click(toggleDropdown);
});

// Open and close navigation menu in mobile view - workaround to delay display: none after sliding transition finished
function toggleOffCanvas(){      
  let navigationMenu = document.querySelector('.navigation-menu');
  if (navigationMenu.classList.contains('hide')) {
    navigationMenu.classList.remove('hide');
    setTimeout(() => {
      navigationMenu.classList.remove('slid-right');
    }, 20);
  } else {
    navigationMenu.classList.add('slid-right');
    navigationMenu.addEventListener('transitionend', () => {
      navigationMenu.classList.add('hide');
    }, {
      capture: false,
      once: true,
      passive: false
    });
  }
};

// Open and close dropdown menus in mobile view
function toggleDropdown(){      
  $(this).nextAll(".navigation-dropdown-menu").toggleClass("open");
  $(this).toggleClass("open");      
};


// Hide navigation bar when scrolling down, show when scrolling up
let prevScrollPos = window.pageYOffset; // Position a moment ago
let scrollStartPos = window.pageYOffset; // Position before the last 100 px long scroll

window.addEventListener('scroll', (event) => {
  let currScrollPos = window.pageYOffset;        
  let scrollDistance = Math.abs(currScrollPos - scrollStartPos);
  let offCanvasStatus = $('#off-canvas-toggler-btn').attr('class');

  if (currScrollPos < 100 || offCanvasStatus == "active"){ // always visible when scrolled to top or if off-canvas is active
    $('.navigation').removeClass('navigation-hide');
  } else {
    if (scrollDistance > 100){
      if (prevScrollPos < currScrollPos){ // Scroll down
        $('.navigation').addClass('navigation-hide');            
      } else if (prevScrollPos > currScrollPos){ // Scroll up
        $('.navigation').removeClass('navigation-hide');
      }
      scrollStartPos = window.pageYOffset;
    }
  }

  prevScrollPos = window.pageYOffset;
});
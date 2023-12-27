$(document).ready(function(){
  $('#contact-submit').click(submit);
  $('#contact-enable').click(enableFields);
  $('#contact-disable').click(disableFields);
  // $('#contact-switch').click(switchView);
  document.querySelector("#welcome-text-container h2").classList.remove("before-scroll");
  document.querySelector("#welcome-text-container p").classList.remove("before-scroll");
  
  // Triggers animation when element appears on display
  document.addEventListener("scroll", (event) => {
    let timer = 200;
    let displayBottom = window.scrollY + document.documentElement.clientHeight;
    let mainIntroOffset = document.querySelector("#main-introduction").offsetTop;
    let mainStackOffset = document.querySelector("#main-stack").offsetTop;
    let mainStrengthsOffset = document.querySelector("#main-strengths").offsetTop;
    let mainMinisitesOffset = document.querySelector("#main-minisites").offsetTop;
    
    if (mainIntroOffset <= displayBottom){
      document.querySelector("#main-introduction div").classList.remove("before-scroll");
    }
    if (mainStackOffset <= displayBottom - 60){
      document.querySelector("#main-stack div").classList.remove("before-scroll");
    }
    if (mainStrengthsOffset <= displayBottom - 60){
      document.querySelector("#main-strengths div").classList.remove("before-scroll");
    }
    if (mainMinisitesOffset <= displayBottom - 60){
      document.querySelector("#main-minisites div").classList.remove("before-scroll");
      document.querySelector("#main-minisite-item-snake").classList.remove("before-scroll");
      setTimeout(() => {
        document.querySelector("#main-minisite-item-news").classList.remove("before-scroll");
      }, timer);
      setTimeout(() => {
        document.querySelector("#main-minisite-item-editor").classList.remove("before-scroll");
      }, 2 * timer);
      setTimeout(() => {
        document.querySelector("#main-minisite-item-fileuploader").classList.remove("before-scroll");
      }, 3 * timer);
      setTimeout(() => {
        document.querySelector("#main-minisite-item-gallery").classList.remove("before-scroll");
      }, 4 * timer);

    }
    console.log("scroll triggered");
  });

  document.dispatchEvent(new CustomEvent('scroll'));
});



// Contact submit handler
function submit(){
  // Remove form validation feedback in case it's there from a previous submit
  $('#contact-name').find('.contact-feedback').addClass('hidden');
  $('#contact-company').find('.contact-feedback').addClass('hidden');
  $('#contact-mail').find('.contact-feedback').addClass('hidden');
  $('#contact-message').find('.contact-feedback').addClass('hidden');

  // Read values from input / textarea fields
  let data = {
    contactname: $('#contact-name').find('input').val(),
    contactcompany: $('#contact-company').find('input').val(),
    contactdate: new Date(),
    contactmail: $('#contact-mail').find('input').val(),
    contactmessage: $('#contact-message').find('textarea').val()
  }

  // Form verification
  let valid = true;
  if (!data.contactname){
    $('#contact-name').find('.contact-feedback').removeClass('hidden');
    valid = false;
  }
  if (!data.contactcompany){
    $('#contact-company').find('.contact-feedback').removeClass('hidden');
    valid = false;
  }
  if (!data.contactmail){
    $('#contact-mail').find('.contact-feedback').removeClass('hidden');
    valid = false;
  } else if(!checkMail(data.contactmail)){
    $('#contact-mail').find('.contact-feedback').removeClass('hidden');
    valid = false;
  }        
  if (!data.contactmessage){
    $('#contact-message').find('.contact-feedback').removeClass('hidden');
    valid = false;
  }
  if(!valid){
    return
  }

  disableFields();
  

  fetch('/contact/submit/', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(data)
  })
  .then(res => res.text())
  .then(response => {
    $('#contact-form').addClass('hidden');
    $('#submit-success').removeClass('d-none');
    $('#submit-success').text(response);
    $('#submit-failure').addClass('d-none');
    $('#submit-response').removeClass('hidden');
    enableFields();
    setTimeout(() => {
    $('#contact-form').removeClass('hidden');
      $('#submit-response').addClass('hidden');
    }, 5000);
  })
  .catch((error) => {
    $('#contactform').addClass('hidden');
    $('#submit-success').addClass('d-none');
    $('#submit-failure').removeClass('d-none');
    $('#submit-response').removeClass('hidden');
  });
};

// Disables input fields while submitting
function disableFields(){
  $('#contact-name').find('input').prop('disabled', true);
  $('#contact-company').find('input').prop('disabled', true);
  $('#contact-mail').find('input').prop('disabled', true);
  $('#contact-message').find('textarea').prop('disabled', true); 
};

// Enables input fields after submitting
function enableFields(){
  $('#contact-name').find('input').prop('disabled', false);
  $('#contact-company').find('input').prop('disabled', false);
  $('#contact-mail').find('input').prop('disabled', false);
  $('#contact-message').find('textarea').prop('disabled', false); 
};

// Validates the format of the entered e-mail address
function checkMail(email){
  return String(email)
    .toLowerCase()
    .match(
      /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
    );
};

// Switch between contact form and server response view for styling and testing purposes
let status = 0;
function switchView(){
  if(status == 0){
    $('#contact-form').addClass('hidden');
    $('#submit-response').removeClass('hidden'); 
    status = 1;
    console.log("Switch to response. Status:", status);
    return
  }
  if(status == 1){
    $('#contact-form').removeClass('hidden');
    $('#submit-response').addClass('hidden'); 
    status = 0;
    console.log("Switch to contact. Status:", status);
    return
  }
};
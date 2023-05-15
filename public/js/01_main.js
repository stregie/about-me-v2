// Contact

$(document).ready(function(){
  $('#contact-submit').click(submit);
  $('#contact-switch').click(switchView);
});

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
  
  // Disable fields while submitting
  $('#contact-name').find('input').attr('disabled', 'disabled');
  $('#contact-company').find('input').attr('disabled', 'disabled');
  $('#contact-mail').find('input').attr('disabled', 'disabled');
  $('#contact-message').find('textarea').attr('disabled', 'disabled');

  fetch('/contact/submit/', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(data)
  })
  .then(res => res.text())
  .then(response => {
    console.log("success");
    $('#contact-form').addClass('hidden');
    $('#submit-success').removeClass('d-none');
    $('#submit-success').text(response);
    $('#submit-failure').addClass('d-none');
    $('#submit-response').removeClass('hidden');
    setTimeout(() => {
    $('#contact-form').removeClass('hidden');
      $('#submit-response').addClass('hidden');
    }, 5000);
  })
  .catch((error) => {
    console.log('error');
    $('#contactform').addClass('hidden');
    $('#submit-success').addClass('d-none');
    $('#submit-failure').removeClass('d-none');
    $('#submit-response').removeClass('hidden');
  });
};

function checkMail(email){
  return String(email)
    .toLowerCase()
    .match(
      /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
    );
};

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
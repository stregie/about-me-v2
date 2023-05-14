$(document).ready(function(){
  $('#contactsubmit').click(submit);
  // $('#contactswitch').click(switchView);
});

function submit(){
  $('#contactname').find('.input-feedback').addClass('d-none');
  $('#contactcompany').find('.input-feedback').addClass('d-none');
  $('#contactmail').find('.input-feedback').addClass('d-none');
  $('#contactmessage').find('.input-feedback').addClass('d-none');

  let data = {
    contactname: $('#contactname').find('input').val(),
    contactcompany: $('#contactcompany').find('input').val(),
    contactdate: new Date(),
    contactmail: $('#contactmail').find('input').val(),
    contactmessage: $('#contactmessage').find('textarea').val()
  }

  // form verification
  var valid = true;
  if (!data.contactname){
    $('#contactname').find('.input-feedback').text('Please enter your name');
    $('#contactname').find('.input-feedback').removeClass('d-none');
    valid = false;
  }
  if (!data.contactcompany){
    $('#contactcompany').find('.input-feedback').text('Please enter the name of your company');
    $('#contactcompany').find('.input-feedback').removeClass('d-none');
    valid = false;
  }
  if (!data.contactmail){
    $('#contactmail').find('.input-feedback').text('Please enter your e-mail address');
    $('#contactmail').find('.input-feedback').removeClass('d-none');
    valid = false;
  } else if(!checkMail(data.contactmail)){
    $('#contactmail').find('.input-feedback').text('Please enter a valid e-mail address');
    $('#contactmail').find('.input-feedback').removeClass('d-none');
    valid = false;
  }        
  if (!data.contactmessage){
    $('#contactmessage').find('.input-feedback').text('Please enter your message');
    $('#contactmessage').find('.input-feedback').removeClass('d-none');
    valid = false;
  }
  if(!valid){
    return
  }

  $('#contactname').find('input').attr('disabled', 'disabled');
  $('#contactcompany').find('input').attr('disabled', 'disabled');
  $('#contactmail').find('input').attr('disabled', 'disabled');
  $('#contactmessage').find('textarea').attr('disabled', 'disabled');

  fetch('/contact/submit/', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(data)
  })
  .then(res => res.text())
  .then(response => {
    $('#contactform').addClass('d-none');
    $('#submit-response').find('h2').text(response);
    $('#submit-response').removeClass('d-none');          
    setTimeout(() => $(location).attr('href','/contact/'), 3000);
  })
  .catch((error) => {
    $('#contactform').addClass('d-none');
    $('#submit-response').find('h2').text(error);
    $('#submit-response').removeClass('d-none');
  });
};

function checkMail(email){
  return String(email)
    .toLowerCase()
    .match(
      /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
    );
};

// var status = 0;
// function switchView(){
//   if(status == 0){
//     $('#contactform').addClass('d-none');
//     $('#submit-response').removeClass('d-none'); 
//     status = 1;
//     console.log("Switch to response. Status:", status);
//     return
//   }
//   if(status == 1){
//     $('#contactform').removeClass('d-none');
//     $('#submit-response').addClass('d-none'); 
//     status = 0;
//     console.log("Switch to contact. Status:", status);
//     return
//   }
// };
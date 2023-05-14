$(document).ready(function(){
  $('#edit-draft-button').click(() => {
    $('#editor-list-drafts').removeClass('d-none');
    $('#editor-list-published').addClass('d-none');
    $('#editor-list-welcome').addClass('d-none');
  });

  $('#edit-published-button').click(() => {
    $('#editor-list-drafts').addClass('d-none');
    $('#editor-list-published').removeClass('d-none');
    $('#editor-list-welcome').addClass('d-none');
  });
});
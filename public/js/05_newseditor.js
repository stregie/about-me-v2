$(document).ready(function(){        
  $("#article-fields").sortable({
    update: function(event, ui){
      $(ui.item).find('textarea').focus();  // to keep the repositioned field focused
    }
  });
  $('#metadata-summary').autoResize();
  $('textarea').keydown();
});

// To add a blank heading, paragraph, image etc to the article
function addField(fieldtype){
  let $articleFields = $('#article-fields');
  let $template = $('#' + fieldtype + '-template');
  let $newField = $template.clone();
  $newField.find('.drag-indicator-icon').mouseup(function(){
    $(this).css('cursor', 'grab');
  });
  $newField.find('.drag-indicator-icon').mousedown(function(){
    $(this).css('cursor', 'grabbing');
  });
  $newField.find('.delete-icon').click(function(){
    $(this).closest('.article-input-group').remove();
  });
  $newField.find('.edit').click(function(){
    $(this).parent().children().first().children().focus();
    // console.log("click");
    // $(this).closest('.article-input-group').remove();
  });
  $newField.removeAttr("id");

  if (fieldtype === "image"){
    $newField.find('.refresh-btn').click(function(){
      let imgpath = $(this).closest('div.input-group').find('.image-input').val();
      $(this).closest('div.article-input-group').find('img').attr('src', imgpath);
    });
  }
  $newField.appendTo($articleFields);

  $('#article-fields .article-input-group:last-child').find('textarea').autoResize();
  $('textarea').keydown();
};

function loadArticle(data){
  $('#metadata-id').val(data.metadata.id);
  $('#metadata-author').val(data.metadata.author);
  $('#metadata-summary').text(data.metadata.summary);
  $('#metadata-thumbnail').val(data.metadata.thumbnail);
  data.article.forEach((item, index) => {
    addField(item.element);
    if(item.element === "image"){
      $('#article-fields .article-input-group:last-child').find('input').val(item.content);
      $('#article-fields .article-input-group:last-child').find('.refresh-btn').click();    
    } else {
      $('#article-fields .article-input-group:last-child').find('textarea').text(item.content);
    }
  });
  setTimeout(() => {$('textarea').keydown()}, 0.1);
};

function readContents(){
  let data = {
    metadata: {
      title: $('#article-fields').find('h2').find('textarea').val(),
      date: new Date(),
      id: $('#metadata-id').val(),
      author: $('#metadata-author').val(),
      summary: $('#metadata-summary').val(),
      thumbnail: $('#metadata-thumbnail').val()
    },
    article: [],
    comments: []
  };
  
  let fields = $('#article-fields').find('.article-input-group');
  for (let i = 0; i < fields.length; i++){
    data.article[i] = {element: $(fields[i]).attr('element')};          
    if(data.article[i].element === "image"){
      data.article[i].content = $(fields[i]).find('input').val();          
    } else {
      data.article[i].content = $(fields[i]).find('textarea').val();
    }
  }

  return data;
};

function decide(action, collection){
  let id = $('#metadata-id').val();
  if (!id){
    alert("This article doesn't have an ID!");
    return
  }
  let geturl = '/news/editor/checkid/?id=' + id + '&db=' + collection;

  fetch(geturl)
  .then(res => res.json())
  .then(exist => {
    if(exist === true && action === "save"){
      submit("update", "news-drafts");
    }
    if(exist === false && action === "save"){
      submit("insert", "news-drafts");
    }
    if(exist === true && action === "publish"){
      submit("update", "news-articles");
    }
    if(exist === false && action === "publish"){
      submit("insert", "news-articles");
    }
    if(exist === true && action === "delete"){
      console.log("decide delete", collection);
      submit("delete", collection);
    }
    if(exist === false && action === "delete"){
      $('#delete-question').addClass('d-none');
      $('#general-response').removeClass('d-none');
      $('#general-response-message').text("There is no article with this ID.");    
    }
  })
  .catch((error) => {
   alert(error);
  })
}

function submit(action, collection){
  if (action === "insert"){
    var url = '/news/editor/insert/?db=' + collection;
    var data = readContents();
  }
  if (action === "update"){
    var url = '/news/editor/update?db=' + collection;
    var data = readContents();
  }
  if (action === "delete"){
    var url = '/news/editor/delete?db=' + collection;
    var data = {
      id: $('#metadata-id').val()
    };
  }
  fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(data)
  })
  .then(res => res.text())
  .then(response => {
    alert(response);
    $(location).attr('href','/news/editor/');
  })
  .catch((error) => {
   alert(error);
  })
};

function deleteCheck(){
  $('#delete-question').addClass('d-none');
  $('#general-response').addClass('d-none');
  
  let id = $('#metadata-id').val();
  if (db === "none"){
    alert("This is article is not yet saved and cannot be deleted.");
    return
  }
  if (!id){
    alert("This article doesn't have an ID!");
    return
  }
  let geturl = '/news/editor/checkid/?id=' + id + '&db=' + db;
  fetch(geturl)
  .then(res => res.json())
  .then(response => {
    if(response === true){
      $('#delete-question').removeClass('d-none');
    }
    if(response === false){
      $('#general-response').removeClass('d-none');
      $('#general-response-message').text("There is no article with this ID.");
    }
  });
}

function deleteNo(){
  $('#delete-question').addClass('d-none');
};

function generateId(date, title){
  let YYYY = date.getFullYear();
  let MM = (date.getMonth() + 1).toString().padStart(2,0);
  let DD = date.getDate().toString().padStart(2,0); // padStart converts "5" to "05" but only works on strings    
  let hh = date.getHours().toString().padStart(2,0);
  let mm = date.getMinutes().toString().padStart(2,0);
  let ss = date.getSeconds().toString().padStart(2,0);

  let cleantitle = title.replace(/[^a-zA-Z0-9 ]/g, '').toLowerCase(); // removes all remaining special character and converts to lowercase
  let arr = cleantitle.split(' '); // creates array where each element is one word
  let id = YYYY + MM + DD
  
  for (let i = 0; i < arr.length && i < 5; i++){
    id += "-" + arr[i];
  };

  return id;
};

function generateIdforForm(){
  let date = new Date();
  let title = $('#article-fields').find('h2').find('textarea').val();
  let id = generateId(date, title);
  $('#metadata-id').val(id); 
};
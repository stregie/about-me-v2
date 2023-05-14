$(document).ready(function(){
  $('#fileuploader-dropzone label').on('dragover', dragoverHandler);
  $('#fileuploader-dropzone label').on('dragenter', dragenterHandler);
  $('#fileuploader-dropzone label').on('dragleave', dragleaveHandler);
  $('#fileuploader-dropzone label').on('drop', dropHandler);
  $('#fileuploader-dropzone input').on('change', displaySelectedFiles);
  $('#submit-button').click(uploadFiles);
  displaySelectedFiles();
  displayFilesOnServer();
  setInterval(displayFilesOnServer, 2000);
});

function dragoverHandler(event){
  event.preventDefault();
};

function dragenterHandler(event){
  $('#fileuploader-dropzone').css("background-color", "var(--color-bg-3");
};

function dragleaveHandler(event){
  $('#fileuploader-dropzone').css("background-color", "var(--color-bg-1");
};

function dropHandler(event){
  event.preventDefault();
  $('#fileuploader-dropzone').css("background-color", "var(--color-bg-1");
  let droppedFiles = event.originalEvent.dataTransfer.files;
  $('#fileuploader-dropzone input').prop('files', droppedFiles);
  displaySelectedFiles();
};

function displaySelectedFiles(){
  let selectedFiles = $('#fileuploader-dropzone input').prop('files');
  if (selectedFiles.length === 0){
    return;
  }
  
  let totalSize = 0;
  for (let i = 0; i < selectedFiles.length; i++){
    totalSize += selectedFiles[i].size;
  }        
  if (totalSize > 4 * 2 ** 20){
    alert("Upload size exceeds the 4 MB limit!");
  }

  let $selectedFiles = "";
  for (let i = 0; i < selectedFiles.length - 1; i++){
    $selectedFiles += "<li>" + selectedFiles[i].name + " (" + displaySize(selectedFiles[i].size) + ")</li>\r\n";
  }
  $selectedFiles += "<li>" + selectedFiles[selectedFiles.length - 1].name + " (" + displaySize(selectedFiles[selectedFiles.length - 1].size) + ")</li>";
  $('#selected-files').html($selectedFiles);
};

function displaySize(bytes){
  if (bytes < 2 ** 10){
    return bytes + " B";
  }
  if (2 ** 10 <= bytes && bytes < 2 ** 20){
    return Math.floor(bytes / 2 ** 10) + " KB";
  }
  if (2 ** 20 <= bytes && bytes < 2 ** 30){
    return Math.floor(bytes / 2 ** 20) + " MB";   
  }
  if (2 ** 30 <= bytes && bytes < 2 ** 40){
    return Math.floor(bytes / 2 ** 30) + " GB";
  }
};

function uploadFiles(){
  let selectedFiles = $('#fileuploader-dropzone input').prop('files');
  if (selectedFiles.length === 0){
    alert("Please select the files to upload.")
    return;
  }

  let totalSize = 0;
  for (let i = 0; i < selectedFiles.length; i++){
    totalSize += selectedFiles[i].size;
  }
  
  if (totalSize > 4 * 2 ** 20){
    alert("Upload size exceeds the 4 MB limit! You cannot upload the files.");
    return;
  }

  let data = new FormData();
  for (let i = 0; i < selectedFiles.length; i++){
    data.append('file', document.querySelector('#fileuploader-dropzone input').files[i]);
  }

  let request = new XMLHttpRequest();
  request.open('PUT', '/fileuploader/file'); 

  request.upload.addEventListener('progress', function(e) {
    let percent_completed = Math.floor((e.loaded / e.total) * 100);
    $('#fileuploader-dropzone label').text(percent_completed + "% completed");
    $('#progress-display').css("height", percent_completed + "%");
  });

  request.addEventListener('load', function(e) {
    console.log(request.status);
    console.log(request.response);
    $('#fileuploader-dropzone label').text(request.response);
    $('#progress-display').css("height", 0 + "%");
    displayFilesOnServer();          
  });

  request.send(data);
};

function deleteFile(filename) {
  fetch(`/fileuploader/file?name=${filename}`, {
    method: 'DELETE'
  })
  .then(response => response.text())
  .then(res => {
    console.log(res);
  });
};

function displayFilesOnServer(){
  let $tableContents = "";
  fetch('/fileuploader/filelist')
  .then(response => response.json())
  .then(files => {
    files.forEach((file, index) => {
      $tableContents += '<tr> "\r\n"';
      $tableContents += '  <th scope = "row">' + (index + 1)  + '</th> "\r\n"';
      $tableContents += '  <td>' + file.Name + '</td> "\r\n"';
      $tableContents += '  <td>' + displaySize(file.Size) + '</td> "\r\n"';
      $tableContents += '  <td><a href = "/fileuploader/file?name=' + file.Name + '">Link</a></td> "\r\n"';
      $tableContents += `  <td><button class = "btn" onclick = "deleteFile('${file.Name}')"><span class = "material-symbols-outlined">delete</span>
</button></td> "\r\n"`;
      $tableContents += '</tr> "\r\n"';
    });
    $('#filelist-table tbody').html($tableContents);
  });
};
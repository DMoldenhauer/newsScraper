

// When you click the  scrape new articles button
$(document).on("click", ".scrape-new", function (event) {
  event.preventDefault()
  $.ajax({
    method: "GET",
    url: "/scrape",
    success: function(){
      console.log("ajax scrape ran");
      location.reload()
    }
  })
  .catch(function(err){
    console.log(err)
  })
});

//when you click on the save article button
$(document).on("click", ".saveButton", function (event) {
  event.preventDefault()
  console.log ("save article button event handler ran");
  var articleID = $(this).data("id");
  // console.log (this);
  console.log (articleID);
  $.ajax({
    method: "PUT",
    url: "/articles/" + articleID,
    isSaved: true,
    success: function(){
      console.log("ajax PUT  ran");
      location.reload()
    }
  })
  .catch(function(err){
    console.log(err)
  })
});

//when you click on the save note button
$(document).on("click", ".saveNote", function (event) {
  event.preventDefault()
  console.log ("save note button event handler ran");
  var articleID = $(this).data("id");
  console.log (this.id);
  console.log (articleID);
  $.ajax({
    method: "POST",
    url: "/notes/" + articleID,
    
    success: function(){
      console.log("ajax PUT  ran");
      location.reload()
    }
  })
  .catch(function(err){
    console.log(err)
  })
});

//when you click on the delete button
$(document).on("click", ".deleteArticle", function (event) {
  event.preventDefault()
  console.log ("Delete article button event handler ran");
  var articleID = $(this).data("id");
  // console.log (this);
  console.log (articleID);
  $.ajax({
    method: "DELETE",
    url: "/articles/" + articleID,
    success: function(){
      console.log("ajax DELETE  ran");
      location.reload()
    }
  })
  .catch(function(err){
    console.log(err)
  })
});








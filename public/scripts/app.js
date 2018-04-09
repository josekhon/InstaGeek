// Creates article cards which have their own modal pop up when clicked

function createArticleElement(article) {
  let user = article.user;
  let title = article.title;
  let url = article.articleUrl;
  let image = article.imageUrl;
  let des = article.description;
  let numLikes = article.likes;
  let averageRating = article.avgRating;
  let isRated = article.userRating;
  let isLiked = article.liked ? 'liked' : '';

  const articleHTML =

    `<div class = "col-sm">
  <div class="card" style="width: 28rem;">
  <a href="${url}"><img class="card-img-top" src="${image}"> </a>
  <div class="card-body">
    <h3>${title}</h3>
    <p class="card-text">${des}</p>
  </div>
  <footer class = "card-footer">
  <button data-toggle="modal" data-target="#articleModal_${article.id}" class="commentModal" data-article="${article.id}">Comment</button>
  <div class="icons">
      <i class="fas fa-heart" data-id="${article.id}" data-liked="${isLiked}" data-likes="${numLikes}"></i>
       <span class="numberLikes">${numLikes}</span>
    <div class="rating" data-id="${article.id}" data-user="${isRated}">
        <span data-rating="5">☆</span><span data-rating="4">☆</span><span data-rating="3"> ☆</span><span data-rating="2">☆</span><span data-rating="1">☆</span>
    <p>Average: ${round(averageRating)}</p>
 </div>
  <p>By: ${user}</p>
  </div>
 </footer>
</div>
<section class = "modal" id="articleModal_${article.id}"  tabindex="-1" role="dialog" aria-labelledby="articleModal_${article.id}" aria-hidden="true">
   <div class="row modal-body article-modal-1">
    <div class="col-sm">
    <a href="${url}"><img class="modal-image" src="${image}"> </a>
    </div>
    <div class="col-sm">
     <h2 class = "modal-title">${title}</h2>
     <p class="modal-description">${des}</p>
     <section class="new-comment">
      <h2>Comments</h2>
      <hr>
      <form id="commentSubmit" data-comment="${article.id}">
        <textarea  id="commentText" name="text" placeholder="What do you think?"></textarea>
        <input type="submit" value="comment">
      </form>
    </section>
    <div class ="comments-container">
    </div>
     </div>
   </div>
</section>
`
  return articleHTML;
}

// Renders articles depending on how many articles in the row
// appends a new row when 4 articles reached
// appends articles to the article container

function renderArticles(articles) {
  var row = "";
  for (var i = 0; i < articles.length; i++) {
    if (i % 4 === 0) {
      row = $("<div/>").addClass("row");
    }
    row.append(createArticleElement(articles[i]));
    if (i % 4 === 3) {
      $(".article-container").append(row);
    }
  }
  if (articles.length % 4 !== 0) {
    $(".article-container").append(row)
  }

  addClickHandlersForComments();
}

// Creates comment card for comments
function createCommentElement(comment) {
  let name = comment.user;
  let commentBody = comment.comment_text;
  const commentHTML =
    `
  <div class = "posted-comment">
      <span class ="posted-by-comment">${name}:   </span><span class = "posted-comment-body">${commentBody}</span>
      <hr>
 </div>
  `
  return commentHTML
}

// Function that appends comments to the comment container
function renderComments(comments) {
  comments.forEach(function (comment) {
    $(".comments-container").prepend(createCommentElement(comment));
  });
}

function addClickHandlersForComments() {
  $(".commentModal").on("click", function (event) {
    event.preventDefault();
    let article = $(this);
    let articleID = article.data("article");
    $(".comments-container").empty();
    $.ajax({
      type: "GET",
      url: `/resource/${articleID}/comments`,
      success: function (comments) {
        renderComments(comments);
      }

    });
  });
}

function round(number) {
  return Math.round(number * 100) / 100;
}



jQuery(document).ready(function ($) {
  tab = $('.tabs h3 a');

  // Tabbing between login/signup form
  tab.on('click', function (event) {
    event.preventDefault();
    tab.removeClass('active');
    $(this).addClass('active');
    tab_content = $(this).attr('href');
    $('div[id$="tab-content"]').removeClass('active');
    $(tab_content).addClass('active');
  });


  $("form#new-article-modal").on("submit", function (event) {
    event.preventDefault();
    $.ajax({
      type: "POST",
      data: $(this).serialize(),
      url: `/resource/create`,
      success: function (data) {
        location.reload();
      }
    });
  });

  $("body").on("submit", "#commentSubmit", function (event) {
    event.preventDefault();
    let articleID = $(this).data("comment");


    $.ajax({
      url: `/resource/${articleID}/comment`,
      type: "POST",
      data: { comment: $(this).find("#commentText").val() },
      success: function () {
        $(".comments-container").empty();

        $.ajax({
          url: `resource/${articleID}/comments`,
          type: "GET",
          success: function (data) {
            renderComments(data);
            $("#commentSubmit").trigger("reset");
          }
        });
      }
      , error: function (err) {
        console.log(err);
      }
    })
  });

  $("#main-search").on("submit", function (event) {

    event.preventDefault();
    let search = event.target.searchfield.value;
    $.ajax({
      type: "GET",
      url: `/search`,
      data: $("#main-search").serialize(),
      success: function (articles) {
        $("#board-heading").text("Results");
        $(".article-container").empty();
        renderArticles(articles);
      }
    });
  });



  // Event listener on click for drop down subjects

  $(".dropdown-item").on("click", function (event) {
    event.preventDefault();
    let subject = $(this);
    let subjectID = subject.attr("data-subjects");

    $.ajax({
      type: "GET",
      url: `/subject/${subjectID}`,
      success: function (articles) {
        $("#board-heading").text(subjectID);
        $(".article-container").empty();
        renderArticles(articles);
        // renderComments(comments);
      }
    });
  });

  $("#dropdown-all").on("click", function (event) {
    event.preventDefault();

    $.ajax({
      type: "GET",
      url: `/all`,
      success: function (articles) {
        $("#board-heading").text("Main Board");
        $(".article-container").empty();
        renderArticles(articles);
        // we can add click handlers
        // addClickHandlersToCards()

      }
    });
  });


  $("body").on("click", ".rating span", function (event) {
    let star= $(this);
    let isRated = star.data("user");
    let rating = star.data("rating");
   let articleID = star.closest(".rating").data("id");
    $.ajax({
      type: "POST",
      url: `/resource/${articleID}/rating`,
      data: {rating:rating},
      success: data => {
       if(!isRated) {
        star.css("color", "yellow");
      } else if(isRated) {
        star.css("color", "gray");
      }
     }
    });

  });


  $("body").on("click", ".fa-heart", function (event) {
    event.preventDefault();
    let heart  = $(this);
    let articleID = heart.data("id");
    let isLiked = heart.data("liked");
    let likes = heart.data("likes");

    $.ajax({
      type: "POST",
      url: `/resource/${articleID}/like`,
      success: data => {
      if(!isLiked) {
        heart.addClass("liked")
        heart.closest(".fa-heart").find(".numberLikes").html(function(i, val) { return Number(val) +1; } );
      } else if(isLiked) {
        heart.removeClass("liked");

         heart.closest(".icons").find(".numberLikes").html(function(i, val) { return Number(val) -1 ; } );
      }

      }

    });
  });

  // Returns articles created by user or liked by user

  $("#my-board").on("click", function (event) {
    event.preventDefault();

    $.ajax({
      type: "GET",
      url: `/myresources`,
      success: function (articles) {
        $("#board-heading").text("My board");
        $(".article-container").empty();
        renderArticles(articles);
      }
    });
  });


  // On click of navbar search button. Return results on same page


  $("#logout-button").on("click", function (event) {
    event.preventDefault();


    $.ajax({
      type: "POST",
      url: `/logout`,
      success: function () {
        // redirect to / where login is
      }
    });
  });




});






$( window ).load(function() {
  $(document).ajaxStart(function() {
            $("#loading").show()
            }).ajaxStop(function() {
               $("#loading").hide()
            });
  if(localStorage.getItem("jwt")!=undefined){
  	let email = localStorage.getItem("name");
    let token = localStorage.getItem("jwt");

    $.post("http://localhost:3000/api/user_favourite/", {
          email: email,
          token:token
        },
        function(data, status) {
          console.log(status)
          console.log(data) //GET RESPONSE DATA
          console.log(data.success) // WANT TO GET data["success"]
          if(data.success){
            $("#main_body").empty()
            console.log(data.results)
            let html = ""
            data.results.map((fav)=>{
              html += "<div class='fav_list row justify-content-md-center'><div class='col-md-6' style='text-align:center'><span id='favid' style='display:none'>"+fav.id+"</span><figure><img src='"+fav.imageurl+"' width='350' height='234' /><figcaption>"+fav.content+"</figcaption></figure></div><div class='col-md-6 align-middle' style='text-align:center;'><button class='btn btn-danger' onClick='del_fav(this)'>Delete</button></div><hr /></div>"
            })
            //document.querySelector("#main_body").insertAdjacentHTML('afterend','<div class="container" id="favlist"></div>')
            document.querySelector("#main_body").insertAdjacentHTML( 'beforeend', html);
          }
              })
  }else{
  	alert("please login to use this function!")
  }
});

const del_fav = (e) => {
  let favid = $(e).parent("div").prev().children("span").html()
  let token = localStorage.getItem("jwt");

  $.post("http://localhost:3000/api/del_favourite", {
        fav_id: favid,
        token:token
      },
      function(data, status) {
        console.log(status)
        console.log(data) //GET RESPONSE DATA
        console.log(data.success) // WANT TO GET data["success"]
        if(data.success){
            alert("deleted!")
            $(e).parent("div").parent("div").remove()
          }

      })
}
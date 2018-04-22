$(".fav").click((e)=>{
	console.log(localStorage.getItem("logged"))
	if(localStorage.getItem("logged")){
		let email = localStorage.getItem("name");
		let token = localStorage.getItem("jwt");
		let content = $(e.target).parent("div").prev().children().html()
		let url = $(e.target).parent("div").prev().prev()[0].src



		// $.ajaxSetup({
  //   		headers: {
  //   	'x-access-token': token
  //   		}
		// });
		// $.get("http://localhost:3000/api/",(data)=>{
		// 	console.log(data)
		// })


		$.post("http://localhost:3000/api/favourite/", {
				email: email,
				url: url,
				content : content,
				token:token
			},
			function(data, status) {
				console.log(status)
				console.log(data) //GET RESPONSE DATA
				console.log(data.success) // WANT TO GET data["success"]
				if(data.success){
					alert("add to favourite!")
					$(e.target).html("Added")
				}
				$(document).ajaxStart(function() {
					console.log("hi");
					}).ajaxStop(function() {
						console.log("end");
					});
			})

	}
})
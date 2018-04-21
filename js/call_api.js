$( window ).load(function() {
  if(localStorage.getItem("jwt")!=undefined){
  	$("#loginout").prop( "data-toggle", null );
  	$("#loginout").prop( "data-target", null );
  	$("#loginout").html('<span class="glyphicon glyphicon-log-out"></span>'+"Logout");
  	$("#profile").html('<span class="glyphicon glyphicon-user"></span>'+localStorage.getItem("name"))
  	$("#loginout").click(function() {
        localStorage.removeItem("jwt");
		localStorage.removeItem("name");
		localStorage.removeItem("logged")
		location.reload()
    });
  }else{
  	$("#loginout").prop( "data-toggle", "modal" );
  	$("#loginout").prop( "data-target", "#login-modal");
  }
});




const postmsg = () =>{
	let name = $("#name").val();
	let email = $("#email").val();
	let msg = $("#msg").val();

	$.post("http://localhost:3000/api/post_message/", {
			email: email,
			name: name,
			message : msg,
		},
		function(data, status) {
			console.log(data) //GET RESPONSE DATA
			console.log(data.status) // WANT TO GET data["status"]
			alert(data.status == "OK"?"Sucessfully!":"ERROR!")
			$(document).ajaxStart(function() {
				console.log("hi");
				}).ajaxStop(function() {
					console.log("end");
				});
		})
}

const create_user = () =>{
	let name = $("#create_name").val()
	let pw = $("#create_pw").val()
	let email = $("#create_email").val()

	$.post("http://localhost:3000/api/create_user/", {
		username:name,
		email:email,
		password:pw
	},
		function(data, status) {
			console.log(data) //GET RESPONSE DATA
			console.log(data.success) // WANT TO GET data["status"]
			alert(data.success?data.message:"Error!")
			location.reload();
		})
}


const login = () =>{
	let name = $("#login_username").val()
	let pw = $("#login_pass").val()
	let form_data = (name.includes('@'))? {
		email:name,
		password:pw
	}:{
		username:name,
		password:pw
	}
	console.log(form_data)
	$.post("http://localhost:3000/api/authenticate/", form_data,
		function(data, status) {
			console.log(data) //GET RESPONSE DATA
			console.log(data.success) // WANT TO GET data["status"]
			if(data.success){
				localStorage.setItem("jwt", data.token);
				localStorage.setItem("name",data.email);
				localStorage.setItem("logged",true)
				alert("Login Successful!")
				location.reload();
			}else{
				alert(data.success)
			}
			$(document).ajaxStart(function() {
				console.log("hi");
				}).ajaxStop(function() {
					console.log("end");
				});
		})

}
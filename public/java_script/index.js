const inputs = document.querySelectorAll(".input");
const login_btn=document.querySelector('.btn');
const newacc=document.querySelector('.input-div.pass2');


function addcl(){
	let parent = this.parentNode.parentNode;
	parent.classList.add("focus");
}

function remcl(){
	let parent = this.parentNode.parentNode;
	if(this.value == ""){
		parent.classList.remove("focus");
	}
}


inputs.forEach(input => {
	input.addEventListener("focus", addcl);
	input.addEventListener("blur", remcl);
});

function new_acc(){
	newacc.style.display="revert";
	document.querySelector('#para').innerText="SIGN UP";
	document.querySelector('#create').style.display="none";
	document.querySelector('#forgot').style.display="none";
}
if(newacc.style.display!="none"){
	login_btn.addEventListener("click",()=>{
		const pass=document.querySelector('#cred1').value;
		const pass2=document.querySelector('#cred2').value;
		if(pass!=pass2){
		window.alert("passwords doesnt match!!");
		
	}
	})
}

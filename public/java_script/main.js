const inputs = document.querySelectorAll(".input");
const login_btn=document.querySelector('.btn');
const newacc=document.querySelector('.input-div.pass2');
const actn=document.querySelector('.hamburger');
const minSlider = document.getElementById('funding-goal-min');
const maxSlider = document.getElementById('funding-goal-max');
const minValue = document.getElementById('funding-goal-min-value');
const maxValue = document.getElementById('funding-goal-max-value');

function addcl(){
	let parent = this.parentNode.parentNode;
	parent.classList.add("focus");
}
function togglePasswordVisibility() {
	// event.preventDefault();
	const passwordInput = document.getElementById('cred1');
	const passwordToggleBtn = document.getElementById('eye');

	if (passwordInput.type === 'password') {
        passwordInput.type = 'text';
        passwordToggleBtn.innerHTML = '<i class="fas fa-eye-slash"></i>';

      } else {
        passwordInput.type = 'password';
        passwordToggleBtn.innerHTML = '<i class="fas fa-eye"></i>';
      }
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
})

actn.addEventListener('click', function() {
	this.classList.toggle('open');
	const dv=document.getElementById("exp_menu");
	const dvl=document.getElementById("exp_list");
	dv.style.display="inline";
	dvl.style.display="flex";
	dv.classList.toggle("exp_menu2");
	dvl.classList.toggle("list_style");
	dvl.classList.add("list_style:hover");
  });
  
  minSlider.addEventListener('input', updateValues);
  maxSlider.addEventListener('input', updateValues);
  function updateValues() {
	const min = parseInt(minSlider.value);
		const max = parseInt(maxSlider.value);
		if (min > max) {
		  maxSlider.value = min;
		}
		minValue.textContent = minSlider.value;
		maxValue.textContent = maxSlider.value;
  }
const btnMenu = document.querySelector('#btn-menu');
const menu = document.querySelector('#menu');
function animNav(){
	let navbar = document.getElementById('main-navbar');
	let wrapper = document.getElementById('wrapper-menu');
	if(navbar.className) {
		wrapper.style.display = 'none';
		return navbar.removeAttribute('class');
	}
	wrapper.style.display = 'block';
	return navbar.className += "show-navbar";
}
$('.submenu').click(function(){$(this).children('.children').slideToggle();});
$('.bt-close').click(function () {animNav();});
btnMenu.addEventListener('click', function () {animNav();});
document.querySelector('.open-close').addEventListener('click', ()=>{animNav();});
document.getElementById('wrapper-menu').addEventListener('click', ()=>{animNav();});

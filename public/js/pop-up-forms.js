const button = document.querySelector('#Openform');
const poup = document.querySelector('.content-form-subject');
const closed = document.querySelector('.popup-close-window');

/* const buutonact = document.getElementsByClassName('btn-edit'); */
const poupact = document.querySelector('.content-form-subject-actul');
const closedact = document.querySelector('.popup-close-window-act');

closed.addEventListener('click', () => {
    poup.style.display = 'none';
});
button.addEventListener('click', () => {
    poup.style.display = 'block';
});
poup.addEventListener('click', e => {
    // console.log(e);
    if (e.target.className === 'content-form-subject') {
        poup.style.display = 'none';
    }
});

closedact.addEventListener('click', () => {
    poupact.style.display = 'none';
});
function Mostrarventana(){
    poupact.style.display = 'block';
}
/* buutonact.addEventListener('click', () => {
    poupact.style.display = 'block';
}); */
/* Al ser datos dinamicos la ventana modal con queryselector solo funciona si es para tabla estatico de resto se invoca por medio de una funcion */
poupact.addEventListener('click', e => {
    // console.log(e);
    if (e.target.className === 'content-form-subject-actul') {
        poupact.style.display = 'none';
    }
});

$(document).ready(main);

var contador = 1;

function main(){
   
    $('.submenu').click(function(){
        $(this).children('.children').slideToggle();
    });
}
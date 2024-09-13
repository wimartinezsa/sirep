window.onload = function(){
    var fecha = new Date();
    var mes = fecha.getMonth()+1; 
    var dia = fecha.getDate();
    var anio = fecha.getFullYear();
    if(dia<10)
        dia='0'+dia;
    if(mes<10)
        mes='0'+mes
        document.getElementById("date").innerHTML = dia + "/" + mes + "/" + anio;
}
/* ========LISTA LOS DETALLES */
/* ================================= */
Listar_Reservas_Pendientes();
function Listar_Reservas_Pendientes(){
    fetch('/Listar_Reservas_Pendientes',{
        method:'get',
        headers: {
            'Authorization': 'Bearer '+token
        }
    })
    .then(res=>res.json())
    .then(data=>{
        if(data.status == 401) return data;
        document.getElementById('tipo_res').value=data[0].tipo;
        document.getElementById('ficha').value=data[0].ficha;
        document.getElementById('id_movimiento').value=data[0].Id_movimiento;
        document.getElementById('ident').value=data[0].identificacion;
        
        var tabla='';
        var total=0;
        data.forEach(data => {
            if(data.id_detalle!=null){
            tabla +='<tr class=" table-striped"><td>'+data.aprendiz+'</td>';
            tabla +='<td class="centerNombre">'+data.Nombre+'</td>';
            tabla +='<td class="centerNombre">'+data.cantidad+'</td>';
            tabla +='<td class="centerNombre">'+data.subtotal+'</td>';
            tabla +='<td class="centerNombre"><a class="icon-bin" href=javascript:eliminarDetalle('+data.id_detalle+')></a></td>';
            tabla +='</td>';

            total=total+data.subtotal;
        }
        });
        document.getElementById('tabla-detalles').innerHTML=tabla;
        document.getElementById('tot').innerHTML=total;
    });
}
var myModal = new bootstrap.Modal(document.getElementById('myModal'), {
    keyboard: false});
/* ========FUNCION ABRIR============= */
function Abrir_Frm_Reserva(nombre,id, precio){
    document.getElementById('name').innerHTML=nombre;
    document.getElementById('cod_prod').value=id;
    document.getElementById('precio_pdto').value = precio;
    document.getElementById('total').innerHTML= '$ '+ precio;

    let ficha=  document.getElementById('ficha').value;
    var datos = new URLSearchParams();// que hace este codigo ??
    datos.append('cod_prod',id);// que hace este codigo ??

    Listar_Reservas_Pendientes();// se lista las reserva pendiente
    let tipo_reserva= document.getElementById('tipo_res').value;
    if(tipo_reserva=='Grupal'){
        listarUsuaiosFicha(ficha); // se listan aprendices de la ficha
    } else {
        document.getElementById('persona-reserva').setAttribute('style', 'display:none')
    }

    myModal.show();
}

function Aumentar(){
    let Precio = document.getElementById('precio_pdto').value;
    let espacio = parseInt(document.getElementById('cantidad').innerHTML);
    let suma = espacio + 1;
    if(suma <= 9){
        document.getElementById('cantidad').innerHTML = suma;
        let unidad = (Precio*suma);
        let Subtotal = unidad;
        document.getElementById('total').innerHTML = "$ " + Subtotal;
    }
}
function Disminuir(){
    let Precio = document.getElementById('precio_pdto').value;
    let espacio = parseInt(document.getElementById('cantidad').innerHTML);
    let resta = espacio - 1;
    if(resta >= 1){
        document.getElementById('cantidad').innerHTML = resta;
        let unidad = (Precio*resta);
        let Subtotal = unidad;
        document.getElementById('total').innerHTML ="$ " + Subtotal;
    }
}

function Buscar_Producto(name,id){
    var datos = new URLSearchParams();
    datos.append('Codigo',name);

    fetch('/Buscar_Producto',{
        method:'post',
        body: datos,
        headers: {
            'Authorization': 'Bearer '+token
        }
    })
    .then(res=>res.json())
    .then(data=>{
        data.forEach(pdto => {            
        document.getElementById('name').value=pdto.Nombre;
    });
    Abrir_Frm_Reserva(name, id);
    });
}
/* ===================registro reserva=============== */
function RegistrarDetalle(){
    /* ======================= */
    let cantidad = document.getElementById('cantidad').innerHTML;
    let id_producto = document.getElementById('cod_prod').value;
    let id_movimiento = document.getElementById('id_movimiento').value;

    let tipo_res = document.getElementById('tipo_res').value;
    
    /* ======================= */
    var datos = new URLSearchParams();

    datos.append('cantidad', cantidad);
    datos.append('id_producto', id_producto);
    datos.append('id_movimiento', id_movimiento);
 
    if(tipo_res=='Grupal') {
       let persona = document.getElementById('persona-reserva').value;
       datos.append('persona', persona);
    }
    else {
        let persona = document.getElementById('ident').value;
        datos.append('persona', persona);
    }

    fetch('/Registrar_Detalle',{
        method:'post',
        body: datos,
        headers: {
            'Authorization': 'Bearer '+token
        }
    }).then(res=>res.json())
    .then(data=>{
        Swal.fire({
            title: data.titulo,
            icon: data.icon,
            text:data.text,
            timer: 1500
        })
        Listar_Reservas_Pendientes();
    })
    let cantistock = document.getElementById('cantidad').innerHTML = 1;
    myModal.hide();
    Listar_Reservas_Pendientes();

} 







//=============LISTAR APRENDICES POR ID FICHA========================//
function listarUsuaiosFicha(idFicha){
    let listarPersonas = document.getElementById('persona-reserva')
    var datos = new URLSearchParams();
    datos.append('idFicha', idFicha);
    fetch('/Listar_Usuaios_Ficha',{
        method:'post',
        body: datos,
        headers: {
            'Authorization': 'Bearer '+token
        }
    }).then(res => res.json())
    .then(data => {
        let row = '';
        data.forEach(e => {
            row += '<option value="'+e.identificacion+'">';
            row += +e.identificacion + ' | ' + e.Nombres;
            row += '</option>';
        }); 
       
        listarPersonas.innerHTML = row;   
    })
}

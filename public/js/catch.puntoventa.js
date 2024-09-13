window.onload = ListaPuntoVenta();
function RegistrarPuntoventa() {
    let formulario = document.getElementById('formregistro');
    let nombre = document.getElementById('nombrepunvnt').value;
    let sede = document.getElementById('sedepuntventa').value;
    let direccion = document.getElementById('direccionpunvnt').value;
    let estado = document.getElementById('estadopuntventa').value;
    let encargado = document.getElementById('personapuntventa').value;
    var datos= new URLSearchParams();
    datos.append('Nombre',nombre);
    datos.append('Sede',sede);
    datos.append('Estado',estado);
    datos.append('Direccion',direccion);
    datos.append('Persona',encargado);
    fetch('/Registrar_PuntoVenta',{
        method:'post',
        body:datos,
        headers: {
            'Authorization': 'Bearer '+ token,
        }
    }
    ).then(res=>res.json())
    .then(data=>{
        if(data.status == 401) return console.log('No autorizado')
        Swal.fire({
            title: data.titulo,
            icon: data.icono,
            text: data.mensaje,
            timer : data.timer
    })
    formulario.reset();
    ListaPuntoVenta();

});

};
/* ========================================================================== */
function ListaPuntoVenta(){
    let tabla = document.getElementById('tbody_date');
    tabla.innerHTML = '';
    fetch('/Lista_Punto_Venta',{
        method:'get',
        headers: {'Authorization': 'Bearer '+ token,}
    })
    .then(res=>res.json())
    .then(data=>{
        if(data.status == 401) return console.log(data)
        renderTablePV(data)
    });
};
ListarEncargadoPV();
function ListarEncargadoPV(){
    let select = document.getElementById('personapuntventaactul');
    let select2 = document.getElementById('personapuntventa');
    fetch('/ListarEncargadoPV',{
        method:'get',
        headers: {
            'Authorization': 'Bearer '+ token,
        }
    }).then(res => res.json())
    .then(res => {
        if(res.status == 401) return console.log(res)
        let option = '<option selected disabled >Seleccionar...</option>';
        res.forEach(element => {
            option += `<option value = "${element.identificacion}">${element.Nombres}</option>`
        });
        select.innerHTML = option;
        select2.innerHTML = option;
    })
}
/* ========================================================================== */
function Mostrarventana(ident){
    poupact.style.display = 'block';
    var datos = new URLSearchParams();
    datos.append('Identificacion',ident);
    fetch('/Buscar_punvnt',{
        method:'post',
        body : datos,
        headers: {
            'Authorization': 'Bearer '+ token,
        }
    }
    ).then(res=>res.json())
    .then(data=>{
        if(data.status == 401) return console.log(data)
        data.forEach(Pventa => {
        document.getElementById('id_vent').value=Pventa.Id_punto_vent;
        document.getElementById('nombrepunvntactul').value=Pventa.Nombre;
        document.getElementById('sedepuntventaactul').value=Pventa.Sede;
        document.getElementById('direccionpunvntactul').value=Pventa.Direccion;
        document.getElementById('estadopuntventaActul').value=Pventa.Estado;
        document.getElementById('personapuntventaactul').value=Pventa.fk_persona;
        });
    });
};


/* ========================================================================== */
function Actualizar(){
    let identificadoractul = document.getElementById('id_vent').value;
    let nombrepunvntactul = document.getElementById('nombrepunvntactul').value;
    let sedepuntventaactul= document.getElementById('sedepuntventaactul').value;
    let direccionpunvntactul = document.getElementById('direccionpunvntactul').value;
    let estadopuntvntActul = document.getElementById('estadopuntventaActul').value;
    let personapuntventaactul = document.getElementById('personapuntventaactul').value;
    var datos = new URLSearchParams();
    datos.append('Identificacion',identificadoractul);
    datos.append('Nombre',nombrepunvntactul);
    datos.append('Sede',sedepuntventaactul);
    datos.append('Direccion',direccionpunvntactul);
    datos.append('Estado',estadopuntvntActul);
    datos.append('PersonaEncargada',personapuntventaactul);
    fetch('/Actualizar_punvnt',{   
        method:'post',
        body : datos, 
        headers: {
            'Authorization': 'Bearer '+ token,
        }
    }
    ).then(res=>res.json())
    .then(data=>{
        if(data.status == 401) return console.log(data)
        Swal.fire({
            title: data.titulo,
            icon: data.icono,
            text: data.mensaje,
            timer : data.timer
        });
        ListaPuntoVenta();
    });
} 
/* ========================================================================== */
function renderTablePV(datos){
    let lista = [];
    datos.forEach(element => {
        console.log(element)
      let array = {
        "id_pnto": element.Id_punto_vent,
        "Nombre": element.Nombre,
        "Direccion": element.dirPunto,
        "Sede" : element.Sede,
        "Estado": element.EstadoPVent,
        "Encargado": element.Nombres,
        "btn": `<a class="btn btn-edit" onclick="Mostrarventana(`+element.Id_punto_vent+`);">Editar</a>`,
      }
      lista.push(array)
    });
    $('#table-pv').DataTable({
        lengthChange: false,
        autoWidth: false,
        destroy: true,
        responsive: true,
        data: lista,
        columns: [
            {"data": "id_pnto"},
            {"data": "Nombre"},
            {"data": "Direccion"},
            {"data": "Sede"},
            {"data": "Estado"},
            {"data": "Encargado"},
            {"data": "btn"}
        ]
    })
}



var modalAsignarProducto = new bootstrap.Modal(document.getElementById('modalAsignarProducto'), {keyboard: false});
var modalMostrarDistribucion = new bootstrap.Modal(document.getElementById('modalMostrarDistribucion'), {keyboard: false});
var modalProduccion = new bootstrap.Modal(document.getElementById('modalProduccion'), {keyboard: false});



listarProduccionesConfirmadasAdmin();


function listarProduccionesConfirmadasAdmin(){

    fetch('/listarProduccionesConfirmadasAdmin',{
        method:'get',
        headers: {'Authorization': 'Bearer '+ token}
    })
    .then(res=>res.json())
    .then(data=>{
        if(data.status == 401) return console.log(data);
        let array = [];
        let i = 0;
        data.forEach(element => {
            i++;
            let distribuido = 0;
            if(element.Distribuido) distribuido = element.Distribuido;
            if(distribuido > 0){
                distribuido = `<a href="javascript:Listar_Distribucion(${element.Id_produccion});">${distribuido}</a>`;
            }
            let json = {
                'no': element.Id_produccion,
                'up' : element.nomb_up,
                'producto': element.producto,
                'producido': element.Producido,
                'observacion': element.observacion,
                'fecha': formatDate(element.fecha),
                'accion': `<button class="btn btn-primary"
                onclick="modalEditarProduccion(${element.Id_produccion})">Editar</button>`,
            }
            array.push(json);
        });
        $('#tablaProducccion').DataTable({
            "paging":true,
            "autoWidth": false,
            "processing":true,
            "responsive":true,
            "destroy":true,
            "data":array,
            dom: 'Bfrtip',
            columns:[
                {"data": 'no'},
                {"data": "up"},
                {"data": "producto"},
                {"data": "producido"},
                {"data": "observacion"},
                {"data": "fecha"},
                {"data": "accion"},
            ]
        });
    });
}


function limpiarFormulario(){
    document.getElementById('pdto').value='';
    document.getElementById('cantidad').value='';
    document.getElementById('fecha').value='';
    document.getElementById('observacion').value='';
}



function modalEditarProduccion(idProduccion){
   
    consultarProductosUp();    
    
  
    fetch(`/buscarProduccion/${idProduccion}`,
        {   method:'get',
            headers: {
                'Authorization': 'Bearer '+ token,
            }
        }
        ).then(res=>res.json())
        .then(data=>{
           
            if(data.status == 401) return console.log(data)
            data.forEach(producto => {

                document.getElementById('id-produccion').value=producto.id_produccion;
                document.getElementById('pdto').value=producto.fk_codigo_pdto;
                document.getElementById('cantidad').value=producto.Cantidad;
                document.getElementById('fecha').value=producto.fecha;
                document.getElementById('observacion').value=producto.observacion;
            });
            modalProduccion.show();
        });

}


//Muestra los productos de la unidad productiva que inicio sesion();
function consultarProductosUp (){

    fetch('/consultarTodosProductos',
    {   method:'get',
        headers: {
            'Authorization': 'Bearer '+ token,
        }
    }
    ).then(res=>res.json())
    .then(data=>{
        if(data.status == 401) return console.log(data)
        data.forEach(producto => {
            let name = value=producto.nameup;
           // document.getElementById('nameup').innerHTML = name;
        });
        let html = '';
        for(let i =0; i<data.length; i++){
            html += `<option value="${data[i].Codigo_pdto}" class="visible">${data[i].Namepdto} ${data[i].Descpdto}</option>`;
        }
        document.getElementById('pdto').innerHTML = html;
    });
} 





function Listar_Distribucion(id_produccion){
    modalMostrarDistribucion.show()
    var datos = new URLSearchParams();
    datos.append('id_produccion', id_produccion);
    fetch('/Listar_Distribucion',{   
        method:'post',
        body:datos,
        headers: {
            'Authorization': 'Bearer '+ token,
        }
    }).then(res=>res.json())
    .then(datos=>{
        if(datos.status == 401) return console.log(datos);
        $('#table-distribuciones').DataTable({
            destroy: true,
            paging: false,
            searching: false,
            autoWidth: false,
            info: false,
            data: datos,
            columns:[
                {"data":"Nombrepunt"},
                {"data":"cantidadbodega"},
                {"data":"fechabodega"}
            ]
        })
        console.log(datos)
    });

}

function ModalAsignarProducto(){
    Listar_Punto_Venta();
    Lista_Productos();
    modalAsignarProducto.show();
}

function Listar_Punto_Venta(){
    fetch('/Lista_Punto_Venta',{   
        method:'GET',
        headers: {
            'Authorization': 'Bearer '+ token,
        }
    }).then(res=>res.json())
    .then(data=>{
        var pvSelect = document.getElementById('select-punto-venta');
        let options = '';
        data.forEach(element => {
            options += `<option value="${element.Id_punto_vent}">${element.Nombre}</option>`
        });
        pvSelect.innerHTML = options;
    });

}


function Lista_Productos() {
    fetch('/Listar_Productos', {
        method: 'get',
        headers: {'Authorization': 'Bearer ' + token,}
    }).then(res => res.json())
    .then(data => {
        if (data.status == 401) return console.log('No autorizado');
        var productoSelect = document.getElementById('select-producto');
        let options = '';
        data.forEach(element => {
            options += `<option value="${element.Codigo_pdto}">${element.Nombre_pdto}</option>`
        });
        productoSelect.innerHTML = options;
    });
}



function AsignarProdutoPuntoVenta(){
    let id_producto = document.getElementById('select-producto').value;
    let id_punto_venta = document.getElementById('select-punto-venta').value;
    var datos= new URLSearchParams();
    datos.append('id_producto', id_producto);
    datos.append('id_punto_venta', id_punto_venta);       
    fetch('/Registrar_inventario',{
        method:'post',
        body:datos,
        headers: {'Authorization': 'Bearer '+ token}
    }).then(res=>res.json())
    .then(data=>{
        if(data.status == 401) return console.log(data);
        if(data.status == 'success'){
            launchAlert({icon: 'success', message: data.message});
            modalAsignarProducto.hide()
        } else {
            launchAlert({icon: 'error', message: data.message});
        }
    });
}


//===============Editar producción de la UP ===============
function editarProduccion() {
    var fecha=document.getElementById('fecha').value;
    var cant=document.getElementById('cantidad').value;
    var obser=document.getElementById('observacion').value;
    var fkpdto = document.getElementById('pdto').value;
    let idProduccion=document.getElementById('id-produccion').value;
    if(cant == 0){alert('Por favor ingrese una cantidad')}
    else{
        var datos= new URLSearchParams();
        datos.append('Fecha',fecha);
        datos.append('Cantidad',cant);
        datos.append('Observacion',obser);
        datos.append('fkp',fkpdto);
        datos.append('idProduccion',idProduccion);
    
    fetch('/editarProduccion',{
        method:'post',
        body: datos,
        headers: {'Authorization': 'Bearer '+ token}
    }
    ).then(res=>res.json())
    .then(data=>{
        if(data.status == 401) return console.log(data);
        listarProduccionesConfirmadasAdmin();
        limpiarFormulario();
        modalProduccion.hide();
        

        Swal.fire({
            title: data.titulo,
            icon: data.icono,
            text: data.mensaje,
            showConfirmButton: false,
            timer: 1000
        })
       

    });
   


}
}



function limpiarFormulario(){
    document.getElementById('pdto').value='';
    document.getElementById('cantidad').value='';
    document.getElementById('fecha').value='';
    document.getElementById('observacion').value='';
}



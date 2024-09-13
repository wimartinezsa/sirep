
var modalMostrarDistribucion = new bootstrap.Modal(document.getElementById('modalMostrarDistribucion'), {keyboard: false});
var modalDistribucion = new bootstrap.Modal(document.getElementById('modalDistribucion'), {keyboard: false});
var modalAdminProduccion = new bootstrap.Modal(document.getElementById('modalAdminProduccion'), {keyboard: false});




Listar_Produccion_Por_Confirmar();
Listar_Produccion_Por_Distribuir();



function Listar_Produccion_Por_Distribuir(){

    fetch('/Listar_Produccion_Por_Distribuir',{
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
                'distribuido': distribuido,
                'disponible': element.Disponible,
                'observacion': element.observacion,
                'fecha': formatDate(element.fecha),
                'accion': `<button class="btn btn-primary"  onclick="ModalDistribucion('${element.Id_produccion}','${element.producto}', '${element.Codigo_pdto}')">Distribuir</button>`
            }
            array.push(json);
        });
        $('#tablaProducccionDistribuir').DataTable({
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
                {"data": "distribuido"},
                {"data": "disponible"},
                {"data": "observacion"},
                {"data": "fecha"},
                {"data": "accion"},
            ]
        });
    });
}


function Listar_Produccion_Por_Confirmar(){
   
  
    fetch('/Listar_Produccion_Por_Confirmar',{
        method:'get',
        headers: {'Authorization': 'Bearer '+ token}
    })
    .then(res=>res.json())
    .then(data=>{
        
        if(data.status == 401) return console.log(data);
        let array = [];
        let i = 0;
        data.forEach(element => {
  
            let json = {
                'no': element.Id_produccion,
                'up' : element.nomb_up,
                'producto': element.producto,
                'medidas': element.medidas,
                'producido': element.Producido,
                'observacion': element.observacion,
                'fecha': formatDate(element.fecha),
                'accion': `<button class="btn btn-primary"  onclick="ConfirmarProduccion('${element.Id_produccion}')">Confirmar</button>
                           <button class="btn btn-danger"  onclick="RechazarProduccion('${element.Id_produccion}')">Rechazar</button>
                ` 
               
            }
            array.push(json);
        });
        $('#tablaProducccionPendiente').DataTable({
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
                {"data": "medidas"},
                {"data": "producido"},
                {"data": "observacion"},
                {"data": "fecha"},
                {"data": "accion"},
            ]
        });
    });
}


function actualizarProduccion(){


    Swal.fire({
        title: '¿Seguro que desea confirmar y finalizar la producción?',
        showDenyButton: true,
        showCancelButton: false,
        confirmButtonText: 'Confirmar',
        denyButtonText: `Cancelar`,
    }).then((result) => {
     
        if (result.isConfirmed) {

            let idProduccion= document.getElementById('id-produccion').value;
          
            var datos= new URLSearchParams();
            datos.append('ValorUnitario',document.getElementById('ValorUnitario').value);
            datos.append('ValorTotal',document.getElementById('ValorTotal').value);
            datos.append('observacion',document.getElementById('observacion').value);
        
            fetch(`ConfirmarProduccion/${idProduccion}`,{
                method:'post',
                body: datos,
                headers: {'Authorization': 'Bearer '+ token}
            })
            .then(res=>res.json())
            .then(data=>{
                if(data.status == 'error') return launchAlert({icon: 'error', message: data.message});
                Listar_Produccion_Por_Confirmar();
                Listar_Produccion_Por_Distribuir();
                Swal.fire({
                    icon: 'success',
                    title: 'Producción Confirmada',
                    showConfirmButton: false,
                    timer: 1000
                })
            });


        } 
    })



    


}

function ConfirmarProduccion(idProduccion){
    buscarProduccion(idProduccion);
    modalAdminProduccion.show();

}


//============== Buscar información del producto ===========
function buscarProduccion(idProduccion){
  
    consultarTodosProductos();
    limpiarFormulario();        
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

        });
       
}


// Calcular el valor Total de la producción 
function calcularValorTotal(){
   
document.getElementById('ValorTotal').value= document.getElementById('ValorUnitario').value * document.getElementById('cantidad').value; 

}



function limpiarFormulario(){
    document.getElementById('pdto').value='';
    document.getElementById('cantidad').value='';
    document.getElementById('fecha').value='';
    document.getElementById('ValorUnitario').value=0;
    document.getElementById('ValorTotal').value=0;
    document.getElementById('observacion').value='';
}




//Muestra los productos de la unidad productiva que inicio sesion();
function consultarTodosProductos (){

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
        });
        let html = '';
        for(let i =0; i<data.length; i++){
            html += `<option value="${data[i].Codigo_pdto}" class="visible">${data[i].Namepdto} ${data[i].Descpdto}</option>`;
        }
        document.getElementById('pdto').innerHTML = html;
    });
} 




//Muestra los productos de la unidad productiva que inicio sesion();
function consultarProductosUp (){

    fetch('/consultarProductosUp',
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
            document.getElementById('nameup').innerHTML = name;
        });
        let html = '';
        for(let i =0; i<data.length; i++){
            html += `<option value="${data[i].Codigo_pdto}" class="visible">${data[i].Namepdto} ${data[i].Descpdto}</option>`;
        }
        document.getElementById('pdto').innerHTML = html;
    });
} 


function RechazarProduccion(idProduccion){
    Swal.fire({
        title: '¿Seguro que desea rechazar la producción?',
        showDenyButton: true,
        showCancelButton: false,
        confirmButtonText: 'Confirmar',
        denyButtonText: `Cancelar`,
    }).then((result) => {
        /* Read more about isConfirmed, isDenied below */
        if (result.isConfirmed) {
            fetch(`RechazarProduccion/${idProduccion}`,{
                method:'get',
                headers: {'Authorization': 'Bearer '+ token}
            })
            .then(res=>res.json())
            .then(data=>{
                if(data.status == 'error') return launchAlert({icon: 'error', message: data.message});
                Listar_Produccion_Por_Confirmar();
                Swal.fire({
                    icon: 'success',
                    title: 'Producción Rechazada',
                    showConfirmButton: false,
                    timer: 1000
                })
            });
        } 
    })
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


function ModalDistribucion(id_produccion, producto, id_pdto) {
    document.getElementById('id-produccion').value = id_produccion;
    document.getElementById('producto-distribucion').value = producto;
    document.getElementById('id-producto').value = id_pdto;
    document.getElementById('cantidad-distribuir').value = '';
    Listar_Punto_Venta_Producto(id_pdto);
    modalDistribucion.show();
}




function Listar_Punto_Venta_Producto(id_pdto){
    let datos = new URLSearchParams;
    datos.append('producto', id_pdto)
    fetch('/Listar_Punto_Venta_Producto',{
        method:'post',
        body: datos,
        headers: {'Authorization': 'Bearer '+ token}
    }).then(res=>res.json())
    .then(data => {
        var pvSelect = document.getElementById('punto-venta');
        let options = '';
        data.forEach(element => {
            options += `<option value="${element.Id_punto_vent}">${element.Nombre}</option>`
        });
        pvSelect.innerHTML = options;
    })
}


function Distribuir(){
    let punto_venta = document.getElementById('punto-venta').value;
    let id_produccion = document.getElementById('id-produccion').value;
    let cantidad = document.getElementById('cantidad-distribuir').value;
    if(cantidad <= 0) return launchAlert({icon: 'error', message: 'Digita una cantidad válida'});
    //-----------------------------
    let datos = new URLSearchParams;
    datos.append('cantidad',cantidad)
    datos.append('punto_venta', punto_venta)
    datos.append('id_produccion', id_produccion)
    fetch('/Asignar_Inventario',{
        method:'post',
        body: datos,
        headers: {'Authorization': 'Bearer '+ token}
    })
    .then(res=>res.json())
    .then(data=>{
        if(data.status == 'error') return launchAlert({icon: 'error', message: data.message});
        Listar_Produccion_Por_Distribuir();
        launchAlert({icon: 'success', message: data.message});
        modalDistribucion.hide();
    });
}



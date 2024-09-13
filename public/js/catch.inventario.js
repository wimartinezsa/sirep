window.onload = ListarInventario();
var myModal = new bootstrap.Modal(document.getElementById('myModal'), {
    keyboard: false
    });
var modalbodega = new bootstrap.Modal(document.getElementById('mysmodalbodega'), {
        keyboard: false
    });
/* =================================================== */
function RegistrarInventario() {
    let sotckinventario = 0;
    let productos = document.getElementById('fkproducto').value;
    let puntoventa= document.getElementById('fkpuntventa').value;
    
    var datos= new URLSearchParams();
    datos.append('stock',sotckinventario);
    datos.append('pdto',productos);
    datos.append('Pventa',puntoventa);
  
    fetch('/Registrar_inventario',{
        method:'post',
        body:datos,
        headers: {
            'Authorization': 'Bearer '+ token,
        }
    }).then(res=>res.json())
    .then(data=>{
        if(data.status == 401) return console.log(data)
        Swal.fire({
            title: data.titulo,
            icon: data.icono,
            text: data.mensaje,
            timer: 1500
        })
        ListarInventario();
    });
}
/* ==================================================== */
function ListarInventario(){
    fetch('/Lista_Inventario',{
        method:'get',
        headers: {
            'Authorization': 'Bearer '+ token,
        }
    })
    .then(res=>res.json())
    .then(data=>{
        if(data.status == 401) return console.log(data)
        let json = [];
        let array = {}
        data.forEach(element => {
            array = {
                "col-1": element.id_inventario,
                "col-2": element.nombrePunto,
                "col-3": element.nombrePdto,
                "col-4": element.stock,
                "col-5": `<a class='btn btn-edit' onclick='Mostrarventana("`+element.Codigo_pdto+`","`+element.id_inventario+`")';>Editar</a>`,
            }
            json.push(array);
        });
        $('#tabla-inventario').DataTable({
            "autoWidth": false,
            "info" : false,
            "destroy": true,
            data: json,
            columns : [
                {"data": "col-1"},
                {"data": "col-2"},
                {"data": "col-3"},
                {"data": "col-4"},
                {"data": "col-5"}
            ]
        })
    })
}
/* ========================================================================== */
function Mostrarinvt(idinvt){
    let idinventario = document.getElementById('id_invetario').value;
    var datos = new URLSearchParams();
    datos.append('idinve',idinventario);
    datos.append('idpunto',idinvt);
    fetch('/idpuntovent',{   
        method:'post',
        body:datos,
        headers: {
            'Authorization': 'Bearer '+ token,
        }
    }).then(res=>res.json())
    .then(data=>{
        if(data.status == 401) return console.log(data)
        data.forEach(invent => {
            document.getElementById('id_invetario').value=invent.id_inventario;
            document.getElementById('Productoact').value=invent.nombrepdto;
            document.getElementById('Puntoact').value=invent.nombrepuntv;
        });
    });
}
/* =================================================== */
function Mostrarpdto (idpdto){
    var datos = new URLSearchParams();
    datos.append('idptoinve',idpdto);
    fetch('/idpdto_inventario',
    {   method:'post',
        body:datos,
        headers: {
            'Authorization': 'Bearer '+ token,
        }
    }).then(res=>res.json())
    .then(data=>{
        if(data.status == 401) return console.log(data)
        data.forEach(invent => {
            document.getElementById('id_pdto_inventario').value=invent.Codigo_pdto;
            let name = value=invent.Nombre
            document.getElementById('idnombreproducto').innerHTML = name;
        });
    });
}
/*  */
/* ========================================================================== */
var form = document.getElementById('form-actual-invent');
function Mostrarventana(idpdto,idinv){
    form.reset();
    myModal.show();
    Mostrarinvt(idinv);
    Mostrarpdto(idpdto);
    Listarinventarioproduccio(idpdto);
};
/* =================================================== */

function Listarinventarioproduccio(idpdto){
    let datosinvproduccion = new URLSearchParams;
    datosinvproduccion.append("idptoibv",idpdto);
    fetch('/Lista_produccion',{
        method:'post',
        body:datosinvproduccion,
        headers: {
            'Authorization': 'Bearer '+ token,
        }
    }).then(res=>res.json())
    .then(datos=>{
        if(datos.status == 401) return console.log(datos)
        let array = [];
        datos.forEach(element => {
            let json = {
                "col-1": element.Id_produccion,
                "col-2": element.producto,
                "col-3": element.Producido,
                "col-4": element.Distribuido,
                "col-5": element.Disponible,
                "col-6": element.fecha,
                "col-7": "<button class='btn-distribucion' onclick='MostrarBodega("+element.Id_produccion+")';>Distribucion</button>"+
                " <button class='btn-use' onclick='UsarProduccion("+element.Id_produccion+")';>Asignar</button>",
            }
            array.push(json);
        });
        $('#tablaproduccion').DataTable({
            "paging":true,
            "processing":true,
            "responsive":true,
            "destroy":true,
            "data":array,
            dom: 'Bfrtip',
            columns:[
                {"data": "col-1"},
                {"data": "col-2"},
                {"data": "col-3"},
                {"data": "col-4"},
                {"data": "col-5"},
                {"data": "col-6"},
                {"data": "col-7"}
            ]
        })
    });
}
/* =================================================== */
function MostrarBodega(idproduccion){
    modalbodega.show();
    var datos = new URLSearchParams();
    datos.append('idproducci',idproduccion);
    fetch('/Lista_Bodega',
    {   method:'post',
        body:datos,
        headers: {
            'Authorization': 'Bearer '+ token,
        }
    }).then(res=>res.json())
    .then(datos=>{
        if(datos.status == 401) return console.log(datos)
        let json = [];
        let array = {}
            datos.forEach(element => {
                array = {
                    "col-1": element.id_bodega,
                    "col-2": element.Nombrepunt,
                    "col-3": element.cantidadbodega,
                    "col-4": element.fechabodega
                }
                json.push(array);
            });
        $('#tablabodega').DataTable({
            "paging":true,
            "processing":true,
            "responsive":true,
            "destroy":true,
            "data":json,
            dom: 'Bfrtip',
            columns:[
                {"data": "col-1"},
                {"data": "col-2"},
                {"data": "col-3"},
                {"data": "col-4"}
            ]
        })
    });
}
/* ========================================================================== */

function UsarProduccion(idproduc){
    modalbodega.hide();
    let datesproducci = new URLSearchParams();
    datesproducci.append('idproduccion',idproduc);
    fetch('/llamarproduccion',
    {   method:'post',
        body:datesproducci,
        headers: {
            'Authorization': 'Bearer '+ token,
        }
    }).then(res=>res.json())
    .then(data=>{
        if(data.status == 401) return console.log(data)
        data.forEach(produccion => {
            if(!produccion.id_produccion) produccion.id_produccion = produccion.Id_produccion;
            if(produccion.disponible == null) produccion.disponible = '';
            document.getElementById('Stockact').value=produccion.disponible;
            document.getElementById('produccionact').value=produccion.id_produccion;
        });
    });
};
/* =================================================================== */
function eliminarstock(){
    let stoc = document.getElementById('Stockact').value = ""
}
/* =================================================================== */
function Actualizarinventario(){
    let pdto = document.getElementById('id_pdto_inventario').value;
    let cantidadinvet = document.getElementById('Stockact').value;
    let numbinventario = document.getElementById('id_invetario').value;
    let numbproduccion = document.getElementById('produccionact').value;
    let tipooperacion = "ActualizarBodega";
    if(cantidadinvet == 0 && numbproduccion == 0){
        return alert("Seleccione la Produccion que desea Usar")
    }
    if(cantidadinvet == 0){
        return alert("Inserte la Cantidad que usara del Stock")
    }
    if(cantidadinvet > 0 && numbproduccion > 0){
        let datosinvent = new URLSearchParams();
        datosinvent.append('operacion',tipooperacion);
        datosinvent.append('cantidad',cantidadinvet);
        datosinvent.append('fk_produccion',numbproduccion);
        datosinvent.append('fk_inventario',numbinventario);
        fetch('/Actualizarinvent',{ 
            method:'post',
            body:datosinvent,
            headers: {
                'Authorization': 'Bearer '+ token,
            }
        }).then(res=>res.json())
        .then(data=>{
            if(data.status == 401) return console.log(data);
            Swal.fire({
                title: data.titulo,
                icon: data.icono,
                text: data.mensaje,
                timer: 1500
            });
            Listarinventarioproduccio(pdto);
            ListarInventario();
            eliminarstock();
        });
        
    }
    else{
        alert("Sucedio Un Error")
    }
    
}
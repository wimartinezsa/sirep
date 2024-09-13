window.onload = listarMovimientos;
var modalRechazarMovimiento = new bootstrap.Modal(document.getElementById('modalRechazarMovimiento'), { keyboard: false });
var modalPermisoAdmin = new bootstrap.Modal(document.getElementById('modalPermisoAdmin'), {keyboard: false});
var facturar = new bootstrap.Modal(document.getElementById('modalFacturar'), { keyboard: false });
var newVenta = new bootstrap.Modal(document.getElementById('modalNewVenta'), { keyboard: false });
var detalleModal = new bootstrap.Modal(document.getElementById('modalNewVenta'), { keyboard: false });
var modaleditar = new bootstrap.Modal(document.getElementById('modaleditar'), { keyboard:false});

function crearFields(){
    document.getElementById("id_movimiento").value = '';
    document.getElementById("inputPIdCliente").value = '';
    document.getElementById("nombre").value = '';
    var divBTN = document.getElementById('botones-accion-movimiento');
    divBTN.innerHTML = ``;
    renderTableCart([]);
}


function compranueva() {
    facturar;
    facturar.toggle();
}



function nuevaVenta() {
    let btn = document.getElementById('sbutton');
    btn.setAttribute('style', 'display: block;');
    crearFields();
    newVenta.toggle();
}

function RechazarMovimiento(id){
    document.getElementById('movimiento_rechazar').value = id;
    modalRechazarMovimiento.show();
}
function ConfirmarRechazoRes(){
    let descripcion = document.getElementById('rechazo_area');
    let id_movimiento = document.getElementById('movimiento_rechazar').value;
    if(!descripcion.value.trim()) return descripcion.focus();
    var datos = new URLSearchParams();
    datos.append("id_movimiento", id_movimiento);
    datos.append("descripcion", descripcion.value);
    fetch('/RechazarMovimiento', {
        method: 'POST',
        headers: {'Authorization': 'Bearer '+ token},
        body: datos
    }).then(res => res.json()).then(data => {
        if(data.status == 'error') return console.log(data);
        launchAlert({icon: 'success', message: 'Movimiento rechazado exitosamente'});
        listarMovimientos();
        modalRechazarMovimiento.hide();
    });
}
function listarMovimientos() {
    let estado = document.getElementById('filtro-estado').value;
    fetch('/listarMovimientos/'+estado, {
        method: 'get',
        headers: {'Authorization': 'Bearer '+ token}
    }).then(res => res.json()).then(data => {
        if(data.status == 401) return console.log(data)
        renderTableMovimientos(data);                
    });
}
function renderTableCart(info) {
    $("#tableCart").DataTable({
        destroy: true,
        autoWidth: false,
        searching: false,
        paging: false,
        bInfo: false,
        data: info,
        columns: [
            { data: "num" },
            { data: "persona" },
            { data: "nombre" },
            { data: "cantidad" },
            { data: "valor" },
            { data: "subtotal" },
            { data: "detalle" },
            { data: "fecha_entrega"},
            { data: "accion" },
        ],
    });
}
function renderTableMovimientos(datos){
    let lista = [];
    datos.forEach(element => {
        if(element.detalles > 0 && element.Estado == 'Facturado') btnAccion = `<a class='btn btn-primary' href= "javascript:mostrarDetalle('${element.Id_movimiento}','${element.personas}','${element.identificacion}');"><i class='icon-bookmark-outline'></i>Facturar</a>`;
        else btnAccion = "<a  href='javascript:RechazarMovimiento("+element.Id_movimiento+")' class='btn btn-danger'>Rechazar</a>"
        btnImprimir = "<a class='print' href='javascript:Facturar("+element.Id_movimiento+")'><i class='icon-file-pdf-o' style='display:none'></i></a>"
        if(element.Estado=='Facturado')btnImprimir = "<a class='print' href='javascript:Facturar("+element.Id_movimiento+")'><i class='icon-file-pdf-o' style='display:block'></i></a>"
        else btnImprimir = ''
        let array = {
            "IDCompra": element.Id_movimiento,
            "Identificacion" : element.identificacion,
            "Comprador": element.personas,
            "Fecha" : element.Fecha,
            "Valor": element.total,
            "Estado": element.Estado,
            "Imprimir": btnImprimir,
            "Accion": btnAccion,
        }
        lista.push(array)
    });
    $('#lista').DataTable({
        lengthChange: false,
        autoWidth: false,
        destroy: true,
        responsive: true,
        data: lista,
        columns: [
            {"data": "IDCompra"},
            {"data": "Identificacion"},
            {"data": "Comprador"},
            {"data": "Fecha"},
            {"data": "Valor"},
            {"data": "Estado"},
            {"data": "Imprimir"},
            {"data": "Accion"}
        ]
    })
}
/* ============================detalle de la venta=================================== */
function mostrarDetalle(Id_movimiento,personas,identificacion) {
    document.getElementById('id_movimiento').value = Id_movimiento;
    document.getElementById('nombre').value = personas;
    document.getElementById('inputPIdCliente').value = identificacion;
    listarDetalle(Id_movimiento, 'facturado');

    let btn = document.getElementById('sbutton');
    btn.setAttribute('style', 'display: none;');

    let btnProductos = document.getElementById('boton_agregar_productos');
    if(btnProductos) btnProductos.setAttribute('style', 'display:none');
    detalleModal.show();
}

function editarReserva(){
    modaleditar.toggle();
}
/* ===================modal editar============ */
async function modalEditar(id_detalle){
    var datos= new URLSearchParams();
    datos.append('idDetalle',id_detalle);
    modaleditar.show();
    await fetch('/obtenerDetalle',{
        method: 'post',
        body:datos,
        headers: {'Authorization': 'Bearer '+ token}
    }).then(res=>res.json())
    .then(data=>{
        if(data.status == 401) return console.log(data)
        console.log(data)
        let estado = document.getElementById('estado');
        let cantidad = document.getElementById('cantidad');

        cantidad.value = data.Estado;
        cantidad.value  = data.cantidad;
        document.getElementById('NombrePDT').value = data.nombre;
        document.getElementById('entregado').value = data.Entregado;
        document.getElementById('ID_detalle').value = data.id_detalle;
        document.getElementById('fecha_entrega').value = data.fecha_entrega;
        document.getElementById('estado').value = data.Estado;
        if(this.movimientoVenta.estado == 'Facturado'){
            if(data.Estado === 'Facturado') estado.disabled = true;
            else estado.disabled = false;
            cantidad.disabled = true;
        } else {
            estado.disabled = false;
            cantidad.disabled = false;
        }
    });
   
}
/* ===============Editar================== */
function EditarDetalle(){
   var idDetalle = document.getElementById('ID_detalle').value;
   var cantidad= document.getElementById('cantidad').value;
   var entregado = document.getElementById('entregado').value;
   var estado = document.getElementById('estado').value;
   var fecha_entrega = document.getElementById('fecha_entrega').value;
   
   /* =====url datos==================================0 */
    var datos= new URLSearchParams();
    datos.append('idDetalle',idDetalle);
    datos.append('cantidad',cantidad);
    datos.append('entregado',entregado);
    datos.append('estado',estado);
    datos.append('fecha_entrega', fecha_entrega)

    fetch("/editarDetalle",{
        method:'post',
        body : datos,
        headers: {'Authorization': 'Bearer '+ token}
    }).then(res=>res.json())
    .then(data=>{
        if(data.status == 401) return console.log(data)
        let id_movimiento = document.getElementById('id_movimiento').value;
        listarDetalle(id_movimiento, 'facturado')
    })
    modaleditar.toggle();
    alertaGlobal();
}

function alertF(){
    swealerFinalizarCompra()
}
function alertaDelete(){
    swealerestadoDeleteAFacrurar();
}
/* =====================aler cambiar estado delete a facturar======================== */
function swealerestadoDeleteAFacrurar(){
    Swal.fire({
        title: 'Seguro quieres Facturar?',
        showDenyButton: true,
        showCancelButton: false,
        confirmButtonText: 'Confirmar Factura',
        denyButtonText: `Cancelar Factura`,
    }).then((result) => {
        /* Read more about isConfirmed, isDenied below */
        if (result.isConfirmed) {
            Swal.fire({
                icon: 'success',
                title: 'Factura Confirmada',
                showConfirmButton: false,
                timer: 1000
            })
        } else if (result.isDenied) {
            Swal.fire({
                icon: 'info',
                title: 'Factura Celada',
                showConfirmButton: false,
                timer: 1000,
            })
        }
    })
}
/* =================alertas======== */
function alertaGlobal(){
    const Toast = Swal.mixin({
        toast: true,
        position: 'top-end',
        showCancelButton: false,
        timer: 3000
    })
    Toast.fire({
        icon: 'success',
        title: 'Actualizado con exito',
        showConfirmButton: false,
        timer: 2500
    })
}


function AnularMovimiento(id_movimiento) {
    var datos = new URLSearchParams();
    datos.append("Id_movimiento",id_movimiento)
    fetch('/AnularMovimiento', {
        method: 'post',
        body: datos,
        headers: {
            'Authorization': 'Bearer '+ token,
        }
    }).then(res => res.json())
    .then(()=>{
        detallesListados.forEach(element => {
            EstadoAnulado(element.id_detalle);
        });
        listarMovimientos();
        detalleModal.hide();
    });
}

function AnularDetalles(){
    document.getElementById('login_admin').value = '';
    document.getElementById('password_admin').value = '';
    modalPermisoAdmin.show()
}
function ImprimirFactura(){
    let message = '<p>';
    let total = 0;
    detallesListados.forEach(element => {
        if(element.EstadoVenta == 'Facturado'){
            total = total + element.VlrTotal;
            message += `${element.Nombre} : $ ${currency(element.VlrTotal)}<br>`
        }
    })
    message += '===============<br>'
    message += `Total : $ ${currency(total)}<br>`
    message += '</p>'
    Swal.fire({
        title: 'FACTURA',
        html: message,
        showDenyButton: true,
        showCancelButton: false,
        confirmButtonText: 'Imprimir',
        denyButtonText: `Cancelar`,
    }).then((result) => {
        /* Read more about isConfirmed, isDenied below */
        if (result.isConfirmed) {
            let Id_movimiento = document.getElementById('id_movimiento').value;
            Facturar(Id_movimiento)
            Swal.fire({
                icon: 'success',
                title: 'Compra finalizada',
                showConfirmButton: false,
                timer: 1000
            })
            newVenta.hide();
            detalleModal.hide();
        } 
    })
}


function validarAdmin(){
    let login = document.getElementById('login_admin').value;
    let password = document.getElementById('password_admin').value;

    var datos = new URLSearchParams();
    datos.append("login", login)
    datos.append("password", password);

    fetch('/validarAdmin', {
        method: 'post',
        body: datos,
        headers: {'Authorization': 'Bearer '+ token,}
    }).then(res => res.json())
    .then((data)=> {
        if(data.status == 401) return console.log(data)
        if(data.status == 200) {
            let movimiento = document.getElementById('id_movimiento').value;
            AnularMovimiento(movimiento);
            Swal.fire({
                icon: 'success',
                title: 'Movimiento anulado exitosamente',
                showConfirmButton: false,
                timer: 1000
            })
            newVenta.hide();
            detalleModal.hide();
            modalPermisoAdmin.hide();
            return;
        }
        if(data.status == 'error_auth') {
            return Swal.fire({
                icon: 'error',
                title: 'Usuario admin no autorizado',
                showConfirmButton: false,
                timer: 1000
            })
        }
    });
}


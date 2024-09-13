var detallesListados = [];
/* ======VARIABLE DE MANEJO DEL MOVIMIENTO======= */
var movimientoVenta = {
    id: null,
    estado: null
}
let comprador = document.getElementById('inputPIdCliente')

$(document).ready(function () {
    $("#modalNewVenta").on("hidden.bs.modal", function () {
        document.getElementById("inputPIdCliente").value = "";
        document.getElementById("nombre").value = "";
        document.getElementById("cargo-usuario").value = "";
        document.getElementById("id_movimiento").value = "";
    });
});

var facturar = new bootstrap.Modal(document.getElementById("modalFacturar"), { keyboard: false, });
function compranueva() { facturar.toggle(); }
var newVenta = new bootstrap.Modal(document.getElementById("modalNewVenta"), { keyboard: false, });
function nuevaVenta() { newVenta.toggle(); }
var detalle = new bootstrap.Modal(document.getElementById("modalDetalle"), { keyboard: false, });
var addProdList = new bootstrap.Modal(document.getElementById("modalAddProd"), { keyboard: false, });

function addProdVen() {
    //Tabla del modal donde agregaremos los productos a la venta
    cargo_usuario = document.getElementById('cargo-usuario').value;
    let datos = new URLSearchParams();
    datos.append("cargo", cargo_usuario);
    fetch("/listarProductosPv", {
        method: "POST",
        body: datos,
        headers: {'Authorization': 'Bearer ' + token}
    })
        .then((res) => res.json())
        .then((data) => {
            if (data.status == 401) return console.log(data);
            let json = [];
            data.forEach(producto => {
                let array = {
                    "codigoPdto": producto.id_inventario,
                    "nombrePdto": `${producto.Producto} - ${producto.descripcion}`,
                    "precioProd": '$' + producto.precio,
                    "stockProd": producto.stock,
                    "btn": `<a class='agregarButton' 
                    href='javascript:agregar(${producto.id_inventario});'>Agregar</a>`
                }
                json.push(array);
            });
            $('#tableAddProd').DataTable({
                "paging":true,
                "processing":true,
                "autoWidth": false,
                "responsive":true,
                "destroy":true,
                "data":json,
                dom: 'Bfrtip',
                columns:[
                    {"data": "codigoPdto"},
                    {"data": "nombrePdto"},
                    {"data": "precioProd"},
                    {"data": "stockProd"},
                    {"data": "btn"}
                ]
            })
        });

    addProdList;
    addProdList.toggle();
}
/* =============================Agregar producto========================================================= */
var productoAgregado = new bootstrap.Modal(
    document.getElementById("modalProductoAgregado"), { keyboard: false }
);



function agregar(cod_producto) {
    let fechaActual = new Date();
    fechaActual = fechaActual.toISOString().slice(0, 10);
    let imgProd = document.getElementById("img-prod");
    let spTotal = document.getElementById("sp-total");
    let spanNombrePdto = document.getElementById("nombre-producto");
    /* ================= */
    let cargo_usuario = parseInt(document.getElementById("cargo-usuario").value);
    document.getElementById('detalle-individual').value = 'Si'

    var datos = new URLSearchParams();
    datos.append("codigop", cod_producto);
    datos.append("cargo", cargo_usuario);
    fetch("/obtenerProductoPrecio", {
        method: "post",
        body: datos,
        headers: {'Authorization': 'Bearer ' + token}
    })
        .then((res) => res.json())
        .then((data) => {
            if (data.status == 401) return console.log(data)
            let medidaProducto = '';
            let precio = data[0].precio;
            // AQUI
            document.getElementById('id_inventario').value = data[0].id_inventario;
            document.getElementById('fecha-entrega-detalle').value = fechaActual;
            imgProd.setAttribute('src', 'img/products/' + data[0].imagen);
            if(data[0].medida) medidaProducto = ' X '+data[0].medida;
            // CONFIGURA LOS DATOS PARA LA VENTA INICIAL
            spTotal.innerHTML = currency(precio);
            document.getElementById('inputCant').value = 1;
            spanNombrePdto.innerHTML = (data[0].Producto + medidaProducto);
            if(data[0].porcentaje > 0) document.getElementById('div-descuento').innerHTML = `Descuento ${data[0].porcentaje} %`
            /*Auto multiplicacion de la cantidad de producto*/
            inputCant.addEventListener("change", sumar);
            inputCant.addEventListener("keyup", sumar);
            function sumar() {
                let cantVlr = precio;
                let cantProd = document.getElementById("inputCant").value;
                if (!cantProd) cantProd = 0;
                var descuento = (parseFloat(cantVlr) * (data[0].porcentaje/100)) * parseFloat(cantProd);
                var total = (parseFloat(cantVlr) * parseFloat(cantProd)) - descuento;
                document.getElementById("sp-total").innerHTML = currency(total);
                return total;
            }
        });
    productoAgregado.toggle();
}
/* ===================buscar clientes================== */
document.getElementById("inputPIdCliente")
    .addEventListener("keydown", function (e) {
        if (e.key === "Enter") {
            buscarUser();
        }
    });
function buscarUser() {
    var iden = document.getElementById("inputPIdCliente").value;
    var datos = new URLSearchParams();
    datos.append("iden", iden);
    fetch("/filtro", {
        method: "post",
        body: datos,
        headers: {'Authorization': 'Bearer ' + token}
    })
    .then((res) => res.json())
    .then((data) => {
        if (data.status == 401) return console.log(data);
        // AQUÍ LANZA EL MODAL PARA CREAR USUARIO============================
        if (data.length <= 0) {
            document.getElementById("nombre").value = "Usuario no registrado.";
            document.getElementById("cargo").value = "Cargo.";
            registroCliente();
        }

        /* ====VARIABLES===== */
        var identificacion = data[0].identificacion;
        var nombre = data[0].Nombres;
        var cargo_usuario = data[0].Cargo;
        var nombre_cargo = data[0].nombre_cargo;
        var estado = data[0].Estado;
        if(estado == 0) {
            document.getElementById("nombre").value = "Usuario no registrado.";
            return launchAlert({icon:'error', message: 'El usuario se encuentra inactivo'})
        }
        if (identificacion != iden) {
            document.getElementById("nombre").value = "Usuario no registrado.";
            document.getElementById("nombre").value = "Cargo";
            document.getElementById("genVenDiv").innerHTML =
            '<input type="button" class="btn btn-primary btndone" onclick="" value="Registrar Usuario?">';
            $("#tableAddProd").DataTable({
                bInfo: false,
                destroy: true,
            });
        } else if (identificacion == iden) {
            document.getElementById("nombre").value = nombre;
            document.getElementById("cargo_nombre").value = nombre_cargo;
            document.getElementById("cargo-usuario").value = cargo_usuario;
            document.getElementById('divBtnAdd').innerHTML = 
                '<input type="button" id="boton_agregar_productos" class="btn btn-primary btnadd" onclick="addProdVen();" value="Agregar Productos" />';
        }
        generarVenta(iden);
    })
    .catch((e) => console.log(e));
}
/* =========VENTA============ */
function eliminarProductoMovimiento(id) {
    var idenpPersona = document.getElementById('inputPIdCliente').value;
    var datos = new URLSearchParams();
    datos.append("idDetalle", id);
    fetch("/eliminarDetalle", {
        body: datos,
        method: "POST",
        headers: {'Authorization': 'Bearer ' + token,}
    }).then((res) => res.json())
    .then((res) => {
        if (res.status == 401) return console.log(res)
        if (res.status == 200) {
            generarVenta(idenpPersona);
        }
    });
}
/* ============================= */
function generarVenta(ident) {
    var datos = new URLSearchParams();
    datos.append("iden", ident);
    fetch("/genventa", {
        method: "post",
        body: datos,
        headers: {'Authorization': 'Bearer ' + token}
    }).then((res) => res.json())
    .then((data) => {
        if (data.status == 401) return res.json(data);
        document.getElementById('id_movimiento').value = data[0].Id_movimiento;
        listarDetalle(data[0].Id_movimiento);
        listarMovimientos();
    })
    .catch((e) => console.log(e));
}


$("#tableCart").DataTable({
    destroy: true,
    searching: false,
    paging: false,
    bInfo: false,
});
/* ==========================Cambiar de delete a Facturado==================0= */
/*===================== swealer alerta============================== */
function RealizarFactura() {
    let validar = this.detallesListados.find(element => element.EstadoVenta == 'Reservado');
    if(validar) return launchAlert({icon:'error', message: 'Valida los destalles pendientes antes de facturar'})
    Swal.fire({
        title: '¿Seguro que quieres Facturar?',
        showDenyButton: true,
        showCancelButton: false,
        confirmButtonText: 'Confirmar Factura',
        denyButtonText: `Cancelar Compra`,
    }).then((result) => {
        /* Read more about isConfirmed, isDenied below */
        if (result.isConfirmed) {
            MostrarImprimirBTN();
            Swal.fire({
                icon: 'success',
                title: 'Factura Confirmada',
                showConfirmButton: false,
                timer: 1000
            })
        } 
    })
}

function MostrarImprimirBTN() {
    var divBTN = document.getElementById('botones-accion-movimiento');
    document.getElementById('divBtnAdd').innerHTML = '';
    divBTN.innerHTML = `
    <div class="row" id="botones-accion-movimiento">
        <div class="col-md-6"><button class="btn btn-primary" style="width: 100%;" onclick="ImprimirFactura()">Imprimir</button></div>
        <div class="col-md-6"><button class="btn btn-primary bg-danger" style="width: 100%;" onclick="AnularDetalles()">Anular</button></div>
    </div>`;

    var ident = document.getElementById('inputPIdCliente').value;
    var Id_movimiento = document.getElementById('id_movimiento').value;
    var datos = new URLSearchParams();
    datos.append("iden", ident);
    datos.append("Id_movimiento", Id_movimiento);
    fetch("/FacturarMovimiento", {
        method: "post",
        body: datos,
        headers: {'Authorization': 'Bearer ' + token,}
    })
    .then((res) => res.json())
    .then((data) => {
        if (data.status == 401) return res.json(data)
        fetch('/listarDetalle/' + Id_movimiento, {
            method: 'get',
            headers: {'Authorization': 'Bearer ' + token}
        }).then(res => res.json())
        .then((data) => {
            let productosMovimiento = [];
            if(data.length > 0){
                this.movimientoVenta.id = document.getElementById('id_movimiento').value;
                this.movimientoVenta.estado = data[0].EstadoMov;
            }
            let i = 1;
            data.forEach((producto) => {
                if (producto.id_detalle == null) return;
                let detalle = '';
                
                if (producto.Entregado == 'Entregado') {
                    detalle += "<span class='span-verde'>Entregado</span>";
                } else detalle += "<span class='span-rojo'>Sin entregar</span>";

                if (producto.EstadoVenta == 'Facturado'){
                    detalle += "<span class='span-verde'>Facturado</span>";
                } else detalle += `<span class='span-rojo'>${producto.EstadoVenta}</span>`;
                
                if (!producto.Nombres) producto.Nombres = producto.Persona;
                let arrayProducto = {
                    num: i++,
                    persona: producto.Nombres,
                    nombre: producto.Nombre,
                    cantidad: producto.Cantidad,
                    valor: producto.VlrUnit,
                    subtotal: producto.VlrTotal,
                    estado: producto.EstadoVenta,
                    detalle: detalle,
                    fecha_entrega: producto.fecha_entrega,
                    accion: `<button class="btn btn-secondary icon-edit-pencil"  
                    onclick="modalEditar('${producto.id_detalle}')" style="width:50px; height:38px; font-size:17px"></button>`
                };
                productosMovimiento.push(arrayProducto);
            });
            renderTableCart(productosMovimiento);
            listarMovimientos();
        });
    })
    .catch((e) => console.log(e));
}
function listarDetalle(Id_movimiento){
    var datos = new URLSearchParams();
    datos.append("idcodigo", Id_movimiento);
    fetch('/listarDetalle/'+Id_movimiento, {
        method: 'get',
        headers: {'Authorization': 'Bearer '+ token,}
    }).then(res => res.json())
    .then((data) => {
        let productosMovimiento = [];
        this.detallesListados = data;
        if(data.length > 0){
            this.movimientoVenta.id = document.getElementById('id_movimiento').value;
            this.movimientoVenta.estado = data[0].EstadoMov;
        }
        let i = 1;
        data.forEach((producto) => {
            if (producto.id_detalle == null) return;
            let detalle = '';
            let accion = ' <div class="btn-group" style="width: 100%;">';

            if (producto.Entregado == 'Entregado') {
                detalle += "<span class='span-verde'>Entregado</span>";
            } else detalle += "<span class='span-rojo'>Sin entregar</span>";

            if (producto.EstadoVenta == 'Facturado'){
                detalle += "<span class='span-verde'>Facturado</span>";
            } else detalle += `<span class='span-rojo'>${producto.EstadoVenta}</span>`;
            
            switch (producto.EstadoVenta) {
                case 'Reservado':
                    accion += `<button class="btn btn-secondary" onclick="Factura('${producto.id_detalle}')" style="width:80px;>
                    <span class="">Facturar</span> </button>
                    <button id='delBtn' class="btn btn-danger" onclick="eliminarProductoMovimiento('${producto.id_detalle}')">
                        <span class="icon-trash1"></span>
                    </button>`
                    break;
            }

            switch (this.movimientoVenta.estado) {
                case 'Facturado':
                    if(producto.EstadoVenta == 'Facturado' || producto.EstadoVenta == 'Pendiente'){
                        accion += `<button class="btn btn-secondary icon-edit-pencil"  
                        onclick="modalEditar('${producto.id_detalle}')" style="width:50px; height:38px; font-size:17px"></button>`;
                    }
                    break;
            
                default:
                    if(producto.EstadoVenta == 'Facturado' || producto.EstadoVenta == 'Pendiente'){
                        accion += `<button class="btn btn-secondary icon-edit-pencil"  
                        onclick="modalEditar('${producto.id_detalle}')" style="width:50px; height:38px; font-size:17px"></button>`;
                        
                        accion += `<button class="btn btn-danger" 
                        onclick="ConfirmarAnularDetalle(${producto.id_detalle})">Anular</button>`;
                    }
                    break;
            }

            /* if(this.movimientoVenta.estado != 'Facturado') {
                if(producto.EstadoVenta == 'Facturado' || producto.EstadoVenta == 'Pendiente'){
                    accion += `<button class="btn btn-secondary icon-edit-pencil"  
                    onclick="modalEditar('${producto.id_detalle}')" style="width:50px; height:38px; font-size:17px"></button>`;
                    
                    accion += `<button class="btn btn-danger" 
                    onclick="ConfirmarAnularDetalle(${producto.id_detalle})">Anular</button>`;
                }
            } */

            accion += '</div>';
            let arrayProducto = {
                num: i++,
                persona: producto.Nombres,
                nombre: producto.Nombre,
                cantidad: producto.Cantidad,
                valor: producto.VlrUnit,
                subtotal: producto.VlrTotal,
                detalle: detalle,
                estado: producto.EstadoVenta,
                fecha_entrega: producto.fecha_entrega,
                accion: accion,
            };
            productosMovimiento.push(arrayProducto);
        });
        if(productosMovimiento.length <= 0) {document.getElementById('botones-accion-movimiento').innerHTML = '';}
        else {
            if(movimientoVenta.estado == 'Facturado') {
                var divBTN = document.getElementById('botones-accion-movimiento');
                divBTN.innerHTML = `
                <div class="row" id="botones-accion-movimiento">
                    <div class="col-md-6"><button class="btn btn-primary" style="width: 100%;" onclick="ImprimirFactura()">Imprimir</button></div>
                    <div class="col-md-6"><button class="btn btn-primary bg-danger" style="width: 100%;" onclick="AnularDetalles()">Anular</button></div>
                </div>`;
            } else {
                document.getElementById('botones-accion-movimiento').innerHTML = `
                <div class="col-12" id="regUserDiv">
                    <button onclick="RealizarFactura()" class="btn btn-primary">Facturar</button>
                </div>`
            }

        }
        renderTableCart(productosMovimiento)
    })  
}
/* ======================================facturado================================ */
function Factura(id_detalle) {
    let movimiento = document.getElementById('id_movimiento').value;
    var datos = new URLSearchParams();
    datos.append("id_detalle", id_detalle)
    fetch('/FacturarDetalle', {
        method: 'post',
        body: datos,
        headers: {
            'Authorization': 'Bearer ' + token,
        }
    }).then(res => res.json())
    .then(() => {
        listarDetalle(movimiento)
        //listarMovimientos();
    });
}
/* ===============finalizar la compra */
function RegistrarDetalle(detalle){
    var datos = new URLSearchParams();
    datos.append('estadoEntega', detalle.estadoEntrega);
    datos.append('codCargo', detalle.cargoCod);
    datos.append("canProd", detalle.cantidad);
    datos.append("comprador", detalle.comprador);
    datos.append("movimiento", detalle.movimiento);
    datos.append("id_inventario", detalle.inventario);
    datos.append("fecha_entrega", detalle.fecha_entrega);
    fetch('/agregarDetalle', {
        method: 'POST',
        body: datos,
        headers: { 'Authorization': 'Bearer ' + token, }
    }).then(res => res.json())
    .then(data => {
        if (data.status == 401) return console.log(data)
        if (data.status == 200) {
            generarVenta(detalle.comprador)
            productoAgregado.hide();
            addProdList.hide();
        } else {
            Swal.fire({
                icon: 'error',
                title: data.message,
                showConfirmButton: false,
                timer: 1000
            })
        }
    }).catch(e => console.log(e));
}
function AregarProductoCliente() {
    let comprador = document.getElementById('inputPIdCliente')
    let cantidad = document.getElementById('inputCant').value;
    let acoplarDetalles = document.getElementById('detalle-individual').value;
    comprador = comprador.value;
    let movimiento = document.getElementById('id_movimiento').value;
    let inventario = document.getElementById('id_inventario').value;
    let cargoCod = document.getElementById('cargo-usuario').value;
    let estadoEntrega = document.getElementById('select-entregado').value;
    let fecha_entrega = document.getElementById('fecha-entrega-detalle').value;
    let datos = {
        estadoEntrega,
        cargoCod,
        cantidad,
        comprador,
        movimiento,
        inventario,
        fecha_entrega
    }
    if(acoplarDetalles === 'Si'){
        RegistrarDetalle(datos);
    } else {
        for (let i = 0; i < cantidad; i++) {
            RegistrarDetalle({...datos, cantidad: 1})
        }
    }
}
var infoProductosPrecio = new bootstrap.Modal(document.getElementById("modalInfoProd"), { keyboard: false, });

document.getElementById('ver-precios').addEventListener('click', (e) => {
    fetch('/listarProductosVenta', {
        method: 'get',
        headers: {'Authorization': 'Bearer ' + token}
    }).then(res => res.json())
        .then(data => {
            if (data.status == 401) return console.log(data);
            let array = [];
            data.forEach(producto => {
                let precios = '<ul style="text-align: left;">';
                producto.precio.split('|').forEach(element => {
                    if(!element.replace(',', '')) return;
                    precios += `<li>${element.replace(',', '')}</li>`
                })
                precios += '</ul>';
                
                let json = {
                    codigo: producto.codigo,
                    Producto: producto.Producto,
                    stock: producto.stock,
                    estado: producto.estado,
                    precio: precios
                }
                
                array.push(json);
            });
            
            $("#tableInfoProducto").DataTable({
                destroy: true,
                autoWidth: false,
                data: array,
                dom: 'Bfrtip',
                columns: [
                    { data: "codigo" },
                    { data: "Producto" },
                    { data: "stock" },
                    { data: "estado" },
                    { data: "precio" },
                ],
            });
        }).catch((e) => console.log(e));
    infoProductosPrecio.toggle();
});
$('#inputPIdCliente').focus();
/* ===========ANULA EL DETALLE SELECCIONADO============ */
function ConfirmarAnularDetalle(id_detalle){
    let comprador = document.getElementById('inputPIdCliente')
    Swal.fire({
        title: '¿Deseas anular este detalle?',
        showDenyButton: true,
        showCancelButton: false,
        confirmButtonText: 'Confirmar',
        denyButtonText: `Cancelar`,
    }).then((result) => {
        if (result.isConfirmed) {
            EstadoAnulado(id_detalle)
            .then(() => {
                listarMovimientos();
                generarVenta(comprador.value)
            })
        }
    });
}
function EstadoAnulado(id_detalle) {
    var datos = new URLSearchParams();
    datos.append("id_detalle",id_detalle)
    return fetch('/EstadoAnulado', {
        method: 'post',
        body: datos,
        headers: {'Authorization': 'Bearer '+ token,}
    }).then(res => res.json())
}
/* ===========selector para el ID FICHA=============== */
document.getElementById('cargo').addEventListener('change', (e) => {
    var cargo = document.getElementById('cargo').value;
    if (cargo == 1) {
        div = document.getElementById('ID');
        div.style.display = 'block';
    }
    else {
        div = document.getElementById('ID');
        div.style.display = 'none';
    }
})
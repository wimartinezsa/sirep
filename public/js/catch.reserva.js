const input = document.getElementById('buscar');
const select_up = document.getElementById('select_up');
//GUARDA GLOBAL
var lista_Productos = [];
var producto_Select = [];
/* ========LISTA LOS DETALLES */
// FILTRO DE PRODUCTOS
// BUSCADOR DE PRODUCTOS
input.addEventListener('keyup', e => {
    const product = lista_Productos.filter(prod => {
        return prod.producto.toLowerCase().includes(input.value.toLowerCase());
    });
    document.getElementById('list_prod').innerHTML = '';
    if (product.length > 0) {
        Render_Productos(product);
    } else {
        Render_Productos(lista_Productos);
    }

});

window.addEventListener('DOMContentLoaded', () => {
    var fecha = new Date();
    var mes = fecha.getMonth() + 1;
    var dia = fecha.getDate();
    var anio = fecha.getFullYear();
    if (dia < 10)
        dia = '0' + dia;
    if (mes < 10)
        mes = '0' + mes
    document.getElementById("date").innerHTML = dia + "/" + mes + "/" + anio;
    //---------------------------------------------------------
    Listar_todos_Productos()
    setInterval(() => {
        let buscador = document.getElementById('buscar').value;
        if(!buscador.trim()) Listar_todos_Productos();
    }, 5000);
});
function Listar_Unidades_Productivas(){
    fetch('Lista_Unidades_Reserva', {
        method: 'GET',
        headers: { 'Authorization': 'Bearer ' + token }
    }).then(res => res.json())
    .then(res => {
        let options = '<option value="">Todas</option>';
        res.forEach(element => {
            options += `<option value='${element.up_id}'>${element.nombre}</option>`;
        });
        select_up.innerHTML = options;
    })
}

function Listar_todos_Productos() {
    let up = document.getElementById('select_up').value;
    var datos = new URLSearchParams();
    datos.append('up', up);
    fetch('/ListarTodosProductos', {
        method: 'POST',
        body: datos,
        headers: { 'Authorization': 'Bearer ' + token }
    }).then(res => res.json())
    .then(data => {
        if (data.status == 401) return data;
        // GUARDA LA INFOR EN LA VARIABLE
        this.lista_Productos = data;
        Render_Productos(data);
    });
}


/* ================================= */
var myModal = new bootstrap.Modal(document.getElementById('myModal'), {
    keyboard: false
});
/* ========FUNCION ABRIR============= */
async function Abrir_Frm_Reserva(nombre, id, precio, stock, maxReserva, reservados, control_inventario, res_grupal, punto_venta) {
    await Crear_Movimiento(punto_venta);
    if(!reservados || reservados == null) reservados = 0;
    document.getElementById('name').innerHTML = nombre;
    document.getElementById('cod_prod').value = id;
    document.getElementById('precio_pdto').value = precio;
    document.getElementById('maxReserva').value = maxReserva;
    document.getElementById('reservados').value = reservados;
    document.getElementById('control_inventario').value = control_inventario;
    document.getElementById('stockProd').value = stock;
    document.getElementById('total').innerHTML = '$ ' + precio;
    document.getElementById('subtotal').value = precio;
    document.getElementById('reserva_grupal').value = res_grupal;


    let tipo_reserva = document.getElementById('tipo_res').value;
    if(res_grupal == 'Si' && tipo_reserva == 'Grupal') 
        document.getElementById('accordion').setAttribute('style', 'display:block')
    else 
        document.getElementById('accordion').setAttribute('style', 'display:none')

    Listar_Reservas_Pendientes(); // se lista las reserva pendiente
    if(document.getElementById('id_movimiento_header').value.trim()) myModal.show();
}

function Aumentar() {
    let maxReserva = document.getElementById('maxReserva').value;
    let Precio = document.getElementById('precio_pdto').value;
    let espacio = parseInt(document.getElementById('cantidad').innerHTML);
    let suma = espacio + 1;
    if (suma <= maxReserva) {
        document.getElementById('cantidad').innerHTML = suma;
        let unidad = (Precio * suma);
        let Subtotal = unidad;
        document.getElementById('total').innerHTML = "$ " + Subtotal;
        document.getElementById('subtotal').value = Subtotal;
    }
}

function Disminuir() {
    let Precio = document.getElementById('precio_pdto').value;
    let espacio = parseInt(document.getElementById('cantidad').innerHTML);
    let resta = espacio - 1;
    if (resta >= 1) {
        document.getElementById('cantidad').innerHTML = resta;
        let unidad = (Precio * resta);
        let Subtotal = unidad;
        document.getElementById('total').innerHTML = "$ " + Subtotal;
        document.getElementById('subtotal').value = Subtotal;
    }
}
/* ===================registro reserva=============== */
function RegistrarDetalle() {
    let tipo_res = document.getElementById('tipo_res').value;
    function Registrar(identificacion) {
        let cantidad = document.getElementById('cantidad').innerHTML;
        let id_producto = document.getElementById('cod_prod').value;
        let id_movimiento = document.getElementById('id_movimiento_header').value;
        let subtotal = document.getElementById('subtotal').value;
        let reservados = document.getElementById('reservados').value;
        let stock = document.getElementById('stockProd').value;
        let control_inventario = document.getElementById('control_inventario').value;
        if(reservados == 'null') reservados = 0;
        if((parseInt(reservados) + parseInt(cantidad)) > parseInt(stock) && control_inventario == 'Si') {
            return Swal.fire({
                title: 'No hay reservas',
                icon: 'error',
                text: 'No hay stock disponible, fueron reservados.',
                timer: 1500
            })
        }
        /* ======================= */
        var datos = new URLSearchParams();
        datos.append('cantidad', cantidad);
        datos.append('id_producto', id_producto);
        datos.append('id_movimiento', id_movimiento);
        datos.append('subtotal', subtotal);
        datos.append('persona', identificacion);

        let token = localStorage.getItem('token');

        fetch('/Registrar_Detalle', {
            method: 'post',
            body: datos,
            headers: {'Authorization': 'Bearer ' + token}
        }).then(res => res.json())
        .then(data => {
            if(data.status == 401) return launchAlert({icon: 'warning', message: 'Usuario no autorizado'});
            if(data.icon != 'error') timer = 1500; 
            else timer = '';
            Swal.fire({
                title: data.titulo,
                icon: data.icon,
                text: data.text,
                timer
            })
            Listar_todos_Productos();
            Listar_Reservas_Pendientes();
        })
        document.getElementById('cantidad').innerHTML = 1;
        myModal.hide();
        Listar_Reservas_Pendientes();
    }
    if (tipo_res == 'Grupal') {
        let checkboxes = document.getElementsByName('checkbox-aprendiz');
        let persona = document.getElementById('ident').value;
        let count = 0;
        checkboxes.forEach(element => {
            if(element.checked){
                count++;
                Registrar(element.value)
            }
        });
        // VALIDA SI HAY UNO O MAS
        if(count <= 0) Registrar(persona);
    } else {
        let persona = document.getElementById('ident').value;
        Registrar(persona);
    }

    
    /* ======================= */
}

function ValidarChecados(){
    let checkTodos = document.getElementById('checkbox-todos');
    let checkboxes = document.getElementsByName('checkbox-aprendiz');
    let checked = 0;
    checkboxes.forEach(checkbox => { if(checkbox.checked) checked ++;});
    if(checked === checkboxes.length) checkTodos.checked = true;
    else checkTodos.checked = false;
}

function SeleccionarTodosReserva(){
    let checkTodos = document.getElementById('checkbox-todos');
    let checkboxes = document.getElementsByName('checkbox-aprendiz');
    checkboxes.forEach(checkbox => {
        if(checkTodos.checked) checkbox.checked = true;
        else checkbox.checked = false;
    });
}
//=============LISTAR APRENDICES POR ID FICHA========================//
function listarUsuariosFicha(idFicha) {
    let listarPersonas = document.getElementById('persona-reserva')
    var datos = new URLSearchParams();
    datos.append('idFicha', idFicha);
    fetch('/Listar_Usuaios_Ficha', {
        method: 'post',
        body: datos,
        headers: {'Authorization': 'Bearer ' + token}
    }).then(res => res.json())
        .then(data => {
            let row = `<div class="form-check mb-2">
                <input class="form-check-input checkbox-aprendiz" type="checkbox" id="checkbox-todos" onclick="SeleccionarTodosReserva()">
                <label class="form-check-label" for="checkbox-todos">
                    <span>Seleccionar todos</span>
                </label>
            </div>`;
            let i = 0;
            data.forEach(e => {
                i++;
                row += `<div class="form-check">
                    <input 
                        class="form-check-input checkbox-aprendiz" 
                        name="checkbox-aprendiz" 
                        type="checkbox" 
                        value="${e.identificacion}" 
                        id="checkbox-aprendiz-${i}" 
                        onclick="ValidarChecados()"
                    />
                    <label class="form-check-label checkbox-label" for="checkbox-aprendiz-${i}">
                        <span>${e.identificacion}</span><span>${e.Nombres}</span>
                    </label>
                </div>`;
            });
            listarPersonas.innerHTML = row;
        })
}
/* ===RENDERIZA LOS PRODUCTOS ==*/
function Render_Productos(data) {
    let timeHour = data[0].hora_actual;
    let card_product = "";
    data.forEach(lista => {
        if(lista.estado == 'Inactivo') return;
        let medidaP = '';
        var descuento = (parseFloat(lista.precio) * (lista.porcentaje/100));
        let reservados = 0;
        if(lista.reservados) reservados = lista.reservados;
        if (lista.medidas) medidaP = ' - ' + lista.medidas;
        // INFO CARDS
        let precio_info = '';
        let descuento_info = '';
        let stock_info = '';
        let up_info = '';
        let btnReserva = '';
        let headPrice = currency(lista.precio);
        if (lista.tipo == 'Venta') {
            // TENER EN CUENTA CON LA PROMOCIÓN
            if(lista.promocion == 'Si'){
                headPrice = currency((lista.precio)-descuento);
                precio_info = `<p class='card-text'><label class='info_pdto'>Precio:</label><span class='info-descuento'>$ ${currency(lista.precio)}</span> - $ ${headPrice}</p>`;
                descuento_info = `<p class='card-text'><label class='info_pdto'>Descuento: <span class='info_pdto_d'>${lista.porcentaje}%</span></label> </p>`;
            }
            stock_info = `<p class="card-text" id="precio"><label class="info_pdto">Stock: </label>${lista.stock} unidades / ${reservados} reservados </p>`
            up_info = `<p class="card-text"><label class="info_pdto">UP: </label> ${lista.up}</p>`;
            if(lista.control_inventario == 'No'){
                stock_info = `<p class="card-text" id="precio"><label class="info_pdto">Reservados:</label> ${reservados}</p>`;
            }
        }
        if(lista.tipo == 'Servicio') {
            stock_info = `<p class="card-text" id="precio"><label class="info_pdto">Stock: </label>${lista.stock} unidades</p>`;
        }

        if (!lista.MaxReserva) lista.MaxReserva = lista.maxreserva;
        if (lista.reserva == 'Si' && (timeHour >= lista.hora_inicio)) {
            if (timeHour >= lista.hora_inicio && timeHour >= lista.hora_fin) {
                btnReserva += `<div class='card-footer'><span style="border: 10px;  color: rgb(224, 64, 64);">Tiempo de reserva superado</span></div>`;
            } else if(reservados >= lista.stock && lista.control_inventario == 'Si'){
                btnReserva += `<div class='card-footer'><span style="border: 10px;  color: rgb(224, 64, 64);">No hay reservas disponibles</span></div>`
            } 
            else {
                btnReserva += `<div class='card-footer'>
                <a class='btn btn-primary w-100'
                href='javascript:Abrir_Frm_Reserva("${lista.producto}", "${lista.id_inventario}", "${lista.precio-descuento}","${lista.stock}", "${lista.MaxReserva}", "${lista.reservados}", "${lista.control_inventario}", "${lista.reserva_grupal}", "${lista.punto_venta}");'>
                Reservar</a>
                </div>`;
            }
        }
        card_product +=
        `<div class='tarjeta-reserva'>
            <div class="cuerpo-tarjeta">
                <div id="precio-producto">$ ${headPrice}</div>
                <a href="javascript:abrirImagen('${lista.imagen}')">
                <img 
                    src="img/products/${lista.imagen}" 
                    class="imagen-producto"
                />
                </a>
                <div class="informacion-tarjeta">
                    <h4 class="nombre-producto">${lista.producto}</h4>
                    <h5 class="descripcion-producto">${lista.descripcion} ${medidaP}</h5>
                    <div>
                        <p class='card-text'><label class='info_pdto'>Tipo Producto: </label>Para ${lista.tipo} </p>
                        ${precio_info}
                        ${descuento_info}
                        ${stock_info}
                        ${up_info}
                        <p class="card-text"><label class="info_pdto">Sitio: </label> ${lista.pv}</p>
                    </div>
                </div>
                ${btnReserva}
            </div>
        </div> `;
    });

    document.getElementById('list_prod').innerHTML = card_product;

}
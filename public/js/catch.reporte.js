let fechaActual = new Date();
let anioActual = fechaActual.getFullYear();
let mesActual = fechaActual.getMonth()+1;
if(mesActual < 10) mesActual = '0'+ mesActual;
let diaActual = fechaActual.getDate();
if(diaActual < 10) diaActual = '0'+ diaActual;

let finMes = anioActual + '-' + mesActual + '-' + diaActual;
let inicioMes = anioActual + '-' + mesActual + '-' + '01';

var fechainicio = document.getElementById("date-start");
var fechafin = document.getElementById("date-end");
if(fechainicio) fechainicio.value = inicioMes;
if(fechafin) fechafin.value = finMes;


/* ROL ADMINISTRADOR */
function MostrarAdmin(){
    let fecha = fechainicio.value;
    /* ========================================================== */
    let fechafinal = fechafin.value;
    /* ========================================================== */
    let datosbusqueda = new URLSearchParams;
    datosbusqueda.append("fechastart", fecha);
    datosbusqueda.append("fechaend",fechafinal);
    fetch('/Reporte_rep_admin', {
        method:'post',
        body:datosbusqueda
    }).then(res=>res.json())
    .then(data=>{
        let json = [];
        let array = {}
        data.forEach(element => {
            array = {
                "col-1": element.up,
                "col-3": element.subtotal,
                "col-4": element.fecha_min,
                "col-5": element.fecha_max,
            }
            json.push(array);
        });
        $('#rep_admin').DataTable({
            "paging":true,
            "processing":true,
            "responsive":true,
            "destroy":true,
            "data":json,
            dom: 'Bfrtip',
            columns:[
                {"data": "col-1"},
                {"data": "col-3"},
                {"data": "col-4"},
                {"data": "col-5"}
            ]
        })
    });
};
/*  */
function MostrarAdminvalor(){
    let fecha = fechainicio.value;
    /* ========================================================== */
    let fechafinal = fechafin.value;
    /* ========================================================== */
    let datosbusqueda = new URLSearchParams;
    datosbusqueda.append("fechastart",fecha);
    datosbusqueda.append("fechaend",fechafinal);
    fetch('/Reporte_rep_val_admi',
    {
    method:'post',
    body:datosbusqueda
    }).then(res=>res.json())
    .then(data=>{
        let json = [];
        let array = {}
        data.forEach(element => {
            array = {
                "col-1": element.producto,
                "col-2": element.cantidad,
                "col-3": element.valor,
                "col-4": element.fecha_min,
                "col-5": element.fecha_max,
            }
            json.push(array);
        });
        $('#rep_val_admi').DataTable({
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
                {"data": "col-4"},
                {"data": "col-5"},
            ]
        })
    });
};
/*  */
function MostrarAdminreporDPV(){
    fetch('/Reporte_reporDPV',
    {
    method:'post'
    }).then(res=>res.json())
    .then(data=>{
        let json = [];
        let array = {}
            data.forEach(element => {
                array = {
                    "col-1": element.punto,
                    "col-2": element.producto,
                    "col-3": element.stock
                }
                json.push(array);
            });
        $('#reporDPV').DataTable({
            "paging":true,
            "processing":true,
            "responsive":true,
            "destroy":true,
            "data":json,
            dom: 'Bfrtip',
            buttons:[
            'copy','csv','excel','pdf','print'
            ],
            columns:[
                {"data": "col-1"},
                {"data": "col-2"},
                {"data": "col-3"}
            ]
        })
    });
};
/*  */
function MostrarAdminProduccion(){
    fetch('/Reporte_rep_produccion_admi',
    {
    method:'post'
    }).then(res=>res.json())
    .then(data=>{
        let json = [];
        let array = {}
            data.forEach(element => {
                array = {
                    "col-1": element.Nombre,
                    "col-2": element.pdto_nombre,
                    "col-3": element.stockcant
                }
                json.push(array);
            });
        $('#rep_produccion_admin').DataTable({
            "paging":true,
            "processing":true,
            "responsive":true,
            "destroy":true,
            "data":json,
            dom: 'Bfrtip',
            columns:[
                {"data": "col-1"},
                {"data": "col-2"},
                {"data": "col-3"}
            ]
        })
    });
}
/*  */
function Comparar_reporVent(){
    let fecha = fechainicio.value;
    /* ========================================================== */
    let fechafinal = fechafin.value;
    /* ========================================================== */
    let datosbusqueda = new URLSearchParams;
    datosbusqueda.append("fechastart",fecha);
    datosbusqueda.append("fechaend",fechafinal);
    fetch('/Reporte_reporVent',
    {
    method:'post',
    body:datosbusqueda
    }).then(res=>res.json())
    .then(data=>{
        let json = [];
        let array = {}
            data.forEach(element => {
                array = {
                    "col-1": element.punto,
                    "col-2": element.subtotal,
                }
                json.push(array);
            });
        $('#reporVent').DataTable({
            "paging":true,
            "processing":true,
            "responsive":true,
            "destroy":true,
            "data":json,
            dom: 'Bfrtip',
            buttons:[
                'copy','csv','excel','pdf','print'
                ],
            columns:[
                {"data": "col-1"},
                {"data": "col-2"},
            ]
        })
    });
}
/*  */
function Comparar_reporcanti(){
    let fecha = fechainicio.value;
    /* ========================================================== */
    let fechafinal = fechafin.value;
    /* ========================================================== */
    let datosbusqueda = new URLSearchParams;
    datosbusqueda.append("fechastart",fecha);
    datosbusqueda.append("fechaend",fechafinal);
    fetch('/Reporte_Reporcanti',{
        method:'post',
        body:datosbusqueda,
        headers: {
            'Authorization': 'Bearer '+ token,
        }
    }).then(res=>res.json())
    .then(data=>{
        let json = [];
        let array ={};
        data.forEach(element => {
            array = {
                "col-1": element.punto,
                "col-2": element.producto,
                "col-3": element.cantidad,
                "col-4": element.subtotal,
                "col-5": element.fecha_min,
                "col-6": element.fecha_max,
            }
            json.push(array);
        });
        $('#reporcanti').DataTable({
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
                {"data": "col-4"},
                {"data": "col-5"},
                {"data": "col-6"},
            ]
        })
    });
}
/*======================= ROL UNIDADES PRODUCTIVAS=======================*/
function Comparar_report_up(){
    let fecha = fechainicio.value;
    /* ========================================================== */
    let fechafinal = fechafin.value;
    /* ========================================================== */
    let datosbusqueda = new URLSearchParams;
    datosbusqueda.append("fechastart",fecha);
    datosbusqueda.append("fechaend",fechafinal);
    fetch('/Reporte_reportUp',
    {
    method:'post',
    body:datosbusqueda
    }).then(res=>res.json())
    .then(data=>{
        let json = [];
        let array = {}
            data.forEach(element => {
                array = {
                    "col-1": element.nomb_up,
                    "col-2": element.pdto_nombre,
                    "col-3": element.medidas,
                    "col-4": element.cantidpdto,
                    "col-5": element.fecha,
                    "col-6": element.observacion
                }
                json.push(array);
            });
        $('#reportUp').DataTable({
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
                {"data": "col-4"},
                {"data": "col-5"},
                {"data": "col-6"}
            ]
        })
    });
};
/*======================= ROL PUNTO VENTA=======================*/
/*  */
function Comparar_reporte_pvent (){
    let fecha = fechainicio.value;
    /* ========================================================== */
    let fechafinal = fechafin.value;
    /* ========================================================== */
    let datosbusqueda = new URLSearchParams;
    datosbusqueda.append("fechastart",fecha);
    datosbusqueda.append("fechaend",fechafinal);
    fetch('/Reporte_Reporte_Pvent',{
        method:'post',
        body:datosbusqueda
    }).then(res=>res.json())
    .then(data=>{
        let json = [];
        let array = {}
        data.forEach(element => {
            array = {
                "col-1": element.producto,
                "col-2": element.cantidad,
                "col-3": element.subtotal,
                "col-4": element.fecha_min,
                "col-5": element.fecha_max,
            }
            json.push(array);
        });
        $('#reporte_pvent').DataTable({
            "paging":true,
            "processing":true,
            "responsive":true,
            "destroy":true,
            "data":json,
            dom: 'Bfrtip',
            buttons:[
                'copy','csv','excel','pdf','print'
            ],
            columns:[
                {"data": "col-1"},
                {"data": "col-2"},
                {"data": "col-3"},
                {"data": "col-4"},
                {"data": "col-5"},
            ]
        })
    });
}
function buscarReporteProduccionProductosUP(){
    let fecha = fechainicio.value;
    /* ========================================================== */
    let fechafinal = fechafin.value;
    /* ========================================================== */
    let datosbusqueda = new URLSearchParams;
    datosbusqueda.append("fechastart",fecha);
    datosbusqueda.append("fechaend",fechafinal);
    fetch('/ProduccionProductosUp',{
        method:'post',
        body:datosbusqueda
    }).then(res=>res.json())
    .then(data=>{
        let json = [];
        let array = {}
        data.forEach(element => {
            array = {
                
                "col-1": element.nomb_up,
                "col-2": element.producto,
                "col-3": element.medidas,
                "col-4": element.cantidad,
                "col-5": element.fecha_min,
                "col-6": element.fecha_max
            }
            json.push(array);
        });
        $('#reporte_pvent').DataTable({
            "paging":true,
            "autoWidth":false,
            "processing":true,
            "responsive":true,
            "destroy":true,
            "data":json,
            dom: 'Bfrtip',
            buttons:[
                'copy','csv','excel','pdf','print'
            ],
            columns:[
                {"data": "col-1"},
                {"data": "col-2"},
                {"data": "col-3"},
                {"data": "col-4"},
                {"data": "col-5"},
                {"data": "col-6"}

            ]
        })
    });
    
}
/*  */

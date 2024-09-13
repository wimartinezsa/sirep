//========== Modal de registro ==============
var myModal = new bootstrap.Modal(document.getElementById('myModal'), {keyboard: false});

function abrir_Frm_Produccion(){
    document.getElementById('btnRegistrar').style.display = 'block';
    document.getElementById('btnActualizar').style.display = 'none';
    document.getElementById('id-produccion').value='';
    limpiarFormulario();
    consultarProductosUp();
    myModal.show();
}



Listar_Produccion_UP();



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


//===============Registra la producción de la UP ===============
function RegistrarProduccion() {
 
    var fecha=document.getElementById('fecha').value;
    var cant=document.getElementById('cantidad').value;
    var obser=document.getElementById('observacion').value;
    var fkpdto = document.getElementById('pdto').value;
    let idProduccion=document.getElementById('id-produccion').value;
    if(cant == 0){
        alert('Por favor ingrese una cantidad')
    }
    else{

    var datos= new URLSearchParams();
    datos.append('Fecha',fecha);
    datos.append('Cantidad',cant);
    datos.append('Observacion',obser);
    datos.append('fkp',fkpdto);
    datos.append('idProduccion',idProduccion);
    

    fetch('/RegistrarProduccion',{
        method:'post',
        body: datos,
        headers: {'Authorization': 'Bearer '+ token}
    }
    ).then(res=>res.json())
    .then(data=>{
        if(data.status == 401) return console.log(data);
        myModal.hide();
        Swal.fire({
            title: data.titulo,
            icon: data.icono,
            text: data.mensaje,
            showConfirmButton: false,
            timer: 1000
        })
        limpiarFormulario();
        Listar_Produccion_UP();
      
    });
    
}
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
        myModal.hide();
        Swal.fire({
            title: data.titulo,
            icon: data.icono,
            text: data.mensaje,
            showConfirmButton: false,
            timer: 1000
        })
        limpiarFormulario();
        Listar_Produccion_UP();
      
    });
    form.reset();




}
}

//==============Lista la produccion de la Unidad Productiva que inicio sesión===========
function Listar_Produccion_UP(){
            fetch('/Listar_Produccion_UP',{
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
                        'medidas':element.medidas,
                        'producido': element.Producido,
                        'observacion':`Pendiente por Confirmar - ${element.Observacion}` ,
                        'estado': element.Estado,
                        'fecha': element.fecha,
                        'accion': element.Estado=='Produccion'  ? `<button class="btn btn-primary"  onclick="buscarProduccion(${element.Id_produccion})">Modificar</button>`
                        :`Fue confirmado por Producción`
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
                        {"data": "fecha"},
                        {"data": "producto"},
                        {"data": "medidas"},
                        {"data": "producido"},
                        {"data": "observacion"},
                        {"data": "estado"},
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

//============== Buscar información del producto ===========
function buscarProduccion(idProduccion){
  
    consultarProductosUp();        fetch(`/buscarProduccion/${idProduccion}`,
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
            document.getElementById('btnRegistrar').style.display = 'none';
            document.getElementById('btnActualizar').style.display = 'block';

            myModal.show();
        });
       
}


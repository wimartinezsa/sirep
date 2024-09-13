window.onload = ListaUnidadesProductivas();
var modalunidadregistro = new bootstrap.Modal(document.getElementById('modalunidadesproductivas'), {
    keyboard: false
});
var modalunidadactualizar = new bootstrap.Modal(document.getElementById('modalunidadesproductivasact'), {
    keyboard: false
});
function vistaunidad(){
    modalunidadregistro.show();
}
function RegistrarUnidad(){
    let form = document.getElementById('form_registro_unidadesproductivas');
    let nameup = document.getElementById('nombreunidad').value;
    let descup = document.getElementById('descripcionunidad').value;
    let personaencarcup = document.getElementById('personaunidad').value;
    let sedeup = document.getElementById('sedeunidad').value;
    let estado = document.getElementById('estadounidad').value;
    let entrega = document.getElementById('entregaunidad').value;
    var DatosFormData = new URLSearchParams();
    DatosFormData.append('Nombre',nameup);
    DatosFormData.append('Descripcion',descup);
    DatosFormData.append('Estado',estado);
    DatosFormData.append('Entrega',entrega);
    DatosFormData.append('PersonaEncargada',personaencarcup);
    DatosFormData.append('Sede',sedeup);
        fetch('/RegistrarUnidadProductiva',{
            method:'post',
            body : DatosFormData,
            headers: {
                'Authorization': 'Bearer '+ token,
            }
        }).
        then(res=>res.json())
        .then(data=>{
            if(data.status == 401) console.log(data)
            Swal.fire({
                title: data.titulo,
                icon: data.icono,
                text: data.mensaje,
                timer : data.timer
            });
            form.reset();
            modalunidadregistro.hide();
            ListaUnidadesProductivas();
        });
}
function ListaUnidadesProductivas(){
    fetch('/Lista_unidadesproductivas',{
        method:'get',
        headers: {
            'Authorization': 'Bearer '+ token,
        }
    })
    .then(res=>res.json())
    .then(data=>{
        if(data.status == 401) return console.log(data)
        renderTableUP(data);
    })
}
function Mostrarventanaup(ident){
    modalunidadactualizar.show();
    var datos = new URLSearchParams();
    datos.append('Identificacion',ident);
    fetch('/Buscar_UP',{
        method:'post',
        body : datos,
        headers: {
            'Authorization': 'Bearer '+ token,
        }
    }
    ).then(res=>res.json())
    .then(data=>{
        if(data.status == 401) return console.log('No autorizado')
        data.forEach(up => {
        document.getElementById('id_up').value=up.codigo_up;
        document.getElementById('nombreunidadactual').value=up.Nombre;
        document.getElementById('descripcionunidadactual').value=up.Descripcion;
        document.getElementById('sedeunidadactual').value=up.sede;
        document.getElementById('estadounidadactual').value=up.estado;
        document.getElementById('entregaunidadactual').value=up.entrega_producto;
        document.getElementById('personaunidaencargadadactual').value=up.fk_persona;
        });
    });
}
function ActualizarUP(){  
    let identidicacion = document.getElementById('id_up').value;
    let nameup = document.getElementById('nombreunidadactual').value;
    let descup = document.getElementById('descripcionunidadactual').value;
    let personaencarcup = document.getElementById('personaunidaencargadadactual').value;
    let sedeup = document.getElementById('sedeunidadactual').value;
    let estado = document.getElementById('estadounidadactual').value;
    let entrega = document.getElementById('entregaunidadactual').value;
    var DatosFormData = new URLSearchParams();
    DatosFormData.append('Identificacion',identidicacion);
    DatosFormData.append('Nombre',nameup);
    DatosFormData.append('Descripcion',descup);
    DatosFormData.append('Estado',estado);
    DatosFormData.append('Entrega',entrega);
    DatosFormData.append('PersonaEncargada',personaencarcup);
    DatosFormData.append('Sede',sedeup);
    fetch('/Actualizar_up',{
        method:'post',
        body : DatosFormData,
        headers: {
            'Authorization': 'Bearer '+ token,
        }
    }).then(res=>res.json())
    .then(data=>{
        if(data.status == 401) return console.log('No autorizado')
        Swal.fire({
            title: data.titulo,
            icon: data.icono,
            text: data.mensaje,
            timer : data.timer
        });
        modalunidadactualizar.hide();
        ListaUnidadesProductivas();
    });
};

function renderTableUP(datos){
    let lista = [];
    datos.forEach(element => {
      let array = {
        "id_up": element.codigo_up,
        "Nombre": element.Nombre,
        "Descripcion" : element.Descripcion,
        "Sede": element.sede,
        "Estado": element.estado,
        "Entrega": element.entrega_producto,
        "Encargado": element.Nombres,
        "btn": `<a class="btn btn-edit" onclick="Mostrarventanaup(`+element.codigo_up+`);">Editar</a>`,
      }
      lista.push(array)
    });
    $('#table-up').DataTable({
        lengthChange: false,
        autoWidth: false,
        destroy: true,
        responsive: true,
        data: lista,
        columns: [
            {"data": "id_up"},
            {"data": "Nombre"},
            {"data": "Descripcion"},
            {"data": "Sede"},
            {"data": "Estado"},
            {"data": "Entrega"},
            {"data": "Encargado"},
            {"data": "btn"}
        ]
    })
}
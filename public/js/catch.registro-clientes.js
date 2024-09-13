listar_Usuarios();
var registro = new bootstrap.Modal(document.getElementById('modalRegistro'), { keyboard: false });
function registroCliente(){
    registro.toggle();
}
var actualizar = new bootstrap.Modal(document.getElementById('modalActualizar'), { keyboard:false});

function buscarUsuario(){
    actualizar;
    actualizar.toggle();
}
/* ================listar base de datos========== */
function listar_Usuarios(){
    fetch('/listar_usuarios',{
        method: 'get',
        headers: {
          'Authorization': 'Bearer '+ token,
        }
    }).then(res => res.json())
    .then(data => {
      if(data.status == 401) return console.log(data)
      renderTabla(data)
    });
}
function renderTabla(datos){
  let listaUsuarios = [];
  datos.forEach(usuario => {
    let ficha = 'No tiene';
    if(usuario.Ficha) ficha = usuario.Ficha;
    let arrayUsuario = {
      "identificacion": usuario.identificacion,
      "Nombres": usuario.Nombres,
      "Correo": usuario.Correo,
      "Direccion" : usuario.Direccion,
      "Telefono": usuario.Telefono,
      "Cargo": usuario.Cargo,
      "Rol": usuario.Rol,
      "Ficha": ficha,
      "Estado": usuario.Estado,
      "btn": "<a class='btn btn-primary' href= 'javascript:buscarUsuario("+usuario.identificacion+");'><i class='icon-check'></i>Actualizar</a>",
    }
    listaUsuarios.push(arrayUsuario)
  });
  $('#usuario').DataTable({
      lengthChange: false,
      autoWidth: false,
      destroy: true,
      responsive: true,
      data: listaUsuarios,
      columns: [
          {"data": "identificacion"},
          {"data": "Nombres"},
          {"data": "Correo"},
          {"data": "Direccion"},
          {"data": "Telefono"},
          {"data": "Cargo"},
          {"data": "Rol"},
          {"data": "Ficha"},
          {"data": "Estado"},
          {"data": "btn"}
      ]
  })
}


/* =============================registro de usuarios=============== */
function registrarUsuario(){
    var id =document.getElementById("iden").value;
    var nom = document.getElementById("nomb").value;
    var correo = document.getElementById("corr").value;
    var direccion = document.getElementById('direc').value;
    var tel =document.getElementById('tele').value;
    var ficha = document.getElementById('ID').value;
    var cargo = document.getElementById('cargo').value;
    var rol = document.getElementById('rol').value;
    var sede = document.getElementById('sede').value;
    if(cargo == 1 && !ficha.trim()) return lanzadorModal('error','Registra la ficha')
    var estado = 1;
    var datos= new URLSearchParams();
    /* parametro de datos */
    /* usuarios */
    datos.append('user',id);
    datos.append('pass',id);
    /* forumario */
    datos.append('identificacion', id);
    datos.append('nombre',nom);
    datos.append('correo',correo);
    datos.append('direccion',direccion);
    datos.append('telefono',tel);
    datos.append('ficha',ficha);
    datos.append('cargo',cargo);
    datos.append('rol',rol);
    datos.append('estado',estado);
    datos.append('sede', sede);
  
    fetch("/registro",{
      method:'post',
      body : datos,
      headers: {'Authorization': 'Bearer '+ token}
    }).then(res=>res.json())
    .then(data=>{
    if(data.status == 200) {
      listar_Usuarios();
      lanzadorModal('success',data.msg);

      document.getElementById("iden").value = '';
      document.getElementById("nomb").value = '';
      document.getElementById("corr").value = '';
      document.getElementById('direc').value = '';
      document.getElementById('tele').value = '';
      document.getElementById('ID').value = '';
      document.getElementById('cargo').value = '';
      document.getElementById('rol').value = '';
      listar_Usuarios();
      registro.hide();  
    }
    else{
      console.log(data)
      lanzadorModal('error','error al hacer el registro')
    }
    }); 
}

/* ===============actualizar============= */
function buscarUsuario(ident){
    var datos= new URLSearchParams();
    datos.append('identificacion',ident);
    fetch('/buscar',{
      method: 'post',
      body: datos,
      headers: {'Authorization': 'Bearer '+ token,}
    }
    ).then(res=>res.json())
    .then(data=>{
        if(data.status == 401) return console.log(data)
        document.getElementById('idenR').value = data.identificacion;
        document.getElementById('new_iden').value = data.identificacion;
        document.getElementById('nombR').value = data.Nombres;
        document.getElementById('corrR').value = data.Correo;
        document.getElementById('direcR').value = data.Direccion;
        document.getElementById('telR').value = data.Telefono;
        document.getElementById('idR').value = data.Ficha;
        document.getElementById('cargoR').value = data.Cargo;
        document.getElementById('rolR').value = data.Rol;
        document.getElementById('estado').value = data.Estado;
        document.getElementById('sedeR').value = data.Sede;
        var div = document.getElementById('Div_idR');
        if( data.Cargo == 1) div.style.display = 'block';
        else div.style.display = 'none';
        actualizar.show();
    });
   
    }
    
    
/* ===========boton actualizar================ */
function actualizarRegistro(){
    var id  = document.getElementById('idenR').value;
    var new_id  = document.getElementById('new_iden').value;
    var nom = document.getElementById('nombR').value;
    var correo =  document.getElementById('corrR').value;
    var direc =   document.getElementById('direcR').value;
    var tel =   document.getElementById('telR').value;
    var ficha =     document.getElementById('idR').value;
    var cargo =    document.getElementById('cargoR').value;
    var rol =    document.getElementById('rolR').value;
    var sede =    document.getElementById('sedeR').value;
    var estado = document.getElementById('estado').value;
    var datos= new URLSearchParams();
 
    datos.append('identificacion',id);
    datos.append('new_iden',new_id);
    datos.append('nombre',nom);
    datos.append('correo',correo);
    datos.append('direccion',direc);
    datos.append('telefono',tel);
    datos.append('ficha',ficha);
    datos.append('cargo',cargo);
    datos.append('rol',rol);
    datos.append('sede',sede);
    datos.append('estado',estado);
    
    fetch("/actualizar/"+id,{
      method:'post',
      body : datos,
      headers: {'Authorization': 'Bearer '+ token,}
    }
    ).then(res=>res.json())
    .then(data=>{
    actualizar.hide()
    listar_Usuarios();
    
    if(data.status == 200) {
      lanzadorModal('success',data.msg)
    }
    else{
      lanzadorModal("error",data.msg)
    }
  });
  clear()

}

/* ====================alerta dinamica============== */
function lanzadorModal(icono,titulo){
  Swal.fire({
  icon: icono,
  title: titulo,
  showConfirmButton: false,
  timer: 1000
  
});
}

/* ==================funcion limpiar============ */
function clear(){
  document.getElementById("cargoR").value = 1;
  document.getElementById("rolR").value = 'Invitado';
}
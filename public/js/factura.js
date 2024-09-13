function Facturar(Id_movimiento){
    /* ============fecha formateada==================== */
    var fecha = new Date();
    var ano = fecha.getFullYear();
    var mes = fecha.getMonth()+1;
    var dia = fecha.getDate();
    if(mes < 10){mes="0"+mes}
    if(dia < 10){dia="0"+dia}
    var fechaFormat=dia+"/"+mes+"/"+ano;
    /* ===================================================== */

    /* 
    // FUNCIÓN PARA INSERTAR IMAGEN
    var img = new Image;
    img.onload = function() {
        pdf.addImage(this, 10, 10);
        pdf.save("CTStest.pdf");
        };
    img.crossOrigin = "";  

    img.src = 'D:/work/TiffImages/png/895153.0000.png'; */

    fetch('/factura/'+Id_movimiento,{
        method:'get',
        headers: {'Authorization': 'Bearer '+ token}
    })
        .then(res=>res.json())
        .then(datos=>{
            if(datos){
                var ident = datos[0].identificacion;
                /* factura sencilla */
                const doc = new jsPDF();
                doc.rect(1,6, 208, 120); // empty square
                /* ===contenido==== */ 
                doc.setFontSize(14);
                doc.text(33, 11,'Centro de Gestion y Desarrollo Sostenible Surcolombiano');
                doc.setFontSize(12);
                doc.text(80, 15,'Sena Empresa');
                /* =====pasar a string====== */
                doc.setFontSize(12);
                doc.text(10,20,'Identificacion');
                doc.setFontSize(12);
                doc.text(40,20,ident+'');
                doc.setFontSize(12);
                doc.text(10,26,'Nombres');
                doc.setFontSize(11);
                doc.text(40,26, datos[0].Nombres);
                doc.setFontSize(12);
                doc.text(175,20,'Recibo: ' + datos[0].num_factura);
                doc.setFontSize(11);
                doc.text(175,26,fechaFormat);
                doc.line(1,28,208, 28); // horizontal line

                var x1 = 3;
                var x2 = 15;
                var x3 = 55;
                var x4 = 70;
                var x5 = 82;
                var x6 = 133;
                var x7 = 156;
                var x8 = 170;
                var x9 = 192;

                doc.text(x1,33, 'ID');
                doc.text(x2,33, 'Producto');
                doc.text(x3,33, 'Valor');
                doc.text(x4,33, 'Cant');
                doc.text(x5,33, 'Asignado');
                doc.text(x6,33, 'Estado');
                doc.text(x7,33, 'Desc');
                doc.text(x8,33, 'F.Entrega');
                doc.text(x9,33, 'Subtotal');
                
                //doc.text(5,34,'ID    Producto  Vlr.Unitario    Cant  Asignado   Estado     Desc %      Valor');
                doc.line(1,35,208, 35); // horizontal line
                /* posicionamiento */
                var y=40;
                var total=0;
                doc.setFontSize(10);

                datos.forEach(element => {
                    let producto = element.Nombre;
                    let cliente = element.Nombres;
                    if(producto.length > 20) producto = producto.substr(0,18)+'...';
                    if(cliente.length > 20) cliente = cliente.substr(0,18)+'...';
                    if(element.EstadoVenta == 'Facturado'){

                        doc.text((x1+2),y,""+element.Codigo_pdto);
                        doc.text((x2  ),y,""+ producto);
                        doc.text((x3+1),y,""+element.VlrUnit);
                        doc.text((x4+2),y,""+element.Cantidad);
                        doc.text((x5),y,""+cliente);
                        doc.text((x6-1),y,""+element.Entregado);
                        /* sumar dos valores */
                        doc.text((x7+2),y,""+element.porcentaje + ' %');
                        doc.text((x8),y,""+element.fecha_entrega);
                        doc.text((x9+1),y,""+element.VlrTotal);
                        total=total+ parseInt(element.VlrTotal) ;
                        y=y+5;
                    }
                });
                /* formato numero */
                total = total.toLocaleString('es')
                doc.setFontSize(12);
                doc.text(162,134,'Total: ');
                doc.setFontSize(12);
                doc.text(175,134,'$ '+total);
                /* firma */
                doc.setFontSize(12);
                doc.text(10,133,'_______________________');
                doc.setFontSize(12);
                doc.text(26,139,'Autorizado');
                
                /* Nombre factura */
                doc.save("Factura.pdf");
            }
        });
} 
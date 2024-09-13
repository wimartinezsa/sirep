-- phpMyAdmin SQL Dump
-- version 5.1.1deb5ubuntu1
-- https://www.phpmyadmin.net/
--
-- Servidor: localhost:3306
-- Tiempo de generación: 21-07-2022 a las 12:45:44
-- Versión del servidor: 8.0.29-0ubuntu0.22.04.2
-- Versión de PHP: 8.1.2

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Base de datos: `produccion2`
--

DELIMITER $$
--
-- Procedimientos
--
CREATE DEFINER=`root`@`localhost` PROCEDURE `Administrar_Detalle_Venta` (IN `p_operacion` VARCHAR(20), IN `p_id_detalle` INT)  BEGIN
declare cant_detalle int;
declare id_invent int;
if(p_operacion='FacturarDetalle') then


select nombre, inventario  into @nombre, @invent from inventario i 
join detalle d on d.fk_id_inventario= i.id_inventario
join productos p on i.fk_codigo_pdto= p.codigo_pdto 
where d.id_detalle=p_id_detalle;

update detalle set estado='Facturado' where id_detalle = p_id_detalle;

if (@invent = 'Si') then
	select cantidad,fk_id_inventario into cant_detalle,id_invent from detalle 
    where id_detalle=p_id_detalle;
    update inventario set stock=stock-cant_detalle where  
    id_inventario=id_invent;
end if;

select concat(@nombre,' Facturado ') as mensaje;
end if;


if(p_operacion='AnularDetalle') then
	select nombre, inventario  into @nombre, @invent from inventario i 
	join detalle d on d.fk_id_inventario= i.id_inventario
	join productos p on i.fk_codigo_pdto= p.codigo_pdto 
	where d.id_detalle=p_id_detalle;
    update detalle set estado='Anulado' where id_detalle = p_id_detalle;
	if (@invent = 'Si') then
		select cantidad,fk_id_inventario into cant_detalle,id_invent from detalle where id_detalle=p_id_detalle;
		update inventario set stock=stock+cant_detalle where  id_inventario=id_invent;
    end if;

    select 'Factura anulada ' as mensaje;
end if;

END$$

CREATE DEFINER=`root`@`localhost` PROCEDURE `Administrar_Inventario` (IN `p_operacion` VARCHAR(40), IN `P_cantidad` INT, IN `P_produccion` INT, IN `P_inventario` INT)  BEGIN


	if(p_operacion='ActualizarBodega') then

			insert into bodega(fecha,cantidad,fk_inventario,fk_produccion)
			values(curdate(),P_cantidad,P_inventario,P_produccion);

			update inventario set stock=stock+P_cantidad where id_inventario=P_inventario;
            
            select 'Inventario actualizado al punto de venta..' as mensaje;
				
	end if;



END$$

CREATE DEFINER=`root`@`localhost` PROCEDURE `Administrar_Reserva` (IN `p_operacion` VARCHAR(20), IN `p_persona` BIGINT)  BEGIN

declare cant int;
declare tipo_mov varchar(20);
-- Buscar movimientso tipo reserva en estado Reservado

select rol into tipo_mov from personas where identificacion=p_persona;

if(p_operacion='Buscar_Reserva') then

			if (tipo_mov='Vocero') then 
				set tipo_mov='Grupal';
                else
                set tipo_mov='Individual';
            
            end if;
            

	      SELECT count(*) into cant FROM movimientos where fk_persona= p_persona and estado='Reservado';
        
		
		  if (cant>0) then
			update movimientos set Fecha=CURDATE() where fk_persona=p_persona and estado='Reservado';
				
			else
				insert into movimientos(Estado,Fecha,fk_persona,tipo)values('Reservado',CURDATE(),p_persona,tipo_mov);
		  end if;
        
           
          
	SELECT distinct m.Id_movimiento,m.tipo,per.Cargo,per.Rol,per.identificacion,per.Nombres as Persona,per.ficha,d.id_detalle,p.Nombre, p.imagen, p.porcentaje, d.cantidad,d.valor as valor,
    (d.valor * d.cantidad  - ((d.valor * d.cantidad) * (p.porcentaje)/100)) as subtotal,
    (select pn.nombres from personas pn where pn.identificacion=d.persona)as aprendiz
    FROM movimientos m
	join personas per on per.identificacion = fk_Persona
    left join detalle d on d.fk_Id_movimiento= m.Id_movimiento
    left join inventario iv on iv.id_inventario= d.fk_id_inventario
    left join productos p on p.Codigo_pdto= iv.fk_codigo_pdto
    left join precios pr on pr.fk_producto= p.Codigo_pdto and pr.fk_cargo=per.cargo
   
    where m.fk_persona=p_persona and m.Estado = 'Reservado';
          

end if;




END$$

CREATE DEFINER=`root`@`localhost` PROCEDURE `Administrar_Ventas` (IN `P_operacion` VARCHAR(40), IN `P_persona` BIGINT, IN `P_id_movimiento` INT)  BEGIN
declare cant int;
declare ID_INV int;
declare CANTIDAD_MOV int;
declare ESTADO_MOV varchar(20);
declare finloop boolean default false;
declare cod_factura int;

DECLARE InventarioProducto CURSOR FOR  select fk_id_inventario,estado,cantidad from detalle  where fk_id_movimiento=P_id_movimiento;
DECLARE CONTINUE HANDLER FOR  SQLSTATE '02000' SET finloop= TRUE;

if(P_operacion='NuevaVenta') then

				SELECT count(*) into cant FROM movimientos 
                where fk_persona= P_persona and estado='Reservado';
				 if (cant>0) then
								update movimientos set Fecha=CURDATE() where fk_persona=p_persona and estado='Reservado';
							else
								insert into movimientos(Estado,Fecha,fk_persona,tipo)values('Reservado',CURDATE(),p_persona,'Individual');
					
					end if; -- fin del condicioanal cant>0
    
    
    SELECT distinct m.Id_movimiento FROM movimientos m
	where m.fk_persona = p_persona and m.Estado = 'Reservado';
    
end if;-- fin del condicioanal P_operacion='NuevaVenta'





-- cambiar de estado el movimiento de estado reservado a facturado
 if(P_operacion='FacturarVenta') then

    update sena_empresa set  num_factura=num_factura+1 ;
    select  num_factura into cod_factura from  sena_empresa;
	update movimientos set estado='Facturado', num_factura=cod_factura where Id_movimiento= P_id_movimiento;
    
    SELECT distinct m.Id_movimiento FROM movimientos m
	where m.fk_persona = p_persona and m.Estado = 'Reservado';
/*

  OPEN InventarioProducto;

		ciclo: LOOP -- inicia el for
		     FETCH InventarioProducto INTO ID_INV,ESTADO_MOV,CANTIDAD_MOV; -- copiamos los datos
               
           --  select ID_INV,ESTADO_MOV,CANTIDAD_MOV;

         
           if(ESTADO_MOV='Facturado') then
					update inventario set stock=stock-CANTIDAD_MOV  where id_inventario=ID_INV;
			end if;
        
				IF finloop THEN
					LEAVE ciclo;
				END IF;  
                
		END LOOP ciclo;
    
  CLOSE InventarioProducto;
  
  */
  end if; -- fin del if facturar
   
  
  
					


END$$

CREATE DEFINER=`adsi`@`%` PROCEDURE `Control_Acceso` (IN `P_Identificacion` BIGINT)  BEGIN
	declare cant_ingre int;
	declare existencia int;
    -- VALIDA SI EXISTE LA PERSONA
    SELECT COUNT(*) into existencia FROM personas 
    WHERE identificacion  = P_Identificacion;
    -- CUENTA LOS ACCESOS DE LA PERSONA
    
    if(existencia > 0) then
    
		SELECT COUNT(*) into cant_ingre FROM accesos 
		WHERE fk_persona  = P_Identificacion  and estado = 'Ingreso';
		   
		if(cant_ingre > 0) then
			UPDATE accesos SET fechasalida = CURRENT_TIME(), estado = 'Salio' WHERE fk_persona = P_Identificacion;
		else 
			INSERT INTO accesos(fechaingreso, estado, fk_persona) 
			VALUES (CURRENT_TIME(), 'Ingreso', P_Identificacion);
		end if;
        SELECT p.identificacion, p.Nombres, nombre_cargo as Cargo, p.Foto, 
			a.fechaingreso, a.fechasalida, time(a.fechaingreso) as hora_ingreso, a.estado 
			FROM personas p 
			LEFT JOIN cargo on p.Cargo = idcargo 
			right JOIN accesos a on p.identificacion = a.fk_persona
        WHERE p.identificacion = P_Identificacion 
        ORDER BY idacceso DESC LIMIT 1;
	end if;
END$$

DELIMITER ;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `accesos`
--

CREATE TABLE `accesos` (
  `idacceso` int NOT NULL,
  `fechaingreso` datetime DEFAULT NULL,
  `fechasalida` datetime DEFAULT NULL,
  `observacion` varchar(100) DEFAULT NULL,
  `estado` enum('Ingreso','Salio') DEFAULT NULL,
  `fk_persona` bigint DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Volcado de datos para la tabla `accesos`
--

INSERT INTO `accesos` (`idacceso`, `fechaingreso`, `fechasalida`, `observacion`, `estado`, `fk_persona`) VALUES
(1, '2022-07-21 07:50:32', '2022-07-21 08:39:50', NULL, 'Salio', 96361787),
(2, '2022-07-21 07:51:45', '2022-07-21 08:56:40', NULL, 'Salio', 1007531657),
(3, '2022-07-21 07:52:09', '2022-07-21 09:05:02', NULL, 'Salio', 1007361222),
(4, '2022-07-21 07:52:28', '2022-07-21 09:04:53', NULL, 'Salio', 1007502651),
(5, '2022-07-21 07:52:34', '2022-07-21 08:56:46', NULL, 'Salio', 1015994112),
(6, '2022-07-21 07:52:38', '2022-07-21 08:56:19', NULL, 'Salio', 1007745216),
(7, '2022-07-21 07:55:01', '2022-07-21 09:04:31', NULL, 'Salio', 1004493117),
(8, '2022-07-21 07:55:20', '2022-07-21 09:05:14', NULL, 'Salio', 1061821721),
(9, '2022-07-21 07:55:37', '2022-07-21 09:03:33', NULL, 'Salio', 1003808338),
(10, '2022-07-21 07:55:55', '2022-07-21 09:04:41', NULL, 'Salio', 1083865788),
(11, '2022-07-21 07:56:12', '2022-07-21 09:03:58', NULL, 'Salio', 1193045173),
(12, '2022-07-21 07:56:25', '2022-07-21 09:04:08', NULL, 'Salio', 1004033754),
(13, '2022-07-21 07:59:35', '2022-07-21 08:56:06', NULL, 'Salio', 1075317893),
(14, '2022-07-21 08:00:13', '2022-07-21 08:56:40', NULL, 'Salio', 1007531657),
(15, '2022-07-21 08:06:16', '2022-07-21 08:50:29', NULL, 'Salio', 1007163437),
(16, '2022-07-21 08:06:29', '2022-07-21 08:39:50', NULL, 'Salio', 96361787),
(17, '2022-07-21 08:20:21', '2022-07-21 08:39:50', NULL, 'Salio', 96361787),
(18, '2022-07-21 08:52:02', NULL, NULL, 'Ingreso', 1006956707),
(19, '2022-07-21 08:56:15', '2022-07-21 08:56:19', NULL, 'Salio', 1007745216),
(20, '2022-07-21 08:56:31', '2022-07-21 08:56:40', NULL, 'Salio', 1007531657),
(21, '2022-07-21 09:03:21', NULL, NULL, 'Ingreso', 1015994112);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `bodega`
--

CREATE TABLE `bodega` (
  `id_bodega` int NOT NULL,
  `fecha` datetime DEFAULT NULL,
  `cantidad` decimal(10,2) DEFAULT NULL,
  `fk_inventario` int DEFAULT NULL,
  `fk_produccion` int DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Volcado de datos para la tabla `bodega`
--

INSERT INTO `bodega` (`id_bodega`, `fecha`, `cantidad`, `fk_inventario`, `fk_produccion`) VALUES
(1, '2022-07-13 00:00:00', '50.00', 1, 1),
(2, '2022-07-15 00:00:00', '10.00', 3, 3);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `cargo`
--

CREATE TABLE `cargo` (
  `idcargo` int NOT NULL,
  `nombre_cargo` varchar(45) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Volcado de datos para la tabla `cargo`
--

INSERT INTO `cargo` (`idcargo`, `nombre_cargo`) VALUES
(1, 'Aprendiz'),
(2, 'Instructor'),
(3, 'Administrativo 1'),
(4, 'Administrativo 2'),
(5, 'Administrativo 3'),
(6, 'Auxiliar aseo'),
(7, 'Operarios'),
(8, 'Visitas'),
(9, 'Donado');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `detalle`
--

CREATE TABLE `detalle` (
  `id_detalle` int NOT NULL,
  `cantidad` decimal(10,2) NOT NULL,
  `valor` decimal(10,2) NOT NULL,
  `Estado` enum('Reservado','Facturado','Anulado','Rechazado','Prestamo') CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `Entregado` enum('Entregado','No entregado','No reclamado') NOT NULL,
  `fecha` datetime NOT NULL,
  `porcentaje` int NOT NULL,
  `subtotal` decimal(10,2) NOT NULL,
  `Persona` bigint DEFAULT NULL,
  `descripcion` varchar(200) DEFAULT NULL,
  `fk_Id_movimiento` int NOT NULL,
  `fk_id_inventario` int NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Volcado de datos para la tabla `detalle`
--

INSERT INTO `detalle` (`id_detalle`, `cantidad`, `valor`, `Estado`, `Entregado`, `fecha`, `porcentaje`, `subtotal`, `Persona`, `descripcion`, `fk_Id_movimiento`, `fk_id_inventario`) VALUES
(1, '1.00', '8000.00', 'Facturado', 'No entregado', '2022-07-18 13:56:46', 30, '5600.00', 36174153, NULL, 1, 1),
(2, '1.00', '8000.00', 'Facturado', 'No reclamado', '2022-07-18 13:57:45', 30, '5600.00', 1006947348, NULL, 2, 4),
(3, '1.00', '8000.00', 'Reservado', 'No entregado', '2022-07-18 14:01:24', 30, '5600.00', 1020737788, NULL, 4, 1),
(4, '1.00', '5000.00', 'Reservado', 'No entregado', '2022-07-19 07:37:50', 0, '5000.00', 1117523736, NULL, 7, 4),
(5, '1.00', '5000.00', 'Reservado', 'No entregado', '2022-07-19 08:40:20', 0, '5000.00', 1083886191, NULL, 8, 4),
(6, '1.00', '8000.00', 'Reservado', 'No entregado', '2022-07-19 14:12:13', 30, '5600.00', 1083928678, NULL, 3, 1),
(15, '1.00', '2000.00', 'Facturado', 'No entregado', '2022-07-21 07:31:36', 0, '2000.00', 1006956707, NULL, 13, 4),
(16, '1.00', '2000.00', 'Facturado', 'Entregado', '2022-07-21 07:31:47', 0, '2000.00', 1007745216, NULL, 13, 4),
(18, '1.00', '2000.00', 'Facturado', 'No entregado', '2022-07-21 07:32:06', 0, '2000.00', 1004493117, NULL, 13, 4),
(20, '1.00', '2000.00', 'Facturado', 'Entregado', '2022-07-21 07:32:17', 0, '2000.00', 1007502651, NULL, 13, 4),
(21, '1.00', '2000.00', 'Facturado', 'No entregado', '2022-07-21 07:32:26', 0, '2000.00', 1061821721, NULL, 13, 4),
(26, '1.00', '5000.00', 'Facturado', 'No entregado', '2022-07-21 08:18:12', 0, '5000.00', 96361787, NULL, 11, 4),
(28, '1.00', '2000.00', 'Reservado', 'No entregado', '2022-07-21 10:54:11', 0, '2000.00', 1116912148, NULL, 9, 4),
(29, '1.00', '2000.00', 'Reservado', 'No entregado', '2022-07-21 11:39:13', 0, '2000.00', 1006947348, NULL, 30, 4);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `inventario`
--

CREATE TABLE `inventario` (
  `id_inventario` int NOT NULL,
  `stock` decimal(10,2) NOT NULL,
  `fk_codigo_pdto` int NOT NULL,
  `fk_id_punto_vent` int NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Volcado de datos para la tabla `inventario`
--

INSERT INTO `inventario` (`id_inventario`, `stock`, `fk_codigo_pdto`, `fk_id_punto_vent`) VALUES
(1, '41.00', 1, 1),
(3, '9.00', 2, 1),
(4, '0.00', 4, 1);

-- --------------------------------------------------------

--
-- Estructura Stand-in para la vista `listamovimientos`
-- (Véase abajo para la vista actual)
--
CREATE TABLE `listamovimientos` (
`cantidad` decimal(10,2)
,`Codigo_pdto` int
,`codigo_up` int
,`Entregado` enum('Entregado','No entregado','No reclamado')
,`Estado` enum('Reservado','Facturado','Anulado','Rechazado','Prestamo')
,`Fecha` date
,`id_detalle` int
,`Id_movimiento` int
,`id_punto_vent` int
,`identificacion` bigint
,`Nombres` varchar(80)
,`num_factura` int
,`porcentaje` int
,`producto` varchar(50)
,`punto` varchar(30)
,`stock` decimal(10,2)
,`subtotal` decimal(35,8)
,`up` varchar(40)
,`valor` decimal(10,2)
);

-- --------------------------------------------------------

--
-- Estructura Stand-in para la vista `lista_detalles`
-- (Véase abajo para la vista actual)
--
CREATE TABLE `lista_detalles` (
`aprendiz` varchar(80)
,`cantidad` decimal(10,2)
,`Cargo` int
,`Estado` enum('Reservado','Facturado','Anulado','Rechazado','Prestamo')
,`Fecha` date
,`ficha` int
,`id_detalle` int
,`Id_movimiento` int
,`identificacion` bigint
,`imagen` varchar(80)
,`Nombre` varchar(50)
,`Persona` varchar(80)
,`porcentaje` int
,`Rol` enum('Invitado','Vocero','Lider UP','Punto Venta','Admin','Acceso')
,`subtotal` decimal(35,8)
,`tipo` enum('Grupal','Individual')
,`valor` decimal(10,2)
);

-- --------------------------------------------------------

--
-- Estructura Stand-in para la vista `lista_produccion_up`
-- (Véase abajo para la vista actual)
--
CREATE TABLE `lista_produccion_up` (
`Codigo_pdto` int
,`codigo_up` int
,`Disponible` decimal(33,2)
,`Distribuido` decimal(32,2)
,`Estado` enum('Producido','Aceptado','Rechazado')
,`fecha` date
,`Id_produccion` int
,`nomb_up` varchar(40)
,`Producido` decimal(10,2)
,`producto` varchar(50)
);

-- --------------------------------------------------------

--
-- Estructura Stand-in para la vista `lista_productos`
-- (Véase abajo para la vista actual)
--
CREATE TABLE `lista_productos` (
`codigo_up` int
,`control_inventario` enum('Si','No')
,`descripcion` varchar(80)
,`estado` enum('Activo','Inactivo')
,`hora_fin` time
,`hora_inicio` time
,`id_inventario` int
,`Id_punto_vent` int
,`idcargo` int
,`imagen` varchar(80)
,`maxreserva` int
,`medidas` varchar(50)
,`nomb_up` varchar(40)
,`Nombre` varchar(30)
,`nombre_cargo` varchar(45)
,`porcentaje` int
,`precio` decimal(10,2)
,`Producto` varchar(50)
,`promocion` enum('Si','No')
,`reserva` enum('Si','No')
,`stock` decimal(10,2)
,`tipo` enum('Venta','Servicio')
);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `movimientos`
--

CREATE TABLE `movimientos` (
  `Id_movimiento` int NOT NULL,
  `Estado` enum('Reservado','Facturado','Anulado','Rechazado','Prestamo') CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `Fecha` date DEFAULT NULL,
  `fk_persona` bigint NOT NULL,
  `tipo` enum('Grupal','Individual') DEFAULT NULL,
  `num_factura` int DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Volcado de datos para la tabla `movimientos`
--

INSERT INTO `movimientos` (`Id_movimiento`, `Estado`, `Fecha`, `fk_persona`, `tipo`, `num_factura`) VALUES
(1, 'Facturado', '2022-07-18', 36174153, 'Individual', 21),
(2, 'Facturado', '2022-07-18', 1083886191, 'Individual', 22),
(3, 'Reservado', '2022-07-21', 1083928678, 'Individual', NULL),
(4, 'Reservado', '2022-07-21', 1020737788, 'Individual', NULL),
(5, 'Reservado', '2022-07-21', 36174153, 'Individual', NULL),
(6, 'Reservado', '2022-07-18', 1004269111, 'Individual', NULL),
(7, 'Reservado', '2022-07-21', 1117523736, 'Individual', NULL),
(8, 'Reservado', '2022-07-19', 1083886191, 'Individual', NULL),
(9, 'Reservado', '2022-07-21', 1116912148, 'Individual', NULL),
(10, 'Reservado', '2022-07-21', 12266826, 'Individual', NULL),
(11, 'Facturado', '2022-07-21', 96361787, 'Individual', 24),
(12, 'Reservado', '2022-07-21', 1007502651, 'Individual', NULL),
(13, 'Facturado', '2022-07-21', 1007531657, 'Individual', 23),
(14, 'Reservado', '2022-07-21', 1004033754, 'Individual', NULL),
(15, 'Reservado', '2022-07-21', 1007745216, 'Individual', NULL),
(16, 'Reservado', '2022-07-21', 1004492809, 'Individual', NULL),
(17, 'Reservado', '2022-07-21', 1083865788, 'Individual', NULL),
(18, 'Reservado', '2022-07-21', 1007163437, 'Individual', NULL),
(19, 'Reservado', '2022-07-21', 1004493117, 'Individual', NULL),
(20, 'Reservado', '2022-07-21', 1193045173, 'Individual', NULL),
(21, 'Reservado', '2022-07-21', 1007361222, 'Individual', NULL),
(22, 'Reservado', '2022-07-21', 1075317893, 'Individual', NULL),
(23, 'Reservado', '2022-07-21', 1007531657, 'Grupal', NULL),
(24, 'Reservado', '2022-07-21', 1061821721, 'Individual', NULL),
(25, 'Reservado', '2022-07-21', 1003808338, 'Individual', NULL),
(26, 'Reservado', '2022-07-21', 1006956707, 'Individual', NULL),
(27, 'Reservado', '2022-07-21', 1015994112, 'Individual', NULL),
(28, 'Reservado', '2022-07-21', 1075214102, 'Individual', NULL),
(29, 'Reservado', '2022-07-21', 96361787, 'Individual', NULL),
(30, 'Reservado', '2022-07-21', 1006947348, 'Individual', NULL);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `personas`
--

CREATE TABLE `personas` (
  `identificacion` bigint NOT NULL,
  `Nombres` varchar(80) NOT NULL,
  `Correo` varchar(80) DEFAULT NULL,
  `Login` varchar(20) NOT NULL,
  `password` varchar(100) DEFAULT NULL,
  `Direccion` varchar(80) DEFAULT NULL,
  `Telefono` varchar(15) DEFAULT NULL,
  `Cargo` int DEFAULT NULL,
  `Rol` enum('Invitado','Vocero','Lider UP','Punto Venta','Admin','Acceso') CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `Ficha` int DEFAULT NULL,
  `Estado` tinyint(1) DEFAULT NULL,
  `Foto` varchar(80) NOT NULL DEFAULT 'default.png'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Volcado de datos para la tabla `personas`
--

INSERT INTO `personas` (`identificacion`, `Nombres`, `Correo`, `Login`, `password`, `Direccion`, `Telefono`, `Cargo`, `Rol`, `Ficha`, `Estado`, `Foto`) VALUES
(123456, 'Control de acceso', NULL, '123456', '123456', NULL, NULL, 3, 'Acceso', 0, NULL, 'default.png'),
(4179870, 'JAIRO ALONSO ALVARADO AVILA', 'avilajairo046@gmail.com', '4179870', '4179870', '', '3222706075', 1, 'Invitado', 2451011, 1, 'default.png'),
(6030646, 'JOSE URIEL SALAS LONDOÑO', 'juriels@misena.edu.co', '6030646', '6030646', '', '313248417', 2, 'Invitado', 0, 1, 'default.png'),
(7724144, 'SAUL RAMIREZ MOLANO', 'saulr9321@gmail.com', '7724144', '7724144', '', '3156651758', 2, 'Invitado', 0, 1, 'default.png'),
(7731793, 'CARLOS ROMARIO GARCIA MEJIA', 'cr3@misena.edu.co', '7731793', '7731793', '', '3212674748', 2, 'Invitado', 0, 1, 'default.png'),
(8127163, 'GABRIEL JAIME QUINTERO RIVERA', 'Jaime19842020@outlook.es', '8127163', '8127163', '', '3103263046', 1, 'Invitado', 2451011, 1, 'default.png'),
(8304357, 'OSBEIN VALENZUELA CARRILLO', 'binxvi83@googlemail.com', '8304357', '8304357', '', '3143780169', 2, 'Invitado', 0, 1, 'default.png'),
(10633441, 'CHAVEZ PARRA YONY ARLEY', 'ychavezp@sena.edu.co', '10633441', '10633441', '', '3147284365', 2, 'Invitado', 0, 1, 'default.png'),
(11105302, 'ENEIS MANUEL AGUIRRE CALLE', 'agcalle27@gmail.com', '11105302', '11105302', '', 'null', 1, 'Invitado', 2451011, 1, 'default.png'),
(12141244, 'LEANDRO SALAZAR MUÑOZ', 'leosam62@hotmail.com', '12141244', '12141244', '', 'null', 1, 'Invitado', 2468752, 1, 'default.png'),
(12141594, 'EFREN QUINAYAS ESCOBAR', 'complemen@misena.edu.co', '12141594', '12141594', '', 'null', 1, 'Invitado', 2468752, 1, 'default.png'),
(12142483, 'PLINIO QUINAYAS PAPAMIJA', 'plikimania29@gmail.com', '12142483', '12142483', '', 'null', 1, 'Invitado', 2468752, 1, 'default.png'),
(12144652, 'WILLIAM ALEXANDER MARTINEZ IMBACHI', 'juancho21kx@gmail.com', '12144652', '12144652', '', 'null', 1, 'Invitado', 2500012, 1, 'default.png'),
(12144802, 'OMAR JIMENEZ BUESACO', 'paisajecafetero2018@gmail.com', '12144802', '12144802', '', 'null', 1, 'Invitado', 2468752, 1, 'default.png'),
(12144994, 'LUIS OSCAR ORTEGA MUÑOZ', 'marthaurbano@yahoo.com', '12144994', '12144994', '', 'null', 1, 'Invitado', 2464124, 1, 'default.png'),
(12168629, 'SEGUNDO EDUARDO CHAVEZ CHAVEZ', 'actualizar@misena.edu.com', '12168629', '12168629', '', 'null', 1, 'Invitado', 2464124, 1, 'default.png'),
(12169668, 'WLADEMIR LARA GARCIA', 'wlalaga76@hotmail.com', '12169668', '12169668', '', 'null', 1, 'Invitado', 2464124, 1, 'default.png'),
(12170249, 'EDGAR ORDOÑEZ MENESES', 'madiaz431@misena.edu.co', '12170249', '12170249', '', 'null', 1, 'Invitado', 2464124, 1, 'default.png'),
(12170749, 'RAUL EDUARDO CERON BENAVIDES', 'rceron100@misena.edu.co', '12170749', '12170749', '', '3205764649', 2, 'Invitado', 0, 1, 'default.png'),
(12180505, 'ALBEIRO BUESACO OMEN', 'yber.omen19@gmail.com', '12180505', '12180505', '', '3182499592', 1, 'Invitado', 2468752, 1, 'default.png'),
(12180982, 'CESAR CAMILO GOMEZ', 'cescgomez@misena.edu.co', '12180982', '12180982', 'Pitalito', '3203397782', 8, 'Invitado', 0, 1, 'default.png'),
(12181543, 'ARLEY OMEN OMEN', 'actualizar@misena.edu.co', '12181543', '12181543', '', '3504362002', 1, 'Invitado', 2468752, 1, 'default.png'),
(12182345, 'ELBAR ASTUDILLO RUIZ', 'jesuslebaza@yahoo.com', '12182345', '12182345', '', '3003456723', 1, 'Invitado', 2468752, 1, 'default.png'),
(12182397, 'ROBERT ESTIVEN ORDOÑEZ ORTEGA', 'chapu2385@gmail.com', '12182397', '12182397', '', 'null', 1, 'Invitado', 2468752, 1, 'default.png'),
(12197764, 'HECTOR OLIVO REALPE REALPE', 'juriels@misena.edu.co', '12197764', '12197764', '', 'null', 1, 'Invitado', 2464124, 1, 'default.png'),
(12225629, 'JESÚS ANTONIO ARCOS ORDOÑEZ', 'jesusantonioarcos@hotmail.com', '12225629', '12225629', '', '3142999973', 2, 'Invitado', 0, 1, 'default.png'),
(12240483, 'BRAVO ZUÑIGA CARLOS ALBERTO', 'cbravo@sena.edu.co', '12240483', '12240483', '', '3144789120', 2, 'Invitado', 0, 1, 'default.png'),
(12262605, 'JOSE ORDONEY CUELLAR MAZABEL', 'jocuellar22@misena.edu.co', '12262605', '12262605', '', '3203464628', 2, 'Invitado', 0, 1, 'default.png'),
(12264030, 'CARLOS GABRIEL MUÑOZ SILVA', 'carlosgabriel79@gmail.com', '12264030', '12264030', '', '3108861398', 1, 'Invitado', 2546882, 1, 'default.png'),
(12265488, 'JAROL ALBEIRO FAJARDO PERDOMO', 'haroldin2004@yahoo.com', '12265488', '12265488', '', '3142756368', 1, 'Invitado', 2451009, 1, 'default.png'),
(12266826, 'ALVARO AURELIO MURCIA JIMENEZ', 'amurciajimenez@misena.edu.co', '12266826', '12266826', '', '3138006173', 2, 'Invitado', 0, 1, 'default.png'),
(14274360, 'HERNAN EDUARDO LOZANO GARCIA', 'edwarlozano85@gmail.com', '14274360', '14274360', '', '3133739175', 1, 'Invitado', 2541039, 1, 'default.png'),
(15813028, 'ALVARO FERNANDO RIVERA RIASCOS', 'alvaro196911@outlook.com', '15813028', '15813028', '', '3137568749', 1, 'Invitado', 2464124, 1, 'default.png'),
(16186627, 'CARLOS ALBERTO SANCHES CRUZ', 'carlos4575@gmail.com', '16186627', '16186627', '', '3118600268', 2, 'Invitado', 0, 1, 'default.png'),
(16932756, 'WALTER ROBINSON HERRERA PEÑA', 'walherob@hotmail.com', '16932756', '16932756', '', '320 2093100', 2, 'Invitado', 0, 1, 'default.png'),
(19245621, 'ALVARO SUAREZ ARIZA', 'alvarosuarezz3456@gmail.com', '19245621', '19245621', '', '3122225583', 1, 'Invitado', 2464124, 1, 'default.png'),
(19351420, 'NICOLAS ANTONIO AGUDELO VELASQUEZ', 'nico2020ag@gmail.com', '19351420', '19351420', '', '3118471768', 2, 'Invitado', 0, 1, 'default.png'),
(19425315, 'SEGUNDO JOSE GERENA ARDILA', 'jlgerena315@hotmail.com', '19425315', '19425315', '', '3183430136', 1, 'Invitado', 2468752, 1, 'default.png'),
(19462860, 'HERNANDEZ LOPEZ CARLOS URIEL', 'cuhernandez0@misena.edu.co', '19462860', '19462860', '', '3118860294', 2, 'Invitado', 0, 1, 'default.png'),
(26493042, 'CRIOLLO CRIOLLO ARELIS', 'acriolloc@sena.edu.co', '26493042', '26493042', '', '3132107090', 2, 'Invitado', 0, 1, 'default.png'),
(29115177, 'VÁSQUEZ CASTRO SILVIA CRISTINA', 'svasquezc@sena.edu.co', '29115177', '29115177', '', '3102392469', 2, 'Invitado', 0, 1, 'default.png'),
(36067295, 'PATIÑO VILLARRAGA ANDREA', 'apatinov@misena.edu.co', '36067295', '36067295', '', '3219073490', 2, 'Invitado', 0, 1, 'default.png'),
(36174153, 'Adriana Pinzón Peralta', 'apinzonp@misena.edu.co', '36174153', '36174153', 'Yamboró', '3002105865', 3, 'Admin', 0, 1, 'default.png'),
(36274789, 'STERLING ROJAS  BEATRIZ', 'bsterling@sena.edu.co', '36274789', '36274789', '', '3135017291', 2, 'Invitado', 0, 1, 'default.png'),
(36277903, 'NORMA YAMIR CHINCHILLA NIETO', 'suministrosybiologicosperkins@yahoo.com', '36277903', '36277903', '', '3118068901', 2, 'Invitado', 0, 1, 'default.png'),
(36287565, 'NORALBA RUIZ CASTRO', 'contacto@empitalito.gov.co', '36287565', '36287565', '', 'null', 1, 'Invitado', 2541039, 1, 'default.png'),
(36287662, 'SILVIA ANDREA FORERO ARTUNDUAGA', 'saforero26@misena.edu.co', '36287662', '36287662', '', '3203454532', 2, 'Invitado', 0, 1, 'default.png'),
(36288847, 'NORMA CONSTANZA PEREZ BENAVIDES', 'norcope7@misena.edu.co', '36288847', '36288847', '', '3163249651', 2, 'Invitado', 0, 1, 'default.png'),
(36290583, 'ALEXA MARIA TOLEDO MURCIA', 'alexamaria670@gmail.com', '36290583', '36290583', '', '3103123034', 1, 'Invitado', 2554406, 1, 'default.png'),
(36292791, 'ROSA ELENA DUARTE VERA', 'rosa2020duarte@gmail.com', '36292791', '36292791', '', 'null', 1, 'Invitado', 2500267, 1, 'default.png'),
(36295573, 'DIANA MARCELA DIAZ SALGADO', 'nanaseb12@hotmail.com', '36295573', '36295573', '', '3128315673', 2, 'Invitado', 0, 1, 'default.png'),
(36296089, 'DIANA MENDEZ MENDEZ', 'mendezito22@gmail.com', '36296089', '36296089', '', 'null', 1, 'Invitado', 2554406, 1, 'default.png'),
(36296967, 'GASCA TORRES LIGIA', 'lgascat@sena.edu.co', '36296967', '36296967', '', '3124203719', 2, 'Invitado', 0, 1, 'default.png'),
(39820248, 'MIRYAN YOLANDA ARCOS SANCHEZ', 'arcosmiryan@gmail.com', '39820248', '39820248', '', '39820248', 1, 'Invitado', 2541039, 1, 'default.png'),
(40780515, 'MARTHA CECILIA BERNAL CUELLAR', 'bernalmartha788@gmail.com', '40780515', '40780515', '', '3114358721', 1, 'Invitado', 2541039, 1, 'default.png'),
(40781859, 'MARTHA CECILIA CAMACHO PEÑA', 'martha.camachope@misena.edu.co', '40781859', '40781859', '', '3138537907', 2, 'Invitado', 0, 1, 'default.png'),
(42018068, 'AURA CRISTINA VARGAS MARIN', 'johanvr05@hotmail.es', '42018068', '42018068', '', 'null', 1, 'Invitado', 2464124, 1, 'default.png'),
(52068442, 'ADRIANA MARIA SANCHEZ ORDOÑEZ', 'adrianasanchezabogada@gmail.com', '52068442', '52068442', '', '3003616110', 1, 'Invitado', 2554406, 1, 'default.png'),
(52213350, 'DEISSY MILDRED GERARDINO ANACONA', 'demigerardino@gmail.com', '52213350', '52213350', '', '3204294079', 2, 'Invitado', 0, 1, 'default.png'),
(52953392, 'DEYA MARITZA CORTES ENRIQUEZ', 'maritzacortes@misena.edu.co', '52953392', '52953392', '', '3128161417', 2, 'Invitado', 0, 1, 'default.png'),
(53011894, 'MARCELA PIEDAD RODRIGUEZ CARLOSAMA', 'marce.2224@hotmail.com', '53011894', '53011894', '', '3134212666', 1, 'Invitado', 2500274, 1, 'default.png'),
(53166356, 'MAGDA LORENA ROJAS QUINAYAS', 'mlrojas653@misena.edu.co', '53166356', '53166356', '', '3102455831', 2, 'Invitado', 0, 1, 'default.png'),
(55182077, 'EMILSEN LUCIA SALAMANCA ANACONA', 'emsalucia@gmail.com', '55182077', '55182077', '', 'null', 1, 'Invitado', 2500094, 1, 'default.png'),
(55207876, 'DISNEY BERNAL CASTRILLON', 'disneybernal24@gmail.com', '55207876', '55207876', '', '3118940036', 1, 'Invitado', 2469966, 1, 'default.png'),
(74186754, 'GOMEZ ORTEGA JUAN CARLOS', 'jcgomezo@sena.edu.co', '74186754', '74186754', '', '3016846460', 2, 'Invitado', 0, 1, 'default.png'),
(80149579, 'LUDWING ARGUELLO MARTINEZ', 'blakiz1980@gmail.com', '80149579', '80149579', '', '3022004352', 1, 'Invitado', 2541039, 1, 'default.png'),
(80168958, 'OSCAR MAURICIO TRIVIÑO PRIETO', 'otrivino@misena.edu.co', '80168958', '80168958', '', '7132079', 1, 'Invitado', 2546882, 1, 'default.png'),
(80206443, 'CARLOS ANDRES SANTIAGO LOSADA', 'hauni@misena.edu.co', '80206443', '80206443', '', 'null', 1, 'Invitado', 2464124, 1, 'default.png'),
(80843912, 'DIEGO ALEXANDER ESQUIVEL CARDENAS', 'diegoskvl@gmail.com', '80843912', '80843912', '', '3118033874', 1, 'Invitado', 2469571, 1, 'default.png'),
(83040918, 'JHONATAN MORALES IMCHIMA', '26jonathan80@gmail.com', '83040918', '83040918', '', 'null', 1, 'Invitado', 2541039, 1, 'default.png'),
(83041641, 'JORGE EDUARDO RIVERA MURCIA', 'jorgeeduardoriveramurcia1@gmail.com', '83041641', '83041641', '', 'null', 1, 'Invitado', 2554406, 1, 'default.png'),
(83042722, 'FERLEY HOYOS MUÑOZ', 'ferley.hoyos.m@misena.edu.co', '83042722', '83042722', '', '3142355226', 2, 'Invitado', 0, 1, 'default.png'),
(83042763, 'ARCOS AVILA CARLOS ANDRES', 'carcosa@misena.edu.co', '83042763', '83042763', '', '3152604380', 2, 'Invitado', 0, 1, 'default.png'),
(83043177, 'RODRIGO HERNANDEZ HERNANDEZ', 'rodriher-95@hotmail.com', '83043177', '83043177', '', '3132453129', 1, 'Invitado', 2500012, 1, 'default.png'),
(83043263, 'FRESNEY ÑAÑEZ HIDALGO', 'najhoy23@gmail.com', '83043263', '83043263', '', '3222183329', 1, 'Invitado', 2451011, 1, 'default.png'),
(83043585, 'LIBARDO ANACONA GOMEZ', 'libardoconagomez@gmail.com', '83043585', '83043585', '', '3102754025', 1, 'Invitado', 2451011, 1, 'default.png'),
(83044206, 'LUCAS ARIEL ORTEGA CALDERON', 'dayafer-@hotmail.com', '83044206', '83044206', '', '3225200541', 1, 'Invitado', 2451011, 1, 'default.png'),
(83090551, 'JUAN ALEXANDER LUGO MUÑOZ', 'lugoalexander83@gmail.com', '83090551', '83090551', '', '3118111620', 2, 'Invitado', 0, 1, 'default.png'),
(83182655, 'JOSE LIZARDO CRUZ PANQUEVA', 'inssofiajre@misena.edu.co', '83182655', '83182655', '', 'null', 1, 'Invitado', 2469966, 1, 'default.png'),
(83211622, 'ADRIAN JOSE ALVAREZ VILLARRUEL', 'timanejo@gmail.com', '83211622', '83211622', '', '3168666409', 2, 'Invitado', 0, 1, 'default.png'),
(83239699, 'MILLER ZAMBRANO PERDOMO', 'bomberosuaza@gmail.com', '83239699', '83239699', '', 'null', 1, 'Invitado', 2469966, 1, 'default.png'),
(83258052, 'CRISTIAN CAMILO VILLARREAL MEDINA', 'crivillarrealm@misena.edu.co', '83258052', '83258052', '', '3106773544', 2, 'Invitado', 0, 1, 'default.png'),
(83258540, 'JARAMILLO CLAROS SERGIO ARMANDO', 'sjaramilloc@sena.edu.co', '83258540', '83258540', '', '3166450475', 2, 'Invitado', 0, 1, 'default.png'),
(85474629, 'YEYSON VALENCIA CARVAJAL', 'Yeysonvalencia32@gmail.com', '85474629', '85474629', '', '3126619879', 1, 'Invitado', 2464124, 1, 'default.png'),
(96361787, 'WILSON MARTINEZ SALDARRIAGA', 'martinez-wilson@hotmail.com', '96361787', '96361787', '', '3167512637', 2, 'Invitado', 0, 1, '96361787.png'),
(1000020841, 'DUVAN FELIPE CASALLAS ZORIANO', 'gatillerosf@gmail.com', '1000020841', '1000020841', '', '3107879890', 1, 'Invitado', 2500096, 1, 'default.png'),
(1000150156, 'KAREN ZULAY MENDEZ GOMEZ', 'karenmendez2425@gmail.com', '1000150156', '1000150156', '', '3209736511', 1, 'Invitado', 2451009, 1, 'default.png'),
(1000158452, 'MELISSA URQUINA MOSQUERA', 'murquinam@gmail.com', '1000158452', '1000158452', '', '3212417970', 1, 'Invitado', 2469966, 1, 'default.png'),
(1000163749, 'CRISTIAN CAMILO PICHICA SALAZAR', 'gamecristian09@gmail.com', '1000163749', '1000163749', '', '3148413032', 1, 'Invitado', 2322432, 1, 'default.png'),
(1000217227, 'KAROL DAYANA RAMIREZ ABAUNZA', 'ka2421737@gmail.com', '1000217227', '1000217227', '', 'null', 1, 'Invitado', 2252425, 1, 'default.png'),
(1000351207, 'FABIO ANDRES BENAVIDES ARCOS', 'andresbenavides500@gmail.com', '1000351207', '1000351207', '', '3123059247', 1, 'Invitado', 2541039, 1, 'default.png'),
(1000464273, 'SEBASTIAN HERNANDEZ SILVA', 'mcseb15@gmail.com', '1000464273', '1000464273', '', '3143047552', 1, 'Invitado', 2554406, 1, 'default.png'),
(1000790396, 'JUAN ESTEBAN ROJAS TOVAR', 'juesrojast03@gmail.com', '1000790396', '1000790396', '', '3124515971', 1, 'Invitado', 2451009, 1, 'default.png'),
(1000796569, 'JUAN ESTEBAN AGUILERA ARAQUE', 'aguileraaraquea@gmail.com', '1000796569', '1000796569', '', '3157096890', 1, 'Invitado', 2236074, 1, 'default.png'),
(1000810038, 'ANDRES MAURICIO MUÑOZ PALADINEZ', 'andresmauriomp123@gmail.com', '1000810038', '1000810038', '', 'null', 1, 'Invitado', 2469570, 1, 'default.png'),
(1000859581, 'CRISTIAN CAMILO CLAROS DELGADO', 'Cristiancamiloclarosdelgado73@gmail.com', '1000859581', '1000859581', '', '3003135345', 1, 'Invitado', 2500012, 1, 'default.png'),
(1001175342, 'DANIEL ANDRES RODRIGUEZ PALMA', 'danielandresrodriguezpalma@gmail.com', '1001175342', '1001175342', '', '3112389338', 1, 'Invitado', 2280193, 1, 'default.png'),
(1001201149, 'JUAN PABLO PLAZAS HERNANDEZ', 'byjuanjetarep777omg@gmail.com', '1001201149', '1001201149', '', '3138790359', 1, 'Invitado', 2426308, 1, 'default.png'),
(1003084761, 'KAREN ESNEIDA GOMEZ SAMBONI', 'kg5669027@gmail.com', '1003084761', '1003084761', '', 'null', 1, 'Invitado', 2280196, 1, 'default.png'),
(1003084857, 'BREINER DAVID ORDOÑEZ ORDOÑEZ', 'davidordo21@gmail.com', '1003084857', '1003084857', '', 'null', 1, 'Invitado', 2468752, 1, 'default.png'),
(1003194252, 'GENSSON ELIER PARRA LOPEZ', 'parragensson@gmail.com', '1003194252', '1003194252', '', '3003133279', 1, 'Invitado', 2500117, 1, 'default.png'),
(1003587606, 'JUAN JOSE PARRA GONZALEZ', 'juanjose11parra@gmail.com', '1003587606', '1003587606', '', '3214247636', 1, 'Invitado', 2500267, 1, 'default.png'),
(1003804280, 'NELSON HUMBERTO PINTO REYES', 'nelsonpinto230@gmail.com', '1003804280', '1003804280', '', '3167873339', 1, 'Invitado', 2451001, 1, 'default.png'),
(1003808338, 'YOAN ESTIVEN BECERRA ZAMBRANO', 'nospicarnal@gmail.com', '1003808338', '1003808338', '', '3209682703', 1, 'Invitado', 2280204, 1, 'default.png'),
(1003809003, 'JUAN JOSE JAIME GUTIERREZ', 'itsjuanjaime@gmail.com', '1003809003', '1003809003', '', '3209683096', 1, 'Invitado', 2426308, 1, 'default.png'),
(1003809079, 'SANTIAGO PAVA CARDOSO', 'pavacardososantiago@gmail.com', '1003809079', '1003809079', '', 'null', 1, 'Invitado', 2500139, 1, 'default.png'),
(1003809090, 'ANGEL GIOVANI VALLEJOS BOLAÑOS', 'angelgiovani305@gmail.com', '1003809090', '1003809090', '', '3115748299', 1, 'Invitado', 2500274, 1, 'default.png'),
(1003809696, 'EVER JESUS IPUZ GARCIA', 'chuzo1114@gmail.com', '1003809696', '1003809696', '', '3127764263', 1, 'Invitado', 2426308, 1, 'default.png'),
(1003818724, 'LAURA VALENTINA MURCIA TRUJILLO', 'valentinatrujillo142002@gmail.com', '1003818724', '1003818724', '', '3107974406', 1, 'Invitado', 2500139, 1, 'default.png'),
(1003819627, 'MARLON ANTONIO SANDOVAL NARVAEZ', 'sandov423@gmail.com', '1003819627', '1003819627', '', '3218452941', 1, 'Invitado', 2500094, 1, 'default.png'),
(1003820025, 'WILFRAN ALEXIS RAMIREZ CLAROS', 'alexeiclaros2019@gmail.com', '1003820025', '1003820025', '', '8330445', 1, 'Invitado', 2469966, 1, 'default.png'),
(1003828830, 'PABLO ESTEBAN HERRERA ALBARRACIN', 'ph6227800@gmail.com', '1003828830', '1003828830', '', '3123578193', 1, 'Invitado', 2500096, 1, 'default.png'),
(1003904540, 'LAURA LUCIA DIAZ SEPULVEDA', 'lldiaz4513@gmail.com', '1003904540', '1003904540', '', 'null', 1, 'Invitado', 2252425, 1, 'default.png'),
(1003993956, 'VANESA ALEXANDRA RAMOS PIMENTEL', 'vanesaalexandraramospimentel@gmail.com', '1003993956', '1003993956', '', '3209061436', 1, 'Invitado', 2451009, 1, 'default.png'),
(1004033606, 'CRISTIAN ALEJANDRO BURBANO VARGAS', 'cristianburbano202@gmail.com', '1004033606', '1004033606', '', '3008312429', 1, 'Invitado', 2500274, 1, 'default.png'),
(1004033637, 'NORBEY GARCES CRISTANCHO', 'gcristanchon@gmail.com', '1004033637', '1004033637', '', '3219655545', 1, 'Invitado', 2469966, 1, 'default.png'),
(1004033754, 'YURANI ALEJANDRA CARDOZO MONCAYO', 'cardozoalejandra0803@gmail.com', '1004033754', '1004033754', '', '3118064981', 1, 'Invitado', 2280204, 1, 'default.png'),
(1004033848, 'ADRIANA LUCIA RAMIREZ MUÑOZ', 'ramirezCathy95@gmail.com', '1004033848', '1004033848', '', '3142258445', 1, 'Invitado', 2500139, 1, 'default.png'),
(1004034070, 'DUBERNEY TORRES TRUJILLO', 'torrestrujilloduverney@gmail.com', '1004034070', '1004034070', '', '3118307044', 1, 'Invitado', 2451011, 1, 'default.png'),
(1004034435, 'JHONIER FELIPE MOTTA LÓPEZ', 'jhonierl129@gmail.com', '1004034435', '1004034435', '', '3133996162', 1, 'Invitado', 2562906, 1, 'default.png'),
(1004034518, 'MARIA JOSE BERNAL CASTRILLON', 'lifernandez2@misena.edu.co', '1004034518', '1004034518', '', 'null', 1, 'Invitado', 2469966, 1, 'default.png'),
(1004034543, 'MAYRA ALEJANDRA MOLINA CURACA', '09mayramolina2003@gmail.com', '1004034543', '1004034543', '', 'null', 1, 'Invitado', 2469570, 1, 'default.png'),
(1004082925, 'MARIO ANDRES BERMEO ROJAS', 'mariobermeorojas@gmail.com', '1004082925', '1004082925', '', 'null', 1, 'Invitado', 2546882, 1, 'default.png'),
(1004083042, 'JAMES ADRIÁN TORRES ROJAS', 'james1004083042@gmail.com', '1004083042', '1004083042', '', '3003227661', 1, 'Invitado', 2500070, 1, 'default.png'),
(1004083051, 'MIGUEL ANGEL ORTIZ OSORIO', 'migue.ortiz1031@gmail.com', '1004083051', '1004083051', '', '3133491555', 1, 'Invitado', 2500096, 1, 'default.png'),
(1004083103, 'LAURA ALEJANDRA RODRIGUEZ PEÑA', 'rodriguezpena311@gmail.com', '1004083103', '1004083103', '', 'null', 1, 'Invitado', 2546882, 1, 'default.png'),
(1004083140, 'JOHAN SEBASTIAN LOPEZ MONTEALEGRE', 'sr.jhoan16@gmail.com', '1004083140', '1004083140', '', '3227670350', 1, 'Invitado', 2326610, 1, 'default.png'),
(1004083165, 'JOHAN SEBASTIAN PINZON AYALA', 'sebaspinzon0204@gmail.com', '1004083165', '1004083165', '', '3102290774', 1, 'Invitado', 2322432, 1, 'default.png'),
(1004083234, 'SANTIAGO URBANO VALDES ORDOÑEZ', 'santiagovaldez528@gmail.com', '1004083234', '1004083234', '', '3115426833', 1, 'Invitado', 2500070, 1, 'default.png'),
(1004083241, 'JAIDER ALFONSO PARDO VALDES', 'jaiderpardo360@gmail.com', '1004083241', '1004083241', '', 'null', 1, 'Invitado', 2500267, 1, 'default.png'),
(1004083428, 'DANA STEFANIA BETANCOURT PUENTES', 'betancourtdanastefania@gmail.com', '1004083428', '1004083428', '', 'null', 1, 'Invitado', 2500267, 1, 'default.png'),
(1004083443, 'JUIAN MATEO HOYOS TOVAR', '3115769069julian@gmail.com', '1004083443', '1004083443', '', 'null', 1, 'Invitado', 2426308, 1, 'default.png'),
(1004083509, 'JAIDER SANTANILLA PEÑA', 'loere2003@gmail.com', '1004083509', '1004083509', '', '3132607035', 1, 'Invitado', 2554406, 1, 'default.png'),
(1004083573, 'DANIEL ANDRES TOVAR COLLAZOS', 'dakita200318@gmail.com', '1004083573', '1004083573', '', '3223861902', 1, 'Invitado', 2546882, 1, 'default.png'),
(1004089108, 'BERKLEY GUILOMBO PALENCIA', 'berkley.guil@gmail.com', '1004089108', '1004089108', '', '3219871268', 1, 'Invitado', 2451001, 1, 'default.png'),
(1004155543, 'JORGE LUIS PLAZAS ROJAS', 'jorgeluisplazas69@gmail.com', '1004155543', '1004155543', '', '3214072809', 1, 'Invitado', 2280193, 1, 'default.png'),
(1004159018, 'JUAN FELIPE RAMOS JIMENEZ', 'felipejimeneztorres0@gmail.com', '1004159018', '1004159018', '', 'null', 1, 'Invitado', 2500139, 1, 'default.png'),
(1004159597, 'OSCAR DAVID VALDERRAMA TOLEDO', 'oscardava2002@gmail.com', '1004159597', '1004159597', '', '3507503735', 1, 'Invitado', 2236073, 1, 'default.png'),
(1004208883, 'FABIANA TRIVIÑO ANACONA', 'fabianaanacona@gmail.com', '1004208883', '1004208883', '', '3155316336', 1, 'Invitado', 2469571, 1, 'default.png'),
(1004208884, 'JOHAN DAVID CALDERON BUITRON', 'calderonjohan169@gmail.com', '1004208884', '1004208884', '', 'null', 1, 'Invitado', 2236073, 1, 'default.png'),
(1004208963, 'MAICOL STIVEN AGUDELO PRADA', 'michaelstivenprada@gmail.com', '1004208963', '1004208963', '', '3178423820', 1, 'Invitado', 2554406, 1, 'default.png'),
(1004209099, 'SIGIFREDO CARVAJAL NARVAEZ', 'scarvajalnarvaez@gmail.com', '1004209099', '1004209099', '', '3108638359', 1, 'Invitado', 2500094, 1, 'default.png'),
(1004209154, 'MABELROCIO ROJAS ESPAÑA', 'rojasmabel.113@gmail.com', '1004209154', '1004209154', '', '3024952251', 1, 'Invitado', 2426308, 1, 'default.png'),
(1004209716, 'DAYANA ELENA CASTAÑEDA NIETO', 'dayanaelenacastanedanieto@gmail.com', '1004209716', '1004209716', '', '3232201045', 1, 'Invitado', 2469571, 1, 'default.png'),
(1004251310, 'ANGELA JULLIETH PACHECO PARRA', 'pachequita2003@gmail.com', '1004251310', '1004251310', '', '3003465412', 1, 'Invitado', 2546882, 1, 'default.png'),
(1004252274, 'DANIELA ALEXANDRA AROCA CRUZ', 'danielaaroca214@gmail.com', '1004252274', '1004252274', '', '3117492724', 1, 'Invitado', 2500117, 1, 'default.png'),
(1004253201, 'YULEIMA LOSADA MENESES', 'angel.1969meneses@gmail.com', '1004253201', '1004253201', '', '3224017396', 1, 'Invitado', 2500070, 1, 'default.png'),
(1004266092, 'JUAN PABLO CAMACHO SAMBONI', 'Camachosambonijuanpablo@gmail.com', '1004266092', '1004266092', '', '3214094823', 1, 'Invitado', 2469570, 1, 'default.png'),
(1004266866, 'PAOLA ANDREA MAMIAN MESA', 'paolamesa2098@gmail.com', '1004266866', '1004266866', '', '3133051551', 1, 'Invitado', 2280193, 1, 'default.png'),
(1004269053, 'YERSON FABIAN HOYOS CLAROS', 'yersonfabianhoyosclaros@gmail.com', '1004269053', '1004269053', '', 'null', 1, 'Invitado', 2500094, 1, 'default.png'),
(1004269111, 'NATALIA ARCOS PERDOMO', 'arcos8596@gmail.com', '1004269111', '1004269111', '', '3123197768', 1, 'Invitado', 2280193, 1, 'default.png'),
(1004269123, 'CAROLINA MUÑOZ MUÑOZ', 'cm7283155@gmail.com', '1004269123', '1004269123', '', '3227609991', 1, 'Invitado', 2326610, 1, 'default.png'),
(1004269260, 'DUVAN FELIPE PEÑA VALDERRAMA', 'dunfeli977@gmail.com', '1004269260', '1004269260', '', 'null', 1, 'Invitado', 2500274, 1, 'default.png'),
(1004269773, 'KAREN JULIANA PALADINES PIAMBA', 'julianapaladinespiamba@gmail.com', '1004269773', '1004269773', '', 'null', 1, 'Invitado', 2500139, 1, 'default.png'),
(1004300615, 'ESTEFANIA SANCHEZ ESPAÑA', 'estefaniasanchezespana@gmail.com', '1004300615', '1004300615', '', '3213244195', 1, 'Invitado', 2500117, 1, 'default.png'),
(1004303259, 'BREYNER ANDRES PUENTES PARRA', 'jmiriarte@sena.edu.co', '1004303259', '1004303259', '', '3123103499', 1, 'Invitado', 2500274, 1, 'default.png'),
(1004343518, 'DEIMER GIOVAVANNY ANACONA BURBANO', 'CORREO@MISENA.EDU.CO', '1004343518', '1004343518', '', '3224231826', 1, 'Invitado', 2468752, 1, 'default.png'),
(1004343648, 'ARLINSON GENOY ERAZO', 'genoy7064942@gmail.com', '1004343648', '1004343648', '', 'null', 1, 'Invitado', 2546882, 1, 'default.png'),
(1004343963, 'NEIDER ANDRES SILVA GARZON', 'garzonandres629@gmail.com', '1004343963', '1004343963', '', 'null', 1, 'Invitado', 2500096, 1, 'default.png'),
(1004417074, 'VALENTINA PEREZ SUAREZ', 'valentinaperez9912@gmail.com', '1004417074', '1004417074', '', '3228012940', 1, 'Invitado', 2554406, 1, 'default.png'),
(1004417133, 'JOHANA VALENTINA LUNA LUNA', 'jvluna93@outlook.com', '1004417133', '1004417133', '', '3208279406', 1, 'Invitado', 2500274, 1, 'default.png'),
(1004417302, 'TANIA ALEJANDRA MENDOZA MEDINA', 'alejamendo02@gmail.com', '1004417302', '1004417302', '', '3132140695', 1, 'Invitado', 2236073, 1, 'default.png'),
(1004417474, 'JHONY ALEXANDER MACIAS SALINAS', 'alexsalinas2705@gmail.com', '1004417474', '1004417474', '', 'null', 1, 'Invitado', 2541039, 1, 'default.png'),
(1004417536, 'NARLY YIRLEY CAMPOS MUÑOZ', 'narlyyirley2012@gmail.com', '1004417536', '1004417536', '', '3177757073', 1, 'Invitado', 2546882, 1, 'default.png'),
(1004418004, 'STIVEN ROMERO SALAZAR', 'stivenromerosalazar17@gmail.com', '1004418004', '1004418004', '', '3186339782', 1, 'Invitado', 2500070, 1, 'default.png'),
(1004418281, 'TALUA JULIANA ROJAS CHAVARRO', 'tjrojas03@gmail.com', '1004418281', '1004418281', '', '3178182114', 1, 'Invitado', 2451001, 1, 'default.png'),
(1004418348, 'JOSE YANCARLOS VELA ORDOÑEZ', 'jyvela8@misena.edu.co', '1004418348', '1004418348', '', '3143376807', 1, 'Invitado', 2186843, 1, 'default.png'),
(1004418358, 'JHON ALEXANDER CUAJI VALENCIA', 'jhon2003alexander03@gmail.com', '1004418358', '1004418358', '', 'null', 1, 'Invitado', 2469571, 1, 'default.png'),
(1004418425, 'LUISA FERNANDA POLANIA SIERRA', 'luisafernandapolaniasierra11@gmail.com', '1004418425', '1004418425', '', '3112920521', 1, 'Invitado', 2451001, 1, 'default.png'),
(1004418676, 'SERGIO ANDRES PIAMBA ORTIZ', 'sergiopiamba27@gmail.com', '1004418676', '1004418676', '', '3232223974', 1, 'Invitado', 2469571, 1, 'default.png'),
(1004419101, 'ANDERSON ESTIVEN SOTELO GUAMANGA', 'andersonsotelo619@gmail.com', '1004419101', '1004419101', '', '3143158883', 1, 'Invitado', 2280193, 1, 'default.png'),
(1004419343, 'MANUEL ESTEBAN HOYOS VARGAS', 'mlrojas653@misena.edu.co', '1004419343', '1004419343', '', '3142748557', 1, 'Invitado', 2500139, 1, 'default.png'),
(1004440089, 'YINA MARCELA ROMERO ILES', 'marcelailes18@gmail.com', '1004440089', '1004440089', '', '3138726564', 1, 'Invitado', 2280193, 1, 'default.png'),
(1004440257, 'ANGELICA PAOLA BUESAQUILLO MUÑOZ', 'lucianamuzz02@gmail.com', '1004440257', '1004440257', '', '3001233456', 1, 'Invitado', 2500070, 1, 'default.png'),
(1004440429, 'MAICOL STIVEN MUÑOZ PALADINES', 'munosmaicol110@gmail.com', '1004440429', '1004440429', '', '3106076809', 1, 'Invitado', 2469570, 1, 'default.png'),
(1004440489, 'ANDERSON JOHAN BELTRAN CARVAJAL', 'anderbeltr1234@gmail.com', '1004440489', '1004440489', '', 'null', 1, 'Invitado', 2280196, 1, 'default.png'),
(1004440496, 'SEBASTIAN STEVEN RODRIGUEZ MUÑOZ', 'sebastiansteven402@gmail.com', '1004440496', '1004440496', '', '3122077128', 1, 'Invitado', 2469570, 1, 'default.png'),
(1004440838, 'CRISTIAN DAVID NUÑEZ URBANO', 'cdnu2320@gmail.com', '1004440838', '1004440838', '', '3153552949', 1, 'Invitado', 2252425, 1, 'default.png'),
(1004440891, 'YURANY BRAVO CHILITO', 'yuranybravo2003@gmail.com', '1004440891', '1004440891', '', '3133086686', 1, 'Invitado', 2469571, 1, 'default.png'),
(1004441291, 'MARBY NATALIA CANTILLO BURBANO', 'nataliacantilloburbano1@gmail.com', '1004441291', '1004441291', '', '3154545813', 1, 'Invitado', 2469571, 1, 'default.png'),
(1004441721, 'DIEGO ARMANDO SANTIAGO PIAMBA', 'Santiagopiamba0725@gmail.com', '1004441721', '1004441721', '', '3153970756', 1, 'Invitado', 2464124, 1, 'default.png'),
(1004442136, 'ANDRES FELIPE VARGAS CORREA', 'correafelipe728@gmail.com', '1004442136', '1004442136', '', '3209774611', 1, 'Invitado', 2451001, 1, 'default.png'),
(1004442716, 'YERSON CERON CARVAJAL', 'yceroncarvajal@gmail.com', '1004442716', '1004442716', '', '3153625923', 1, 'Invitado', 2322432, 1, 'default.png'),
(1004442867, 'ANDREINA HERNANDEZ SOLIS', 'andreinahernandez031@gmail.com', '1004442867', '1004442867', '', '3132533437', 1, 'Invitado', 2280193, 1, 'default.png'),
(1004443018, 'NESTOR ALDAIR CASTILLO CERON', 'nestorcastillo570@gmail.com', '1004443018', '1004443018', '', '3207680775', 1, 'Invitado', 2469570, 1, 'default.png'),
(1004443110, 'ESTEBAN CERON ASTUDILLO', 'ceronastudilloesteban@gmail.com', '1004443110', '1004443110', '', '3219829028', 1, 'Invitado', 2554406, 1, 'default.png'),
(1004443143, 'JORGE ARMANDO LOSADA RODRIGUEZ', 'jorrgelosada442@gmail.com', '1004443143', '1004443143', '', '3219474158', 1, 'Invitado', 2469582, 1, 'default.png'),
(1004446208, 'DANIEL RICARDO RAMOS ALARCON', 'daniel200295@outlook.com', '1004446208', '1004446208', '', '3112222222', 1, 'Invitado', 2469570, 1, 'default.png'),
(1004446215, 'OSCAR DAVID VIDAL RODRIGUEZ', 'espacioenblanco07@hotmail.com', '1004446215', '1004446215', '', '3117470359', 1, 'Invitado', 2500094, 1, 'default.png'),
(1004446242, 'FABIAN ANDRES GUALI ARREDONDO', 'fabiangualy29@gmail.com', '1004446242', '1004446242', '', '3166508143', 1, 'Invitado', 2500267, 1, 'default.png'),
(1004446406, 'KAREN SOFIA MESA JIMENEZ', 'sofiamesa1606@gmail.com', '1004446406', '1004446406', 'Pitalito', '3222924132', 1, 'Invitado', 2252406, 1, 'default.png'),
(1004446438, 'YULIANA GUZMAN GIL', 'Yg591192@gmail.com', '1004446438', '1004446438', '', '3213436899', 1, 'Invitado', 2451001, 1, 'default.png'),
(1004446520, 'MARILY ZULETA ROJAS', 'marily3zuleta@gmail.com', '1004446520', '1004446520', '', '3007726299', 1, 'Invitado', 2236074, 1, 'default.png'),
(1004446590, 'DIEGO ALEXANDER HENAO ROJAS', 'diegohenao1010@gmail.com', '1004446590', '1004446590', '', '3232897434', 1, 'Invitado', 2500012, 1, 'default.png'),
(1004446667, 'JORGE LUIS TORRENTE ROJAS', 'jorgetorrenterojas11@gmail.com', '1004446667', '1004446667', '', '3118538373', 1, 'Invitado', 2562906, 1, 'default.png'),
(1004446668, 'BRAYAN STIVEN MUÑOZ BURGOS', 'munozburgosbrayanstiven@gmail.com', '1004446668', '1004446668', '', '3003203901', 1, 'Invitado', 2541039, 1, 'default.png'),
(1004446691, 'JOHAN SEBASTIAN MUÑOZ LUNA', 'sebastian30177@gmail.com', '1004446691', '1004446691', '', '3142456590', 1, 'Invitado', 2500117, 1, 'default.png'),
(1004446738, 'LAURA VALENTINA GONZALEZ ZULUAGA', 'valengz2003a@gmail.com', '1004446738', '1004446738', '', '3183979682', 1, 'Invitado', 2500096, 1, 'default.png'),
(1004472698, 'JUAN DAVID CARLOSI BOLAÑOS', 'jdavidcarlosi2003@gmail.com', '1004472698', '1004472698', '', '3008256370', 1, 'Invitado', 2500096, 1, 'default.png'),
(1004492772, 'YEISON ARLEY CABRERA BUESAQUILLO', 'yeisonacabrerab@gmail.com', '1004492772', '1004492772', '', '3118495333', 1, 'Invitado', 2326610, 1, 'default.png'),
(1004492809, 'KAREN DAYANA GARCIA CASTRO', 'karda.garciacastro@gmail.com', '1004492809', '1004492809', '', '3225619088', 1, 'Invitado', 2280204, 1, 'default.png'),
(1004492967, 'MARLY CALDERON ROJAS', 'arlexcalderon27@gmail.com', '1004492967', '1004492967', '', 'null', 1, 'Invitado', 2280196, 1, 'default.png'),
(1004493117, 'VICTOR MANUEL MURCIA CUELLAR', 'vimamucu7@gmail.com', '1004493117', '1004493117', '', 'null', 1, 'Invitado', 2280204, 1, 'default.png'),
(1004493536, 'YESSICA CALDERON ROJAS', 'yesiicacalderonrojas@gmail.com', '1004493536', '1004493536', '', 'null', 1, 'Invitado', 2280196, 1, 'default.png'),
(1004719962, 'YULIANA ANDREA ORTIZ CORDOBA', 'ingrid.dahianna.ortiz@gmail.com', '1004719962', '1004719962', '', '3168864568', 1, 'Invitado', 2469966, 1, 'default.png'),
(1004720037, 'INGRID DAHIANNA ORTIZ CORDOBA', 'ingrid.dahianna.ortiz@gmail.com', '1004720037', '1004720037', '', '3212197923', 1, 'Invitado', 2469966, 1, 'default.png'),
(1004871362, 'JUAN FELIPE IMBACHI BURBANO', 'crazyshadowgd322@gmail.com', '1004871362', '1004871362', '', '3115415512', 1, 'Invitado', 2322432, 1, 'default.png'),
(1005706529, 'JUAN JOSE OVIEDO RODRIGUEZ', 'j.o.r.sandoval13@gmail.com', '1005706529', '1005706529', '', '3223943356', 1, 'Invitado', 2451009, 1, 'default.png'),
(1006028956, 'DANNY LICETH HORTUA PRADA', 'lizpra2002@gmail.com', '1006028956', '1006028956', '', '3228067797', 1, 'Invitado', 2500096, 1, 'default.png'),
(1006093869, 'RODOLFO PRADA YATE', 'rodolfoyate7@gmail.com', '1006093869', '1006093869', '', '3002345879', 1, 'Invitado', 2546882, 1, 'default.png'),
(1006148286, 'MARIA ALEJANDRA BARRIOS SANCHEZ', 'mariaalejandrabarriossanchez3@gmail.com', '1006148286', '1006148286', '', 'null', 1, 'Invitado', 2280196, 1, 'default.png'),
(1006343815, 'CARLOS ANDRES SAN JUAN PERDOMO', 'sanjuanperdomocarlos@gmail.com', '1006343815', '1006343815', '', '3143318234', 1, 'Invitado', 2500094, 1, 'default.png'),
(1006419559, 'CARLOS SEBASTIAN LIZCANO CULMA', 'slizcano044@gmail.com', '1006419559', '1006419559', '', '3003142838', 1, 'Invitado', 2554406, 1, 'default.png'),
(1006458352, 'YERSON ANTONIO RAMIREZ ROJAS', 'yerson99991@gmail.com', '1006458352', '1006458352', '', '3003333333', 1, 'Invitado', 2541039, 1, 'default.png'),
(1006466052, 'NATALIA BEDOYA TORRES', 'nataliabedoyatorres@gmail.com', '1006466052', '1006466052', '', '3204413940', 1, 'Invitado', 2562906, 1, 'default.png'),
(1006484745, 'DIEGO ANACONA ARTUNDUAGA', 'anaconadiego74@gmail.com', '1006484745', '1006484745', '', '3204873602', 1, 'Invitado', 2280193, 1, 'default.png'),
(1006487502, 'ELIZABETH SALINAS PEREZ', 'lcorpasc@gmail.com', '1006487502', '1006487502', '', '3228913162', 1, 'Invitado', 2562906, 1, 'default.png'),
(1006511378, 'LAURA FERNANDA TORRES FAJARDO', 'torresfajardolaurafernanda@gmail.com', '1006511378', '1006511378', '', '3224828120', 1, 'Invitado', 2500096, 1, 'default.png'),
(1006515089, 'JUAN DIEGO ARISTIZABAL MARTINEZ', 'jamis9808@gmail.com', '1006515089', '1006515089', '', '3112903859', 1, 'Invitado', 2500274, 1, 'default.png'),
(1006516377, 'CRISTIAN CABRERA CALDERON', 'cristianmorocho05@gmail.com', '1006516377', '1006516377', '', '3202237380', 1, 'Invitado', 2468752, 1, 'default.png'),
(1006526359, 'MARLY JULIETH VALENCIA BERMUDEZ', 'valenciamarly35@gmail.com', '1006526359', '1006526359', '', '312 8978273', 1, 'Invitado', 2500012, 1, 'default.png'),
(1006549645, 'LUBER ARLEY PARRA LOZADA', '1.aran.lap@gmail.com', '1006549645', '1006549645', '', 'null', 1, 'Invitado', 2500096, 1, 'default.png'),
(1006947348, 'EDINSON DAVID BARRERA LUGO', 'krt847@gmail.com', '1006947348', '1006947348', 'Pitalito', '3102833525', 1, 'Invitado', 2252407, 1, '1006947348.png'),
(1006956707, 'YEIMI KATHERINE PEÑA ARIZA', 'arizayeimi28@gmail.com', '1006956707', '1006956707', 'cll 17 #14b-11', '3223836120', 1, 'Invitado', 2280204, 1, '1006956707.png'),
(1006957091, 'YASLEDY VARGAS CONDA', 'yasledyvargasconda@gmail.com', '1006957091', '1006957091', '', '3134312916', 1, 'Invitado', 2322432, 1, 'default.png'),
(1006996169, 'DANNA LLYBEE BENAVIDES TAQUINAS', 'danna.benavidez.indijena@gmail.com', '1006996169', '1006996169', '', '3207181935', 1, 'Invitado', 2500267, 1, 'default.png'),
(1007162967, 'CARLOS ALBERTO CLAVIJO TELLEZ', 'tecnicocafe2020@gmail.com', '1007162967', '1007162967', '', 'null', 1, 'Invitado', 2469570, 1, 'default.png'),
(1007162992, 'SANTIAGO RUANO CARDENAS', 'santiagocardenas123sis@gmail.com', '1007162992', '1007162992', '', '3124643302', 1, 'Invitado', 2541039, 1, 'default.png'),
(1007163022, 'MARIA FERNANDA ILES RUIZ', 'mfruiz1304@gmail.com', '1007163022', '1007163022', '', '3213829236', 1, 'Invitado', 2280196, 1, 'default.png'),
(1007163028, 'INGRID YURLEY CALDERON DIAZ', 'calderoningridyurley@gmail.com', '1007163028', '1007163028', 'Pitalito', '3107947580', 9, 'Invitado', 0, 1, 'default.png'),
(1007163048, 'DALIXON ULCUE GOMEZ', 'dalixong@gmail.com', '1007163048', '1007163048', '', '3142372224', 1, 'Invitado', 2562906, 1, 'default.png'),
(1007163116, 'YASBERLY BRAVO TORRES', 'torresyasberli@gmail.com', '1007163116', '1007163116', '', '3125400936', 1, 'Invitado', 2469571, 1, 'default.png'),
(1007163198, 'JUAN SEBASTIAN PENAGOS MOSQUERA', 'penagosmosquerajuansebastian@gmail.com', '1007163198', '1007163198', '', '3172976649', 1, 'Invitado', 2280196, 1, 'default.png'),
(1007163257, 'SARA NATALIA SALAS TRUJILLO', 'saritasalas2323@gmail.com', '1007163257', '1007163257', '', '3108769552', 1, 'Invitado', 2280193, 1, 'default.png'),
(1007163412, 'JUAN MANUEL CLAROS TRUJILLO', 'jmclaros839@gmail.com', '1007163412', '1007163412', '', '3204334938', 1, 'Invitado', 2500012, 1, 'default.png'),
(1007163437, 'ANDRES FELIPE MENDEZ JIMENEZ', 'fmfelinator23@gmail.com', '1007163437', '1007163437', '', '3224165449', 1, 'Invitado', 2280204, 1, 'default.png'),
(1007163482, 'DIEGO ANTONIO SALAZAR OSPINA', 'diegosalazae2003@gmail.com', '1007163482', '1007163482', '', 'null', 1, 'Invitado', 2326610, 1, 'default.png'),
(1007163760, 'JHON SEBASTIAN MARTINEZ CALDERON', '1610jhonsebastian@gmail.com', '1007163760', '1007163760', '', '3138420115', 1, 'Invitado', 2500012, 1, 'default.png'),
(1007163826, 'CAMILA CACERES MORA', 'camilacaceresmora2003@gmail.com', '1007163826', '1007163826', '', '3154999223', 1, 'Invitado', 2451009, 1, 'default.png'),
(1007163863, 'INGRID VANESA IMBACHI GALINDEZ', 'vanesaimbachi2003@gmail.com', '1007163863', '1007163863', '', '3108913236', 1, 'Invitado', 2500117, 1, 'default.png'),
(1007194201, 'LAURA CAMILA BRAVO BRAVO', 'bravocamila965@gmail.com', '1007194201', '1007194201', '', '3132375546', 1, 'Invitado', 2280196, 1, 'default.png'),
(1007194241, 'NICOLAS BARRERA MENESES', 'nico07barrera@gmail.com', '1007194241', '1007194241', '', '3134208365', 1, 'Invitado', 2541039, 1, 'default.png'),
(1007248979, 'CARMENZA SUAREZ VITECHE', 'vitechecarmenza@gmail.com', '1007248979', '1007248979', '', '3144180967', 1, 'Invitado', 2280193, 1, 'default.png'),
(1007258878, 'DANNA SOFIA PAREDES MUÑOZ', 'dannasofiaparedesmunoz@gmail.com', '1007258878', '1007258878', '', '3142755354', 1, 'Invitado', 2469571, 1, 'default.png'),
(1007284147, 'DAYRON ANDRES VIDAL SALAZAR', 'salazardayronandres@gmail.com', '1007284147', '1007284147', '', '3117885837', 1, 'Invitado', 2500267, 1, 'default.png'),
(1007284692, 'LUISA FERNANDA ORTIZ SANCHEZ', 'fo9424567@gmail.com', '1007284692', '1007284692', '', '3204587203', 1, 'Invitado', 2546882, 1, 'default.png'),
(1007284898, 'CHARLIE FABIAN PAJOY ZUÑIGA', 'charliepajoy794@gmail.com', '1007284898', '1007284898', '', '3112278932', 1, 'Invitado', 2500117, 1, 'default.png'),
(1007308067, 'JUAN SEBASTIAN ROJAS ROJAS', 'rojasrojasjuansebastian1802@gmail.com', '1007308067', '1007308067', '', '3144037894', 1, 'Invitado', 2500012, 1, 'default.png'),
(1007308221, 'VALENTINA TORRES GOMEZ', 'Valtogo1299@gmail.com', '1007308221', '1007308221', '', '3508076650', 1, 'Invitado', 2500096, 1, 'default.png'),
(1007319294, 'JESSICA YULIETH ORTIZ MENESES', 'alexisamormio7@gmail.com.co', '1007319294', '1007319294', '', 'null', 1, 'Invitado', 2554406, 1, 'default.png'),
(1007328021, 'LEIDI DAYANA VELASQUEZ CLAROS', 'velasquezclarosdayana7@gmail.com', '1007328021', '1007328021', '', '3214968827', 1, 'Invitado', 2500012, 1, 'default.png'),
(1007328066, 'DIANA MARCELA CRUZ CRUZ', 'dcruzcruz54@gmail.com', '1007328066', '1007328066', '', 'null', 1, 'Invitado', 2280196, 1, 'default.png'),
(1007328233, 'YOHAN SEBASTIAN BURBANO MUÑOZ', 'sebastianburbano50@gmail.com', '1007328233', '1007328233', '', 'null', 1, 'Invitado', 2541039, 1, 'default.png'),
(1007336062, 'SHIRLEY GONZALEZ PLAZA', 'shirgos2002@gmail.com', '1007336062', '1007336062', '', '3138447746', 1, 'Invitado', 2236073, 1, 'default.png'),
(1007336856, 'ANDERSON DELGADO CASTILLO', 'delgadoanderson403@gmail.com', '1007336856', '1007336856', '', '3228729930', 1, 'Invitado', 2554406, 1, 'default.png'),
(1007337191, 'DAVID CAMILO CALDERON MUÑOZ', 'kamiloptcalderon01@gmail.com', '1007337191', '1007337191', '', '3158675265', 1, 'Invitado', 2500117, 1, 'default.png'),
(1007353960, 'KAREN VIVIANA TOCONAS BERNAL', 'karenylucia2017@gmail.com', '1007353960', '1007353960', '', 'null', 1, 'Invitado', 2469966, 1, 'default.png'),
(1007359756, 'DIEGO FERNANDO MURCIA ESPINOSA', 'dmurcia317@gmail.com', '1007359756', '1007359756', '', 'null', 1, 'Invitado', 2500096, 1, 'default.png'),
(1007361222, 'MILDRETH LORENA PAPAMIJA SAMBONY', 'lorenapapamija2001@gmail.com', '1007361222', '1007361222', 'Calle 18B#13B-06', '3133068975', 1, 'Invitado', 2280204, 1, '1007361222.png'),
(1007361298, 'ANDREA YISETH PALADINEZ CERON', 'andreapaladinez01@gmail.com', '1007361298', '1007361298', '', '3133542539', 1, 'Invitado', 2280196, 1, 'default.png'),
(1007385839, 'JULIANA CAROLINA ROJAS MOLINA', 'rojasjuliana2019@gmail.com', '1007385839', '1007385839', '', '3153264640', 1, 'Invitado', 2562906, 1, 'default.png'),
(1007389965, 'EMERSON REMISIO GOMEZ', 'actualizar@misena.edu.co', '1007389965', '1007389965', '', 'null', 1, 'Invitado', 2469966, 1, 'default.png'),
(1007392296, 'OSCAR FABIAN SOTELO GIRONZA', 'ofsotelo6@misena.edu.co', '1007392296', '1007392296', '', '3222744084', 1, 'Invitado', 2186843, 1, 'default.png'),
(1007392979, 'YERLANY MARTINEZ SCARPETTA', 'yerlanymartinez26@gmail.com', '1007392979', '1007392979', '', '3003133437', 1, 'Invitado', 2562906, 1, 'default.png'),
(1007411698, 'YERLI TATIANA BOLAÑOS PIAMBA', 'yerlibpiamba2920@gmail.com', '1007411698', '1007411698', 'Pitalito', '3104954979', 9, 'Invitado', 0, 1, 'default.png'),
(1007431093, 'LEIDY KATHERINE CHILITO GUZMAN', 'leidi.katerine-2000@hotmail.es', '1007431093', '1007431093', '', '3182149420', 1, 'Invitado', 2500117, 1, 'default.png'),
(1007431193, 'JUAN DAVID GUERRERO CAMARGO', 'juandavid55112@gmail.com', '1007431193', '1007431193', '', '3024588219', 1, 'Invitado', 2546882, 1, 'default.png'),
(1007443930, 'KAROL JULIETH ALVARADO DELGADO', 'karolhobana@gmail.com', '1007443930', '1007443930', '', '3143032495', 1, 'Invitado', 2546882, 1, 'default.png'),
(1007475186, 'DAYANA LIZETH CLAROS CAICEDO', 'claroscaicedodayana@gmail.com', '1007475186', '1007475186', '', 'null', 1, 'Invitado', 2252425, 1, 'default.png'),
(1007502651, 'HAMIR ORTIZ CRUZ', 'Hamirc93@gmail.com', '1007502651', '1007502651', '', '3164347699', 1, 'Invitado', 2280204, 1, '1007502651.png'),
(1007502778, 'JAMERZON ESTIBEN NUÑEZ MUÑOZ', '123jamerzon123@gmail.com', '1007502778', '1007502778', '', '3155067424', 1, 'Invitado', 2280193, 1, 'default.png'),
(1007521262, 'ANGELA MILENA RUIZ PIMENTEL', 'angela.desep@gmail.com', '1007521262', '1007521262', '', 'null', 1, 'Invitado', 2500012, 1, 'default.png'),
(1007521310, 'CAROL ESNEIDER MOTTA SOTO', 'motta1esneider@gmail.com', '1007521310', '1007521310', '', '3002374903', 1, 'Invitado', 2554406, 1, 'default.png'),
(1007524869, 'MARYURY SABI CHARRY', 'maryurysacha@gmail.com', '1007524869', '1007524869', '', '3227280602', 1, 'Invitado', 2236074, 1, 'default.png'),
(1007531396, 'GLORIA PEDRAZA AVILA', 'gloriapedrazaavila4@gmail.com', '1007531396', '1007531396', '', '3174895713', 1, 'Invitado', 2469966, 1, 'default.png'),
(1007531583, 'GABRIELA ALEJANDRA BRAVO REALPE', 'alejandrarealpe67@gmail.com', '1007531583', '1007531583', '', '3153060823', 1, 'Invitado', 2546882, 1, 'default.png'),
(1007531657, 'LUISA FERNANDA RAMIREZ MONTOYA', 'luisafw123@gmail.com', '1007531657', '1007531657', '', '3202576701', 1, 'Vocero', 2280204, 1, '1007531657.png'),
(1007563060, 'JHOAN LEANDRO CLAROS ROJAS', 'jotacecla5@gmail.com', '1007563060', '1007563060', '', '3145192087', 1, 'Invitado', 2426308, 1, 'default.png'),
(1007563064, 'DARWIN ALEXIS VARGAS QUISABONI', 'vargasdarwin468@gmail.com', '1007563064', '1007563064', '', 'null', 1, 'Invitado', 2236073, 1, 'default.png'),
(1007563110, 'JASBLEY ADRIANA MUÑOZ GOMEZ', 'jasbleyadrianamunozgomez@gmail.com', '1007563110', '1007563110', '', '3224156650', 1, 'Invitado', 2500117, 1, 'default.png'),
(1007563113, 'KEVIN STIVEN MURCIA BOLAÑOS', 'kmurcia1110@gmail.com', '1007563113', '1007563113', '', '3219413204', 1, 'Invitado', 2326610, 1, 'default.png'),
(1007569237, 'KAROL XIOMARA ROJAS SORIANO', 'karolxiomararojassoriano@gmail.com', '1007569237', '1007569237', '', 'null', 1, 'Invitado', 2236074, 1, 'default.png'),
(1007576011, 'FELIPE ROJAS REYES', 'kinrojas2@gmail.com', '1007576011', '1007576011', '', '3125671196', 1, 'Invitado', 2236074, 1, 'default.png'),
(1007587017, 'ANDERSON CASTRO BARRERA', 'castrobarreraanderson@gmail.com', '1007587017', '1007587017', '', '3058342344', 1, 'Invitado', 2451011, 1, 'default.png'),
(1007587139, 'JUAN PABLO HERNANDEZ MEDINA', 'juanhernandezmedina715@gmail.com', '1007587139', '1007587139', '', '3203433651', 1, 'Invitado', 2280193, 1, 'default.png'),
(1007587211, 'YURI NATALIA TORRES BOLAÑOS', 'natalia.torrez75@gmail.com', '1007587211', '1007587211', '', '3176195430', 1, 'Invitado', 2451009, 1, 'default.png'),
(1007587259, 'CARLA GUTIERREZ ALVARADO', 'kg6198680@gmail.com', '1007587259', '1007587259', '', 'null', 1, 'Invitado', 2236073, 1, 'default.png'),
(1007600279, 'DANIEL ALEJANDRO HURTADO LEON', 'danielhurtad8@gmail.com', '1007600279', '1007600279', '', '3212128517', 1, 'Invitado', 2500096, 1, 'default.png'),
(1007600571, 'DANIEL STIVEN BRAVO BOLAÑOZ', 'danielrinconbravo40@gmail.com', '1007600571', '1007600571', '', '3132248804', 1, 'Invitado', 2326610, 1, 'default.png'),
(1007600688, 'LUIS ALBERTO CAMAYO MANQUILLO', 'albertocamayo68@gmail.com', '1007600688', '1007600688', '', 'null', 1, 'Invitado', 2500070, 1, 'default.png'),
(1007600715, 'SANDRA CUCHIMBA STERLING', 'sandracuchimba2001@gmail.com', '1007600715', '1007600715', '', '3112379591', 1, 'Invitado', 2236073, 1, 'default.png'),
(1007659332, 'KAREN LISETH TRUJILLO CALDERÓN', 'zurdatc31@gmail.com', '1007659332', '1007659332', '', '3229014845', 1, 'Invitado', 2500070, 1, 'default.png'),
(1007659333, 'CRISTIAN ALEJANDRO QUINTERO BENAVIDES', 'quinterobenavidesc@gmail.com', '1007659333', '1007659333', '', '3224177945', 1, 'Invitado', 2280193, 1, 'default.png'),
(1007695751, 'DIDIER PAIVA JACOBO', 'paivadidier09@gmail.com', '1007695751', '1007695751', '', '3123935312', 1, 'Invitado', 2500274, 1, 'default.png'),
(1007705577, 'JHON FREDDY SUAREZ RESTREPO', 'jhons10077@gmail.com', '1007705577', '1007705577', '', '3203160790', 1, 'Invitado', 2426308, 1, 'default.png'),
(1007741546, 'CARLOS ARBELY FERNANDEZ ESPAÑA', 'carlosfernan411@gmail.com', '1007741546', '1007741546', '', '3102131585', 1, 'Invitado', 2500139, 1, 'default.png'),
(1007745181, 'LINA PAOLA OCHOA FAJARDO', 'linapaolaochoafajardo7@gmail.com', '1007745181', '1007745181', '', 'null', 1, 'Invitado', 2546882, 1, 'default.png'),
(1007745216, 'SEBASTIAN RENDON VARGAS', 'sereva8501@gmail.com', '1007745216', '1007745216', '', '3133007933', 1, 'Invitado', 2280204, 1, '1007745216.png'),
(1007745282, 'LEIDER FABIAN ALVAREZ RIVERA', 'leiderfabianalvarez2354@gmail.com', '1007745282', '1007745282', '', 'null', 1, 'Invitado', 2500070, 1, 'default.png'),
(1007745315, 'ANDRES ALFREDO JOJOA SAPUY', 'andresjojoa.203@gmail.com', '1007745315', '1007745315', '', '3223216418', 1, 'Invitado', 2426308, 1, 'default.png'),
(1007745330, 'LUIS CARLOS PERDOMO ARIAS', 'luiskarlosperdomo@gmail.com', '1007745330', '1007745330', '', '3202304024', 1, 'Invitado', 2500012, 1, 'default.png'),
(1007745334, 'JUAN DIEGO ZUÑIGA BOLAÑOS', 'juanmate07@outlook.com', '1007745334', '1007745334', '', '3178005067', 1, 'Invitado', 2500012, 1, 'default.png'),
(1007745499, 'JHOYNER STEVEN MARTINEZ VARGAS', 'lilijhoy16@gmail.com', '1007745499', '1007745499', '', 'null', 1, 'Invitado', 2500274, 1, 'default.png'),
(1007745539, 'JUAN CARLOS SALINAS PARRA', 'Parrasalinasjuancarlos0@gmail.com', '1007745539', '1007745539', '', '3223577811', 1, 'Invitado', 2500267, 1, 'default.png'),
(1007750715, 'LUIS GUILLERMO CERON MENDEZ', 'ceronluid283@gmail.com', '1007750715', '1007750715', '', 'null', 1, 'Invitado', 2500094, 1, 'default.png'),
(1007750804, 'ADRIANO BAMBAGUE LARA', 'adbamlara@gmail.com', '1007750804', '1007750804', '', 'null', 1, 'Invitado', 2500117, 1, 'default.png'),
(1007751036, 'LINA MARÍA CLAROS AGUILERA', 'lina.claros@iemnacionalpitalito.edu.co', '1007751036', '1007751036', '', '3003122659', 1, 'Invitado', 2562906, 1, 'default.png'),
(1007897674, 'EDWIN DAVID PARRA LUNA', 'eparraluna2@gmail.com', '1007897674', '1007897674', '', '3155355530', 1, 'Invitado', 2546882, 1, 'default.png'),
(1007897838, 'NICOLAS HERNANDEZ PERDOMO', 'nicotaku314@gmail.com', '1007897838', '1007897838', '', 'null', 1, 'Invitado', 2500012, 1, 'default.png'),
(1010008566, 'JHON ERIK BERMUDEZ BARRERA', 'caminandoporelmundo071@gmail.com', '1010008566', '1010008566', '', '3135879732', 1, 'Invitado', 2322432, 1, 'default.png'),
(1010078490, 'ANYELA YAZMIN MORA SOLARTE', 'anyelamora30072003@gmail.com', '1010078490', '1010078490', '', 'null', 1, 'Invitado', 2500094, 1, 'default.png'),
(1012322452, 'JEIMI CATALINA PULIDO MEDINA', 'catamedina1011@gmail.com', '1012322452', '1012322452', '', '3178644945', 1, 'Invitado', 2469570, 1, 'default.png'),
(1012328451, 'JUAN DAVID GUTIERREZ VIDAL', 'gutirrezvidalj@gmail.com', '1012328451', '1012328451', '', '3209527912', 1, 'Invitado', 2451009, 1, 'default.png'),
(1012348707, 'LUIS ARMANDO CANTUCA ARMERO', 'actualizar@misena.edu.co', '1012348707', '1012348707', '', 'null', 1, 'Invitado', 2468752, 1, 'default.png'),
(1013102575, 'LINA PIEDAD GOMEZ SANCHEZ', 'linapiedad15@gmail.com', '1013102575', '1013102575', '', 'null', 1, 'Invitado', 2469571, 1, 'default.png'),
(1013102895, 'JUAN SEBASTIAN AVENDAÑO IMBACHI', 'Juanse26a@gmail.com', '1013102895', '1013102895', '', 'null', 1, 'Invitado', 2546882, 1, 'default.png'),
(1013579857, 'JENNY PAOLA RODRIGUEZ PARADA', 'jennyrodriguezparada@hotmail.com', '1013579857', '1013579857', '', '3142841891', 1, 'Invitado', 2554406, 1, 'default.png'),
(1013628439, 'JULIAN FELIPE QUIMBAYO HERRERA', 'julianfelipe2818@gmail.com', '1013628439', '1013628439', '', '3197089647', 1, 'Invitado', 2500096, 1, 'default.png'),
(1015474815, 'HARRINSON JIMENEZ LOPEZ', 'h.j.l.d@hotmail.com', '1015474815', '1015474815', '', '3227221881', 1, 'Invitado', 2500094, 1, 'default.png'),
(1015994112, 'JESUS NICOLAS AYERBE GUARNIZO', 'nicoayerbe.com@gmail.com', '1015994112', '1015994112', '', 'null', 1, 'Invitado', 2280204, 1, '1015994112.png');
INSERT INTO `personas` (`identificacion`, `Nombres`, `Correo`, `Login`, `password`, `Direccion`, `Telefono`, `Cargo`, `Rol`, `Ficha`, `Estado`, `Foto`) VALUES
(1018484319, 'DIEGO MAURICIO SALAZAR SANCHEZ', 'dimausan96.dmssn@gmail.com', '1018484319', '1018484319', '', '3174457296', 1, 'Invitado', 2546882, 1, 'default.png'),
(1020471058, 'CARLOS SAHID HERMIDA IZQUIERDO', 'hermidacarlos62@gmail.com', '1020471058', '1020471058', '', '3113007147', 1, 'Invitado', 2562906, 1, 'default.png'),
(1020737788, 'GAVIRIA LOZANO DIEGO ALEJANDRO', 'dgavirial@sena.edu.co', '1020737788', '1020737788', '', '3144389333', 2, 'Lider UP', 0, 1, 'default.png'),
(1021312788, 'DAVID FELIPE SEVILLA PEREZ', 'produccionesludens@gmail.com', '1021312788', '1021312788', '', '3112167735', 1, 'Invitado', 2500096, 1, 'default.png'),
(1022425485, 'HAROLD HERNANDO CUELLAR ROJAS', 'cuellarrojas97@gmail.com', '1022425485', '1022425485', '', '7959414', 1, 'Invitado', 2469966, 1, 'default.png'),
(1023932537, 'JAVIER ORLANDO ALZAMORA BRAVO', 'jabravo_93@hotmail.com', '1023932537', '1023932537', '', '3124610735', 1, 'Invitado', 2236073, 1, 'default.png'),
(1023949628, 'ANDRES FELIPE MUÑOZ SANCHEZ', 'actualizar@misena.edu.co', '1023949628', '1023949628', '', 'null', 1, 'Invitado', 2546882, 1, 'default.png'),
(1025522425, 'SERGIO CORTES OSORIO', 'bakuhinaka18@gmail.com', '1025522425', '1025522425', '', '313 8122495', 1, 'Invitado', 2469582, 1, 'default.png'),
(1030680000, 'JUAN SEBASTIAN ESPAÑA PARRA', 'sebastianjst2247@gmail.com', '1030680000', '1030680000', '', '3006676973', 1, 'Invitado', 2469966, 1, 'default.png'),
(1031642349, 'JOHAN SEBASTIAN TORRES FERNANDEZ', 'johsebtorfer@gmail.com', '1031642349', '1031642349', '', 'null', 1, 'Invitado', 2322432, 1, 'default.png'),
(1031644105, 'LAURA SOFIA ANACONA CABRA', 'sandraaponte79@hotmail.com', '1031644105', '1031644105', '', '3142283431', 1, 'Invitado', 2451001, 1, 'default.png'),
(1032443599, 'YORLENY STERLING CUELLAR', 'cuellaryorleny123@gmail.com', '1032443599', '1032443599', '', 'null', 1, 'Invitado', 2554406, 1, 'default.png'),
(1033685881, 'YULI TATIANA OVALLE VELASQUEZ', 'odeivicaicedo@gmail.com', '1033685881', '1033685881', '', '3008529635', 1, 'Invitado', 2541039, 1, 'default.png'),
(1058547250, 'MIGUEL ANGEL LUNA TABARES', 'migueltabares420@gmail.com', '1058547250', '1058547250', '', '3215951481', 1, 'Invitado', 2500070, 1, 'default.png'),
(1058547260, 'LUIS ALEJANDRO QUETA RUIZ', 'luisalejandroqueta@gmail.com', '1058547260', '1058547260', '', '3116329643', 1, 'Invitado', 2500274, 1, 'default.png'),
(1058962010, 'MAIRA GISEL ROBLES URBANO', 'mairarobles362@gmail.com', '1058962010', '1058962010', '', '3222491933', 1, 'Invitado', 2451001, 1, 'default.png'),
(1058963269, 'YILENI SAMBONI SAMBONI', 'yilenisamboni16@gmail.com', '1058963269', '1058963269', '', 'null', 1, 'Invitado', 2562906, 1, 'default.png'),
(1059901015, 'FABER SANTIAGO RUIZ ERAZO', 'faverruiz780@gmail.com', '1059901015', '1059901015', '', 'null', 1, 'Invitado', 2469966, 1, 'default.png'),
(1060296006, 'MARIA MICEYI MUÑOZ ASTUDILLO', 'mariiamunoz1234@gmail.com', '1060296006', '1060296006', '', '3214274595', 1, 'Invitado', 2280196, 1, 'default.png'),
(1061707811, 'ROSA ELVIRA GAVIRIA TORRES', 'rositagaviria@misena.edu.co', '1061707811', '1061707811', '', '3124491283', 2, 'Invitado', 0, 1, 'default.png'),
(1061821721, 'SEBASTIAN RIVERA RIVERA', 'sebascruzmusic@gmail.com', '1061821721', '1061821721', '', '3102511449', 1, 'Invitado', 2280204, 1, '1061821721.png'),
(1064186829, 'ANDREA CAROLINA DURANGO VELASQUEZ', 'santiagoduvez@gmail.com', '1064186829', '1064186829', '', '3146485834', 1, 'Invitado', 2469571, 1, 'default.png'),
(1070009104, 'RUBEN STIVEN AHUMADA RIOS', 'rubenrios02@hotmail.com', '1070009104', '1070009104', '', '3123225427', 1, 'Invitado', 2554406, 1, 'default.png'),
(1072703366, 'JHON HUMBERTO LOPEZ CASTILLO', 'vajosag@unal.edu.com', '1072703366', '1072703366', '', 'null', 1, 'Invitado', 2541039, 1, 'default.png'),
(1075210029, 'ALVARO LADINO PAQUE', 'ladinopaque@gmail.com', '1075210029', '1075210029', '', '3213067951', 1, 'Invitado', 2464124, 1, 'default.png'),
(1075214102, 'HEYI FERNANDA VARGAS RAMOS', 'hfvargasr@sena.edu.co', '1075214102', '1075214102', '', '3212323391', 2, 'Invitado', 0, 1, 'default.png'),
(1075216357, 'DIANA LORENA AVILA DUSAN', 'dlavila75@misena.edu.co', '1075216357', '1075216357', '', '3166966192', 2, 'Invitado', 0, 1, 'default.png'),
(1075281256, 'MANUEL ESNEIDER MORENO GUZMAN', 'OKCONTRASENAS@GMAIL.COM', '1075281256', '1075281256', '', '3022833987', 1, 'Invitado', 2554406, 1, 'default.png'),
(1075305922, 'MICHAEL ANDRES BERMUDEZ PERDOMO', 'maycol97perdomo@gmail.com', '1075305922', '1075305922', '', '3143920974', 1, 'Invitado', 2541039, 1, 'default.png'),
(1075317893, 'MANUEL FERNANDO MACIAS DELGADO', 'manuel.macias11@misena.edu.co', '1075317893', '1075317893', 'cll 11b sur #3a-42', '3203460642', 1, 'Invitado', 2280204, 1, '1075317893.png'),
(1076903377, 'JUAN FELIPE MORENO RAMIREZ', 'cybernetjf64@gmail.com', '1076903377', '1076903377', '', '3001000000', 1, 'Invitado', 2326610, 1, 'default.png'),
(1077226632, 'JESUS DAVID CRUZ SALAZAR', 'jesusdavidcruzsalazar@gmail.com', '1077226632', '1077226632', '', '3168036992', 1, 'Invitado', 2451001, 1, 'default.png'),
(1077840651, 'INGRID VANESA SABI CHARRY', 'ingridvanesasabicharry@gmail.com', '1077840651', '1077840651', '', '3007867564', 1, 'Invitado', 2236074, 1, 'default.png'),
(1077843011, 'JIMENA ROJAS POLANCO', 'ximepolanco25@gmail.com', '1077843011', '1077843011', '', '3219160729', 1, 'Invitado', 2500012, 1, 'default.png'),
(1077846310, 'KAREN LISDANY MEDINA HERNANDEZ', 'karenmedina3838@gmail.com', '1077846310', '1077846310', '', '3208684964', 1, 'Invitado', 2469570, 1, 'default.png'),
(1077858481, 'JOHN EDWIN MONTILLA BERNAL', 'johnmontilla1990@gmail.com', '1077858481', '1077858481', '', '3208296815', 2, 'Invitado', 0, 1, 'default.png'),
(1077876896, 'LEIDER GOMEZ CUBILLOS', 'leider_g_@hotmail.com', '1077876896', '1077876896', '', 'null', 1, 'Invitado', 2469966, 1, 'default.png'),
(1078746004, 'LUIS CARLOS OSORIO PULIDO', 'zorochooper3cd@gmail.com', '1078746004', '1078746004', '', '3175088811', 1, 'Invitado', 2469966, 1, 'default.png'),
(1078746103, 'LEIDY CARMENZA MELO ARIAS', 'meloleidy19@gmail.com', '1078746103', '1078746103', '', '3166706224', 1, 'Invitado', 2500012, 1, 'default.png'),
(1078746185, 'JUAN FERNANDO YUCO ROJAS', 'yucojf0004@gmail.com', '1078746185', '1078746185', '', '3126796273', 1, 'Invitado', 2326610, 1, 'default.png'),
(1078746269, 'CRISTIAN DAVID CLAROS IMBACHI', 'claroscristian073@gmail.com', '1078746269', '1078746269', '', '3212582864', 1, 'Invitado', 2500012, 1, 'default.png'),
(1078746416, 'NIYIRETH PARRA GAVIRIA', 'niyiretha123@gmail.com', '1078746416', '1078746416', '', '3163262355', 1, 'Invitado', 2562906, 1, 'default.png'),
(1078746506, 'JUAN SEBASTIAN GONZALEZ BARRERA', 'juansebastiangonzalez01@gmail.com', '1078746506', '1078746506', '', 'null', 1, 'Invitado', 2546882, 1, 'default.png'),
(1078746522, 'ERIK SANTIAGO CRUZ PANQUEVA', 'e.santiagocruz223006@gmail.com', '1078746522', '1078746522', '', '3173944205', 1, 'Invitado', 2500117, 1, 'default.png'),
(1078746551, 'DARLI FERNANDA CASTRO PLAZAS', 'darliferchacastro@gmail.com', '1078746551', '1078746551', '', '3105673838', 1, 'Invitado', 2500139, 1, 'default.png'),
(1078746631, 'DAIRA ALEXANDRA CRUZ CEDEÑO', 'dairaalexandracruz@gmail.com', '1078746631', '1078746631', '', '3188375515', 1, 'Invitado', 2500117, 1, 'default.png'),
(1078746654, 'MARLON BOLAÑOS GUZMAN', 'marlonbolaos2021@icloud.com', '1078746654', '1078746654', '', '3142427772', 1, 'Invitado', 2546882, 1, 'default.png'),
(1078746992, 'LUZ ADRIANA JARAMILLO ORTEGA', 'Luzjaramillo534@gmail.com', '1078746992', '1078746992', '', '3166237633', 1, 'Invitado', 2469570, 1, 'default.png'),
(1078750336, 'JOSE LUCIANO MARTINEZ USECHE', 'kaxajal78@hotmail.com', '1078750336', '1078750336', '', 'null', 1, 'Invitado', 2469966, 1, 'default.png'),
(1078753590, 'ARNOL DIAZ ARAGON', 'arbiking10@gmail.com', '1078753590', '1078753590', '', '3175632182', 1, 'Invitado', 2469966, 1, 'default.png'),
(1078755096, 'MARYI INES GARCES TORRES', 'actualizar@sena.edu.co', '1078755096', '1078755096', '', 'null', 1, 'Invitado', 2469966, 1, 'default.png'),
(1078755383, 'SANDER DAVID BARRIOS SILVA', 'sannder9817@gmail.com', '1078755383', '1078755383', '', 'null', 1, 'Invitado', 2469966, 1, 'default.png'),
(1078755612, 'EFRAIN GIL DUCUARA', 'efraingilducuara@outlook.com', '1078755612', '1078755612', '', '3184879581', 1, 'Invitado', 2469966, 1, 'default.png'),
(1079175033, 'JULIAN FELIPE GODOY PAREDES', 'pipegodoyparedes@gmail.com', '1079175033', '1079175033', '', '3184523948', 1, 'Invitado', 2500274, 1, 'default.png'),
(1079508964, 'MARCOS ALBERTO PERDOMO VANEGAS', 'marcos.pv@hotmail.com', '1079508964', '1079508964', '', '3182646210', 2, 'Invitado', 0, 1, 'default.png'),
(1079534248, 'JORDY ALEXANDER GARCIA GIRALDO', 'jordygarcia928@gmail.com', '1079534248', '1079534248', '', '3133012704', 1, 'Invitado', 2500139, 1, 'default.png'),
(1079534283, 'JOSE MANUEL MORALES CASTAÑO', 'josemmc058@gmail.com', '1079534283', '1079534283', '', '3202861221', 1, 'Invitado', 2451011, 1, 'default.png'),
(1079534289, 'KARENT DANIELA YUCUMA OME', 'yucuma13@gmail.com', '1079534289', '1079534289', '', '3008378738', 1, 'Invitado', 2500096, 1, 'default.png'),
(1079534328, 'ANGEL STEPHANY MEDINA ECHEVERRY', 'stefanymedinaecheverry@gmail.com', '1079534328', '1079534328', '', '3216138828', 1, 'Invitado', 2500267, 1, 'default.png'),
(1079534335, 'ANDRES FELIPE CHAVES PARRA', 'andresfelipechavesparra94@gmail.com', '1079534335', '1079534335', '', 'null', 1, 'Invitado', 2546882, 1, 'default.png'),
(1079534343, 'MARIA PAULA RIVERA PEÑA', 'maparipe123@gmail.com', '1079534343', '1079534343', '', '3183173761', 1, 'Invitado', 2500096, 1, 'default.png'),
(1079534526, 'HANZ VARGAS DIAZ', 'hanz.vargas@gmail.com', '1079534526', '1079534526', '', 'null', 1, 'Invitado', 2451009, 1, 'default.png'),
(1079535085, 'LINDA CAMILA NUÑEZ CALDERON', 'nflorcalderon321@gmail.com', '1079535085', '1079535085', '', 'null', 1, 'Invitado', 2562906, 1, 'default.png'),
(1080188513, 'OSCAR EDUARDO SANDOVAL ARTUNDUAGA', 'heavyismyname@hotmail.com', '1080188513', '1080188513', '', '3192039870', 1, 'Invitado', 2500096, 1, 'default.png'),
(1080260084, 'VALENTINA DAZA COAJI', 'dazavalentina99@gmail.com', '1080260084', '1080260084', '', '3228466846', 1, 'Invitado', 2280196, 1, 'default.png'),
(1080263313, 'DIANA CAROLINA JARAMILLO ORDOÑEZ', 'carito16245@hotmail.com', '1080263313', '1080263313', '', 'null', 1, 'Invitado', 2554406, 1, 'default.png'),
(1080290286, 'LESLY NATACHA PLAZAS ROJAS', 'leslyrojas140504@gmail.com', '1080290286', '1080290286', '', 'null', 1, 'Invitado', 2469571, 1, 'default.png'),
(1080360131, 'KARLY DARYANI PEREZ HURTATIZ', 'karlyperezhurtatiz@gmail.com', '1080360131', '1080360131', '', '3234397111', 1, 'Invitado', 2500094, 1, 'default.png'),
(1080366355, 'JADERSON MANSANARES POLANIA', 'jadersonpolania99@gmail.com', '1080366355', '1080366355', '', '3204254979', 1, 'Invitado', 2469966, 1, 'default.png'),
(1080930191, 'VIVIANA HERNANDEZ TIQUE', 'vh2689370@gmail.com', '1080930191', '1080930191', '', '3204921518', 1, 'Invitado', 2469570, 1, 'default.png'),
(1080930251, 'JUAN DAVID BUENDIA MASIAS', 'MBJUANDAVID16@GMAIL.COM', '1080930251', '1080930251', '', 'null', 1, 'Invitado', 2500094, 1, 'default.png'),
(1080930325, 'SEBASTIAN ZUÑIGA CHAUX', 'sebastianzunigachaux@gmail.com', '1080930325', '1080930325', '', '3185680539', 1, 'Invitado', 2451001, 1, 'default.png'),
(1080930426, 'LAURA JIMENA QUEZADA MANRIQUE', 'laurajimenaquesadamanrique@gmail.com', '1080930426', '1080930426', '', '3144697346', 1, 'Invitado', 2500274, 1, 'default.png'),
(1080930461, 'DANNY VANESSA HERNANDEZ ANTURY', 'dannyvanessa474@gmail.com', '1080930461', '1080930461', '', '31342867808', 1, 'Invitado', 2469570, 1, 'default.png'),
(1080930505, 'MARIA PAULA MUÑOZ COLLAZOS', 'mariapaulamunoz04@gmail.com', '1080930505', '1080930505', '', '3154289486', 1, 'Invitado', 2500094, 1, 'default.png'),
(1080930518, 'HERMID GUEVARA PALECHOR', 'hermidguevarapalechor4@gmail.com', '1080930518', '1080930518', '', '3174975703', 1, 'Invitado', 2500096, 1, 'default.png'),
(1080930636, 'JOSE JAIDER HEREDIA LOPEZ', 'heredialopezjosejaider@gmail.com', '1080930636', '1080930636', '', '3108164760', 1, 'Invitado', 2469570, 1, 'default.png'),
(1080930742, 'ELIANA ASCENCIO BARRERO', 'Barrero1315@gmail.com', '1080930742', '1080930742', '', 'null', 1, 'Invitado', 2469570, 1, 'default.png'),
(1080930754, 'JULIAN DAVID RINCON LOZANO', 'elwertu66@gmail.com', '1080930754', '1080930754', '', '3052914635', 1, 'Invitado', 2500274, 1, 'default.png'),
(1080930840, 'YULIANA CORREA CAMACHO', 'julicamacho2415@gmail.com', '1080930840', '1080930840', '', 'null', 1, 'Invitado', 2469570, 1, 'default.png'),
(1080930844, 'MARLON FERNANDO CELIS MUÑOZ', 'marloncelis3520@gmail.com', '1080930844', '1080930844', '', 'null', 1, 'Invitado', 2469570, 1, 'default.png'),
(1080930880, 'CHARITH ANDREA MORENO CORREA', 'morenocharith52@gmail.com', '1080930880', '1080930880', '', 'null', 1, 'Invitado', 2469570, 1, 'default.png'),
(1080930962, 'YULY FERNANDA OSORIO PUENTES', 'fo94615@gmail.com', '1080930962', '1080930962', '', 'null', 1, 'Invitado', 2469570, 1, 'default.png'),
(1080931225, 'RUBÉN YAIR MURCIA PRADILLA', 'murciapradillarubenyair@gmail.com', '1080931225', '1080931225', '', '3013167058', 1, 'Invitado', 2500096, 1, 'default.png'),
(1080931418, 'NATALIA RODRIGUEZ OSORIO', 'natarodri.1505@gmail.com', '1080931418', '1080931418', '', '3209539198', 1, 'Invitado', 2451001, 1, 'default.png'),
(1081394466, 'JULIAN CAMILO DAVALOS PAJOY', 'davalosjulian79@gmail.com', '1081394466', '1081394466', '', '3208651875', 1, 'Invitado', 2500267, 1, 'default.png'),
(1081512288, 'MARIA ANGELICA AROCA CRUZ', 'danielaaroca214@gmail.com', '1081512288', '1081512288', '', '3114463011', 1, 'Invitado', 2500117, 1, 'default.png'),
(1081517311, 'FELIPE ANDRES LIZARAZO VARGAS', 'anymusvargas@gmail.com', '1081517311', '1081517311', '', 'null', 1, 'Invitado', 2500070, 1, 'default.png'),
(1081592359, 'HUGO FERNANDO BURBANO GUTIERREZ', 'produccionesfernando29@gmail.com', '1081592359', '1081592359', '', '322294448', 1, 'Invitado', 2500096, 1, 'default.png'),
(1081699614, 'WILLINTON STIVEN TRUJILLO IMBACHI', 'trujillostiven07@gmail.com', '1081699614', '1081699614', '', '3204874341', 1, 'Invitado', 2451001, 1, 'default.png'),
(1081699723, 'MARLY ALEJANDRA MENESES MESA', 'menesesmesamarly@gmail.com', '1081699723', '1081699723', '', '3175223787', 1, 'Invitado', 2469571, 1, 'default.png'),
(1081699749, 'JAIDER GHEFREY GALINDO TUQUERRES', 'jaiderghefreygalindotuquerres@gmail.com', '1081699749', '1081699749', '', '3104717402', 1, 'Invitado', 2252425, 1, 'default.png'),
(1081700247, 'GLADIS ROCIO RENGIFO IMBACHI', 'gladisrociorenjifoimbanchi@gmail.com', '1081700247', '1081700247', '', '3133048344', 1, 'Invitado', 2541039, 1, 'default.png'),
(1081728132, 'ANDRES FELIPE BARRERA SCARPETA', 'andrea.221185@hotmail.com', '1081728132', '1081728132', '', '3104486543', 1, 'Invitado', 2280193, 1, 'default.png'),
(1081733331, 'SARAH RIAÑO JOAQUI', 'rianosarah14@gmail.com', '1081733331', '1081733331', '', '3219202392', 1, 'Invitado', 2554406, 1, 'default.png'),
(1082124011, 'AUDONIAS PENAGOS SEMANATE', 'penagosxd2003@gmail.com', '1082124011', '1082124011', '', '3014874919', 1, 'Invitado', 2322432, 1, 'default.png'),
(1082124321, 'YULIANA JOVEN CABRERA', 'yulianajovencabrera@gmail.com', '1082124321', '1082124321', '', '3133442114', 1, 'Invitado', 2280193, 1, 'default.png'),
(1082154540, 'LIZETH TATIANA AMBITO MONTES', 'ambitomontestatiana@gmail.com', '1082154540', '1082154540', '', 'null', 1, 'Invitado', 2500094, 1, 'default.png'),
(1082772019, 'ALFER BERNEI ORDOÑEZ JIMENEZ', 'MILLOS9876543210@GMAIL.COM', '1082772019', '1082772019', '', '3203792491', 1, 'Invitado', 2468752, 1, 'default.png'),
(1082772142, 'GANEZA VARGAS ROJAS', 'ganezavargas283@gmail.com', '1082772142', '1082772142', '', '3163481468', 1, 'Invitado', 2500070, 1, 'default.png'),
(1082773003, 'TANIA KARINA VALDES GOMEZ', 'karinavaldes07@gmail.com', '1082773003', '1082773003', '', 'null', 1, 'Invitado', 2469582, 1, 'default.png'),
(1082773248, 'DANIELA STEFANNY TOVAR CASTILLO', 'tovardaniela346@gmail.com', '1082773248', '1082773248', '', '3118468268', 1, 'Invitado', 2500267, 1, 'default.png'),
(1082777050, 'WILMER ALEXANDER QUINAYAS YUNDA', 'Wilmeralexanderquinayas@gmail.com', '1082777050', '1082777050', '', '3173350583', 1, 'Invitado', 2468752, 1, 'default.png'),
(1082777407, 'MARIO ALEJANDRO CERON ARCOS', 'alejoceron93@gmail.com', '1082777407', '1082777407', '', '3132454370', 1, 'Invitado', 2468752, 1, 'default.png'),
(1082778443, 'VICTOR ALFONSO URRUTIA IPUZ', 'urrutiaipuzvictor@gmail.com', '1082778443', '1082778443', '', '3214373287', 1, 'Invitado', 2451011, 1, 'default.png'),
(1082780030, 'ADRIANA VANESSA MACA ', 'avmaca0@misena.edu.co', '1082780030', '1082780030', 'Pitalito', '3123949489', 1, 'Invitado', 2205580, 1, 'default.png'),
(1082780297, 'LUIS ANGEL PASAJE ANDRADE', 'luisangelpasaje8@gmail.com', '1082780297', '1082780297', '', '3007894568', 1, 'Invitado', 2468752, 1, 'default.png'),
(1082781280, 'LEIDER CORDOBA PAPAMIJA', 'yber.omen19@gmail.com', '1082781280', '1082781280', '', 'null', 1, 'Invitado', 2468752, 1, 'default.png'),
(1083864021, 'JOSE LUIS RIVERA MINDA', 'jriveraminda@gmail.com', '1083864021', '1083864021', '', '3118354486', 1, 'Invitado', 2500117, 1, 'default.png'),
(1083864126, 'EDGAR FARID JOAQUI CHATES', 'faridchates5@gmail.com', '1083864126', '1083864126', '', 'null', 1, 'Invitado', 2426308, 1, 'default.png'),
(1083864129, 'EMERSON DAVID CALDERON PORTILLA', 'calderonportillae@gmail.com', '1083864129', '1083864129', '', '3132739820', 1, 'Invitado', 2280193, 1, 'default.png'),
(1083864132, 'YENIFER CONTRERAS SANCHEZ', 'sanchezyenifer357@gmail.com', '1083864132', '1083864132', '', '3222828008', 1, 'Invitado', 2500094, 1, 'default.png'),
(1083864186, 'JOSE ESTEBAN NAVARRO MADRIGAL', 'estebanmadrigal968@gmail.com', '1083864186', '1083864186', '', '3224126788', 1, 'Invitado', 2500267, 1, 'default.png'),
(1083864205, 'KERLY JHOANA VARGAS SALINAS', 'JHOANAVASA@GMAIL.COM', '1083864205', '1083864205', '', '3185168188', 1, 'Invitado', 2252425, 1, 'default.png'),
(1083864224, 'ANDRES FELIPE MUÑOZ QUILINDO', 'andres.felipe986335@gmail.com', '1083864224', '1083864224', '', '3222892198', 1, 'Invitado', 2500274, 1, 'default.png'),
(1083864249, 'ELIANA VARGAS MUÑOZ', 'elianavargas838@gmail.com', '1083864249', '1083864249', '', '3133477876', 1, 'Invitado', 2500139, 1, 'default.png'),
(1083864251, 'JORGE ESTEBAN VASQUEZ MUÑOZ', 'jesteban.vasquez17@gmail.com', '1083864251', '1083864251', '', '3214273105', 1, 'Invitado', 2500267, 1, 'default.png'),
(1083864269, 'OSCAR JAVIER IBARRA ROJAS', 'lisper200220@gmail.com', '1083864269', '1083864269', '', '3144220387', 1, 'Invitado', 2500267, 1, 'default.png'),
(1083864335, 'LUIS FRANCISCO ESPITIA SANCHEZ', 'sluis9137@gmail.com', '1083864335', '1083864335', '', '3224239208', 1, 'Invitado', 2451001, 1, 'default.png'),
(1083864380, 'SANCHEZ OVIEDO JOSE LUIS', 'jlsanchez@sena.edu.co', '1083864380', '1083864380', '', '3103264147', 2, 'Invitado', 0, 1, 'default.png'),
(1083864639, 'CARLOS ALBERTO VALENZUELA CASTRO', 'albert1105@outlook.com', '1083864639', '1083864639', '', '3232469319', 1, 'Invitado', 2236073, 1, 'default.png'),
(1083864712, 'STEFANIA MUÑOZ HERNANDEZ', 'sm2011873@gmail.com', '1083864712', '1083864712', '', '3228288587', 1, 'Invitado', 2500267, 1, 'default.png'),
(1083864774, 'ARGENIS HELENA JIMENEZ LASSO', 'argenishelenajimenezlasso@gmail.com', '1083864774', '1083864774', '', '3144504936', 1, 'Invitado', 2541039, 1, 'default.png'),
(1083864892, 'KEVIN MAURICIO CRUZ MOSQUERA', 'kevincruz1056@gmail.com', '1083864892', '1083864892', '', '3232284872', 1, 'Invitado', 2469570, 1, 'default.png'),
(1083865453, 'ERICK SANTIAGO SANCHEZ ROJAS', 'ericksantiro03@gmail.com', '1083865453', '1083865453', '', '3124271698', 1, 'Invitado', 2500096, 1, 'default.png'),
(1083865542, 'JHOAN SEBASTIAN SAN JUAN GOMEZ', 'jhoansanjuan2004@gmail.com', '1083865542', '1083865542', '', 'null', 1, 'Invitado', 2469571, 1, 'default.png'),
(1083865570, 'YAMILET MENESES MENESES', 'yamiletmeneses1703@gmail.com', '1083865570', '1083865570', '', 'null', 1, 'Invitado', 2252425, 1, 'default.png'),
(1083865710, 'DIANA CAROLINA TRUJILLO CLAROS', 'dianaclaros965@gmail.com', '1083865710', '1083865710', '', '3208252646', 1, 'Invitado', 2500094, 1, 'default.png'),
(1083865757, 'GERMAN DAVID SAMBONI SAMBONI', 'germansamboni271@gmail.com', '1083865757', '1083865757', '', '3118649477', 1, 'Invitado', 2469582, 1, 'default.png'),
(1083865760, 'NIYERETH GARZON VELA', 'niyegar760@gmail.com', '1083865760', '1083865760', '', '3143912884', 1, 'Invitado', 2541039, 1, 'default.png'),
(1083865788, 'JAMES SANTIAGO ORDOÑEZ QUINAYAS', 'sordonez287@gmail.com', '1083865788', '1083865788', 'San Agustín', '3223562765', 1, 'Invitado', 2280204, 1, '1083865788.png'),
(1083866053, 'MARIA CRISTINA ESPAÑA PINILLA', 'mariaespana754@gmail.com', '1083866053', '1083866053', '', '3108010866', 1, 'Invitado', 2236073, 1, 'default.png'),
(1083866184, 'ANDRES FELIPE VALDERRAMA ORTIZ', 'valderramaandres042@gmail.com', '1083866184', '1083866184', '', '3003114916', 1, 'Invitado', 2500012, 1, 'default.png'),
(1083866202, 'BRAYAN CAMILO LOPEZ CHAUX', 'camilolopezch676@gmail.com', '1083866202', '1083866202', '', '3188369283', 1, 'Invitado', 2469570, 1, 'default.png'),
(1083866354, 'JESUS DAVID VARGAS CLAROS', 'vargasclaros123@gmail.com', '1083866354', '1083866354', '', 'null', 1, 'Invitado', 2562906, 1, 'default.png'),
(1083866437, 'DIEGO ALEJANDRO VILLARUEL GONZALEZ', 'villitagonzalez2004@gmail.com', '1083866437', '1083866437', '', '3182559573', 1, 'Invitado', 2451009, 1, 'default.png'),
(1083866595, 'JAROL ESNITH ZAPATA SANCHEZ', 'jarolzapata2003@gmail.com', '1083866595', '1083866595', '', 'null', 1, 'Invitado', 2500274, 1, 'default.png'),
(1083866609, 'JUAN STEVAN GONZALEZ CARLOSAMA', 'juanex2018@gmail.com', '1083866609', '1083866609', '', '3133010575', 1, 'Invitado', 2500012, 1, 'default.png'),
(1083866659, 'YUDY ANDREA VALENCIA MOTTA', 'yudyv9368@gmail.com', '1083866659', '1083866659', '', '3134156943', 1, 'Invitado', 2280196, 1, 'default.png'),
(1083866721, 'DANIEL FELIPE BETANCOURT SUAREZ', 'albenissuarez2@gmail.com', '1083866721', '1083866721', '', '3204601804', 1, 'Invitado', 2500117, 1, 'default.png'),
(1083866790, 'KAREN TATIANA ANDRADE LOPEZ', 'karentatianaandradelopez@gmail.com', '1083866790', '1083866790', '', '3132117496', 1, 'Invitado', 2500094, 1, 'default.png'),
(1083866960, 'LAURA VALENTINA RUIZ GOMEZ', 'valenruizgo14@gmail.com', '1083866960', '1083866960', '', 'null', 1, 'Invitado', 2451001, 1, 'default.png'),
(1083867012, 'MARIA ALEJANDRA SALINAS TORO', 'mariaalejandrasalinastoro90@gmail.com', '1083867012', '1083867012', '', '3152565626', 1, 'Invitado', 2280196, 1, 'default.png'),
(1083867144, 'ANDRY DAYANA BASTIDAS HERNANDEZ', 'bastidasandrydayana@gmail.com', '1083867144', '1083867144', '', 'null', 1, 'Invitado', 2469570, 1, 'default.png'),
(1083867339, 'MARITZA XIMENA DE LA CRUZ JOJOA', 'cruzjimena74@gmail.com', '1083867339', '1083867339', '', '3133228013', 1, 'Invitado', 2500094, 1, 'default.png'),
(1083867708, 'WENDY VANESSA HOYOS GARCIA', 'hoyosgarciawendyvanessa@gmail.com', '1083867708', '1083867708', '', 'null', 1, 'Invitado', 2500012, 1, 'default.png'),
(1083867897, 'SINDY JOHANNA ROJAS YAIMES', 'sindy08.rojas@gmail.com', '1083867897', '1083867897', '', 'null', 1, 'Invitado', 2426308, 1, 'default.png'),
(1083868084, 'LAURA VALENTINA GOMEZ VARGAS', 'lauravgomez0916@gmail.com', '1083868084', '1083868084', '', '3158023046', 1, 'Invitado', 2554406, 1, 'default.png'),
(1083868126, 'KEVIN STIVEN IJAJI LOSADA', 'kevinstivenijaji9@gmail.com', '1083868126', '1083868126', '', '3228345877', 1, 'Invitado', 2326610, 1, 'default.png'),
(1083868130, 'JESUS ALBEIRO GUTIERREZ TORRES', 'jesusgutierreztorresnm@gmail.com', '1083868130', '1083868130', '', 'null', 1, 'Invitado', 2469570, 1, 'default.png'),
(1083868175, 'NERLY GOMEZ MENDEZ', 'nerlygomez009@gmail.com', '1083868175', '1083868175', '', 'null', 1, 'Invitado', 2469571, 1, 'default.png'),
(1083868191, 'ANDRÉS DAMIAN RAMOS MURCIA', 'pedrocopito3@gmail.com', '1083868191', '1083868191', '', 'null', 1, 'Invitado', 2562906, 1, 'default.png'),
(1083868207, 'JHERSON ALEJANDRO ROJAS CHAMORRO', 'jherson04chamorro2004@gmail.com', '1083868207', '1083868207', '', '3504181701', 1, 'Invitado', 2451009, 1, 'default.png'),
(1083868420, 'NATHALIA LOSADA MAZABEL', 'nlosada02@misena.edu.co', '1083868420', '1083868420', '', '3219869332', 1, 'Invitado', 2469570, 1, 'default.png'),
(1083868624, 'SINDY MAYERLY IMBACHI ORDOÑEZ', 'imbachiordonezsindymayerly@gmail.com', '1083868624', '1083868624', '', 'null', 1, 'Invitado', 2500094, 1, 'default.png'),
(1083868695, 'LEIDY ROCIO VARGAS LOPEZ', 'lrvargas@sena.edu.co', '1083868695', '1083868695', '', '320 8622904', 2, 'Invitado', 0, 1, 'default.png'),
(1083868724, 'JUAN SEBASTIAN CASTRO GUERRERO', 'jcastro5112004@gmail.com', '1083868724', '1083868724', '', 'null', 1, 'Invitado', 2500094, 1, 'default.png'),
(1083868782, 'JESSICA PAOLA GUTIERREZ CABRERA', 'jesica2004gutierrez@gmail.com', '1083868782', '1083868782', '', '3214626664', 1, 'Invitado', 2500094, 1, 'default.png'),
(1083869142, 'EDWIN ADOLFO TRUJILLO MUÑOZ', 'edwintru113@gmail.com', '1083869142', '1083869142', '', '3225327176', 1, 'Invitado', 2451011, 1, 'default.png'),
(1083869167, 'SANDY YISEL TOVAR RENZA', 'yiseltovar8@gmail.com', '1083869167', '1083869167', '', 'null', 1, 'Invitado', 2500012, 1, 'default.png'),
(1083869222, 'ISABELA BURGOS RAMOS', 'isabelaburgosramos@gmail.com', '1083869222', '1083869222', '', '3123802569', 1, 'Invitado', 2500012, 1, 'default.png'),
(1083869373, 'CARLOS ALBERTO FINDICUE JOAQUI', 'carlosfindicue64@gmail.com', '1083869373', '1083869373', '', '3134657248', 1, 'Invitado', 2562906, 1, 'default.png'),
(1083869585, 'JOSE RICARDO AMBITO BAIQUE', 'ambitobaiquericardo@gmail.com', '1083869585', '1083869585', '', '3138612504', 1, 'Invitado', 2541039, 1, 'default.png'),
(1083869937, 'RUBEN DARIO MEDINA CHAVARRO', 'r8610dario@gmail.com', '1083869937', '1083869937', '', '3133900076', 1, 'Invitado', 2469966, 1, 'default.png'),
(1083869943, 'EDIXON SEMANATE GOMEZ', 'esemanate@misena.edu.co', '1083869943', '1083869943', '', 'null', 1, 'Invitado', 2554406, 1, 'default.png'),
(1083870026, 'JISETH GARCIA ROJAS', 'cgaro176@gmail.com', '1083870026', '1083870026', '', '3207031485', 1, 'Invitado', 2500012, 1, 'default.png'),
(1083870514, 'ANYELI PATRICIA GASCA COLLAZOS', 'agascacollazos@gmail.com', '1083870514', '1083870514', '', '3217882137', 1, 'Invitado', 2562906, 1, 'default.png'),
(1083870541, 'WILLIAM MAURICIO RODRIGUEZ DIAZ', 'maurorodriguez1208@gmail.com', '1083870541', '1083870541', '', '3233093677', 1, 'Invitado', 2500267, 1, 'default.png'),
(1083870562, 'MARIA FERNANDA ROJAS DUCUARA', 'mariafernanda31234@gmail.com', '1083870562', '1083870562', '', 'null', 1, 'Invitado', 2500096, 1, 'default.png'),
(1083870584, 'DIEGO ARMANDO SILVA ALVAREZ', 'diegosilva870405@gmail.com', '1083870584', '1083870584', '', '3118991021', 1, 'Invitado', 2500274, 1, 'default.png'),
(1083870610, 'ANDRY SULEIDY PEÑA RENDON', 'andrypenarendon@gmail.com', '1083870610', '1083870610', '', '3204238978', 1, 'Invitado', 2562906, 1, 'default.png'),
(1083871059, 'HEIDY CAMILA VARGAS RIVERA', 'cami22vr@gmail.com', '1083871059', '1083871059', '', '3112489139', 1, 'Invitado', 2500117, 1, 'default.png'),
(1083871179, 'ANYI VALENTINA VARGAS MAMIAN', 'anyva2005@gmail.com', '1083871179', '1083871179', '', '3118412741', 1, 'Invitado', 2500012, 1, 'default.png'),
(1083872311, 'OSCAR FABIAN IBARRA CAMAYO', 'oscaribarra9@outlook.com', '1083872311', '1083872311', '', '3133425442', 1, 'Invitado', 2500117, 1, 'default.png'),
(1083872557, 'RENE FERNEY MORALES MORALES', 'moralesmoralesreneferney@gmail.com', '1083872557', '1083872557', '', '3213451128', 1, 'Invitado', 2541039, 1, 'default.png'),
(1083872747, 'LEANDRO EZEQUIEL TORRES PANQUEVA', 'leotorresp32@gmail.com', '1083872747', '1083872747', '', '3133285890', 1, 'Invitado', 2500267, 1, 'default.png'),
(1083873820, 'ALEJANDRO CARLOSAMA SANCHEZ', 'alejocarlosanchez@gmail.com', '1083873820', '1083873820', '', '3128134716', 1, 'Invitado', 2451011, 1, 'default.png'),
(1083874139, 'OSCAR MAURICIO BONILLA VASQUEZ', 'ombonilla9@misena.edu.co', '1083874139', '1083874139', '', '3214242406', 2, 'Invitado', 0, 1, 'default.png'),
(1083874917, 'JAVIER EDUARDO GOMEZ ROJAS', 'jegomez7194@misena.edu.co', '1083874917', '1083874917', '', '3233068421', 2, 'Invitado', 0, 1, 'default.png'),
(1083875307, 'KAREN VANESSA ARGOTE SANCHEZ', 'kargote5@gmail.com', '1083875307', '1083875307', '', 'null', 1, 'Invitado', 2541039, 1, 'default.png'),
(1083876215, 'ARBEY CARDENAS ARTUNDUAGA', 'arbey_car@hotmail.com', '1083876215', '1083876215', '', 'null', 1, 'Invitado', 2468752, 1, 'default.png'),
(1083877022, 'BREYNER STIVEN NARVAEZ BOTINA', 'actualizar@sena.edu.co', '1083877022', '1083877022', '', 'null', 1, 'Invitado', 2469966, 1, 'default.png'),
(1083877176, 'JHON ALEXANDER CASTAÑO GOMEZ', 'alexcg553@gmail.com', '1083877176', '1083877176', '', '3104114341', 1, 'Invitado', 2326610, 1, 'default.png'),
(1083878528, 'YENY ALEXANDRA BECERRA MUÑOZ', 'becerrayeny62@gmail.com', '1083878528', '1083878528', '', '3115727930', 1, 'Invitado', 2469570, 1, 'default.png'),
(1083880270, 'WILLIAM ALEXANDER ANACONA MALES', 'anaconaalexander01.males@gmail.com', '1083880270', '1083880270', '', 'null', 1, 'Invitado', 2468752, 1, 'default.png'),
(1083882293, 'RUBEN DARIO JOVEN SILVA', 'rubenjoven128@hotmail.com', '1083882293', '1083882293', '', '3203948160', 1, 'Invitado', 2541039, 1, 'default.png'),
(1083883612, 'NATALIA DELGADO TORRES', 'pitalito1989@gmail.com', '1083883612', '1083883612', '', '3229170383', 1, 'Invitado', 2280193, 1, 'default.png'),
(1083884133, 'YEIMI ALEXANDRA GONZALEZ RODRIGUEZ', 'yagonzalez331@misena.edu.co', '1083884133', '1083884133', '', '3103223345', 1, 'Invitado', 2541039, 1, 'default.png'),
(1083884998, 'JADERSON YAMIL CASTILLO', 'jadersonyamil@gmail.com', '1083884998', '1083884998', '', '3229006285', 1, 'Invitado', 2562906, 1, 'default.png'),
(1083886191, 'CARLOS GUILLERMO RODRIGUEZ RENGIFO', 'cargui.rodriguez@misena.edu.co', '1083886191', '1083886191', '', '3125971683', 2, 'Invitado', 0, 1, '1083886191.png'),
(1083887611, 'CRISTIAN MAURICIO ROBAYO QUINAYAS', 'mauricio.robayo90@gmail.com', '1083887611', '1083887611', '', '3125372440', 1, 'Invitado', 2500267, 1, 'default.png'),
(1083889514, 'CAROLINA CARVAJAL ARANDA', 'carvis65@hotmail.com', '1083889514', '1083889514', '', '3002785052', 1, 'Invitado', 2280193, 1, 'default.png'),
(1083894215, 'YAMID EFREN ESPINOSA GUERRERO', 'yamidef.8@gmail.com', '1083894215', '1083894215', '', 'null', 1, 'Invitado', 2468752, 1, 'default.png'),
(1083896746, 'JUAN PABLO CARBAJAL RIOS', 'arq.juanplablocarvajal@gmail.com', '1083896746', '1083896746', '', '3153916504', 2, 'Invitado', 0, 1, 'default.png'),
(1083896934, 'CRISTIAN LEONARDO RIVERA GAVIRIA', 'riveragaviriac@gmail.com', '1083896934', '1083896934', '', '3223211584', 1, 'Invitado', 2562906, 1, 'default.png'),
(1083897794, 'DIANA MARIA MENSA ORTIZ', 'diana.m.ortiz1601@gmail.com', '1083897794', '1083897794', '', '3203944126', 1, 'Invitado', 2500267, 1, 'default.png'),
(1083898287, 'ALFONSO IBARRA BELTRAN', 'valentinaibarra634@gmail.com', '1083898287', '1083898287', '', '3112829294', 1, 'Invitado', 2500117, 1, 'default.png'),
(1083898406, 'OSCAR IVAN PERDOMO GOMEZ', 'Oscarivanperdomogomez8@gmail.com', '1083898406', '1083898406', '', '3125325070', 1, 'Invitado', 2541039, 1, 'default.png'),
(1083898530, 'SANDRA MILENA MENESES BASTIDAS', 'nicolasalexander2202@gmail.com', '1083898530', '1083898530', '', '3208015669', 1, 'Invitado', 2500012, 1, 'default.png'),
(1083899474, 'CARLOS ALEJANDRO TOVAR MURCIA', 'c.a.t.1478@hotmail.com', '1083899474', '1083899474', '', '3195716920', 1, 'Invitado', 2500096, 1, 'default.png'),
(1083899583, 'EDWAR A. VERGARA CALDERON', 'veca_2611@hotmail.com', '1083899583', '1083899583', '', '3102446633', 2, 'Invitado', 0, 1, 'default.png'),
(1083900614, 'MESIAS ANTONIO MARTINEZ SALAZAR', 'antonio.martinez900614@gmail.com', '1083900614', '1083900614', '', '3134722641', 1, 'Invitado', 2546882, 1, 'default.png'),
(1083901107, 'ELKIN YESID BOLAÑOS ORTIZ', 'yesid3280@gmail.com', '1083901107', '1083901107', '', '3118402901', 1, 'Invitado', 2469570, 1, 'default.png'),
(1083903843, 'DIANA PAOLA SOSCUE MAMIAN', 'dpsoscue3@misena.edu.co', '1083903843', '1083903843', '', '3204813840', 1, 'Invitado', 2186843, 1, 'default.png'),
(1083907806, 'NELCY JUDITH RAMIREZ PERDOMO', 'judith18@misena.edu.co', '1083907806', '1083907806', '', '3132858337', 1, 'Invitado', 2451009, 1, 'default.png'),
(1083908574, 'MARY LEIDY ZULUAGA CANACUE', 'zuluagas005@gmail.com', '1083908574', '1083908574', '', 'null', 1, 'Invitado', 2554406, 1, 'default.png'),
(1083909990, 'SMITH DARIO MONCADA RAMOS', 'Smithmoncada195@gmail.com', '1083909990', '1083909990', '', '3054151153', 1, 'Invitado', 2562906, 1, 'default.png'),
(1083913626, 'JUAN DIEGO CORTES OSPINA', 'arqcortes03@gmail.com', '1083913626', '1083913626', '', '3106065711', 1, 'Invitado', 2500274, 1, 'default.png'),
(1083913664, 'JOSE FERNANDO BUSTOS JOJOA', 'bustos.jb@gmail.com', '1083913664', '1083913664', '', 'null', 1, 'Invitado', 2541039, 1, 'default.png'),
(1083914957, 'SERGIO NICOLAS GASCA TRUJILLO', 'nicolreal2009@hotmail.com', '1083914957', '1083914957', '', '3102177445', 1, 'Invitado', 2554406, 1, 'default.png'),
(1083915217, 'CARLOS MAURICIO GOMEZ ORTEGA', 'mauricio.gomez96@outlook.com', '1083915217', '1083915217', '', '3124836863', 1, 'Invitado', 2500012, 1, 'default.png'),
(1083915877, 'JAVIER HERNAN GOMEZ PEREZ', 'castillo-exg2@hotmail.com', '1083915877', '1083915877', '', 'null', 1, 'Invitado', 2554406, 1, 'default.png'),
(1083916015, 'JUAN DAVID LOPEZ MOTTA', 'lpzdavidjm@gmail.com', '1083916015', '1083916015', '', '3118591365', 1, 'Invitado', 2554406, 1, 'default.png'),
(1083917926, 'VANESSA QUINTANA MAHECHA', 'mahechavane99@gmail.com', '1083917926', '1083917926', '', '3142415116', 1, 'Invitado', 2451001, 1, 'default.png'),
(1083919421, 'JUAN SEBASTIAN RUIZ SUAREZ', 'jsruiz240@misena.edu.co', '1083919421', '1083919421', '', '315-740-3499', 2, 'Invitado', 0, 1, 'default.png'),
(1083920078, 'LUIS FERNANDO MURCIA RESTREPO', 'luiss.restrepofm@gmail.com', '1083920078', '1083920078', '', 'null', 1, 'Invitado', 2500139, 1, 'default.png'),
(1083920781, 'JEFERSON ANDREY CARVAJAL TORO', 'andrescarvajal733@gmail.com', '1083920781', '1083920781', '', '3124145146', 1, 'Invitado', 2546882, 1, 'default.png'),
(1083921165, 'LISANDRO PERALTA PULIDO', 'peraltapulido993@gmail.com', '1083921165', '1083921165', '', '3138298979', 1, 'Invitado', 2500139, 1, 'default.png'),
(1083921794, 'SERGIO ALEJANDRO BETANCOURTH TORO', 'alejandrobetancourth74@hotmail.com', '1083921794', '1083921794', '', '3118898404', 1, 'Invitado', 2500096, 1, 'default.png'),
(1083922181, 'ANYI PAOLA FIGUEROA VELA', 'paolfig0071@hotmail.com', '1083922181', '1083922181', '', '3208473737', 1, 'Invitado', 2500012, 1, 'default.png'),
(1083924883, 'DIANA PAOLA TAFUR VARGAS', 'tafurpaola15@gmail.com', '1083924883', '1083924883', '', '3202607980', 1, 'Invitado', 2236073, 1, 'default.png'),
(1083925927, 'OSCAR HERNANDO RIOS REAL', 'oscarreal96@gmail.com', '1083925927', '1083925927', '', '3222890904', 1, 'Invitado', 2500267, 1, 'default.png'),
(1083927338, 'JUAN DAVID RIVERA BOLAÑOS', 'juandavidriverabolanos975@gmail.com', '1083927338', '1083927338', '', '3001234567', 1, 'Invitado', 2541039, 1, 'default.png'),
(1083927443, 'DERLY JOHANNA DIAZ BUENDIA', 'fliadiaz43@gmail.com', '1083927443', '1083927443', '', '3133542738', 1, 'Invitado', 2500070, 1, 'default.png'),
(1083927587, 'YEISON ANDRES HERNANDEZ LOPEZ', 'yeison45andres@gmail.com', '1083927587', '1083927587', '', '3222733961', 1, 'Invitado', 2451011, 1, 'default.png'),
(1083927626, 'JOHANA FERNANDA IMBACHI SAMBONI', 'Sambonij51@gmail.com', '1083927626', '1083927626', '', '3125979225', 1, 'Invitado', 2554406, 1, 'default.png'),
(1083928150, 'JORGE EDUARDO SUAREZ MUÑOZ', 'jorgsuarez937@gmail.com', '1083928150', '1083928150', '', '3156156891', 1, 'Invitado', 2500070, 1, 'default.png'),
(1083928678, 'Sandra Milena Riveros ', 'smriveros@sena.edu.co', '1083928678', '1083928678', 'Pitalito', '3223115063', 4, 'Punto Venta', 0, 1, 'default.png'),
(1083928882, 'ANGELA YULIETH RIVERA VARGAS', 'angelarivera0316@gmail.com', '1083928882', '1083928882', '', '3167936208', 1, 'Invitado', 2280193, 1, 'default.png'),
(1083929520, 'MARIA SOFIA ORDOÑEZ OTAYA', 'mariasofiaordonezotaya@gmail.com', '1083929520', '1083929520', '', '3213126515', 1, 'Invitado', 2500267, 1, 'default.png'),
(1083929900, 'OMAR STEEVEN MENDEZ SAENS', 'co.stivenm@gmail.com', '1083929900', '1083929900', '', '3001564949', 1, 'Invitado', 2426308, 1, 'default.png'),
(1083931202, 'RAMIRO ANDRES OROZCO HURTATIS', 'Andresorozcosc4321@gmail.com', '1083931202', '1083931202', '', '3003209755', 1, 'Invitado', 2500094, 1, 'default.png'),
(1083931348, 'LAURA ISABEL CUELLAR NUÑEZ', 'isabelcuellar796@gmail.com', '1083931348', '1083931348', '', 'null', 1, 'Invitado', 2500274, 1, 'default.png'),
(1083931431, 'ANDRES FELIPE CHILITO BURGOS', 'chilitofelipe1027@gmail.com', '1083931431', '1083931431', '', 'null', 1, 'Invitado', 2541039, 1, 'default.png'),
(1083984005, 'LILIANA YISELA GOMEZ ANACONA', 'gicelagomez17082020@gmail.com', '1083984005', '1083984005', '', '3508688456', 1, 'Invitado', 2326610, 1, 'default.png'),
(1083984054, 'MARIA JULIANA MUÑOZ SAMBONI', 'Lijumusa3@gmail.com', '1083984054', '1083984054', '', '3133662957', 1, 'Invitado', 2469582, 1, 'default.png'),
(1083984102, 'JUAN CARLOS MENESES ORDOÑEZ', 'juancordoez19@gmail.com', '1083984102', '1083984102', '', '3125557672', 1, 'Invitado', 2469582, 1, 'default.png'),
(1083984132, 'NEIDER YESID MENESES ANACONA', 'neideranacona09@gmail.com', '1083984132', '1083984132', '', '3142023758', 1, 'Invitado', 2469582, 1, 'default.png'),
(1083984147, 'YENCY LEANDRA SALAMANCA CASTILLO', 'Salamancacastilloyencyleandra@gmail.com', '1083984147', '1083984147', '', '3107537085', 1, 'Invitado', 2469571, 1, 'default.png'),
(1083984162, 'JUAN FELIPE CHILITO ANACONA', 'juancordobajesus24@gmail.com', '1083984162', '1083984162', '', 'null', 1, 'Invitado', 2500274, 1, 'default.png'),
(1083984231, 'UREILY ELENID ORDOÑEZ SANCHEZ', 'ureilyordonez@gmail.com', '1083984231', '1083984231', '', '3214559637', 1, 'Invitado', 2500139, 1, 'default.png'),
(1083984235, 'MAYRA ALEJANDRA MUÑOZ MUÑOZ', 'munozmayraalejandra45@gmail.com', '1083984235', '1083984235', '', 'null', 1, 'Invitado', 2562906, 1, 'default.png'),
(1083984301, 'GEORLAND STEPHEN GARCES MAMIAN', 'georlandgarces2004@gmail.com', '1083984301', '1083984301', '', '3002345678', 1, 'Invitado', 2500139, 1, 'default.png'),
(1083984323, 'DAVID FERNANDO URBANO GOMEZ', 'davidurbano576@gmail.com', '1083984323', '1083984323', '', 'null', 1, 'Invitado', 2252425, 1, 'default.png'),
(1083984421, 'TANIA NICOLE BRAVO GIRON', 'nicolebravo719@gmail.com', '1083984421', '1083984421', '', 'null', 1, 'Invitado', 2469570, 1, 'default.png'),
(1084250053, 'CRISTIAN DIAZ ORTEGA', 'diazzortega10@gmail.com', '1084250053', '1084250053', '', '3153280127', 1, 'Invitado', 2252425, 1, 'default.png'),
(1084250063, 'KAREN TATIANA IMBACHI CANTILLO', 'cantillokarentatiana@gmail.com', '1084250063', '1084250063', '', 'null', 1, 'Invitado', 2252425, 1, 'default.png'),
(1084250082, 'ANGELA SOFÍA TORRES', 'angelasofiatorresjoaqui@gmail.com', '1084250082', '1084250082', 'Pitalito', '3147665211', 1, 'Invitado', 2252427, 1, 'default.png'),
(1084250695, 'DANIEL FELIPE MENDIETA MURILLO', 'danielfelipemendietamurillo@gmail.com', '1084250695', '1084250695', '', '3124342767', 1, 'Invitado', 2500070, 1, 'default.png'),
(1084250696, 'JULIAN ALBEIRO ESPAÑA ERAZO', 'espanaerazojulianalveiro@gmail.com', '1084250696', '1084250696', '', '3227111579', 1, 'Invitado', 2500274, 1, 'default.png'),
(1084250830, 'ANDRES FELIPE SANCHEZ CASTRO', 'fs109249@gmail.com', '1084250830', '1084250830', '', '3209797849', 1, 'Invitado', 2500274, 1, 'default.png'),
(1084251175, 'MARIA JOSE ÑAÑEZ BUESAQUILLO', 'nanezmariajose73@gmail.com', '1084251175', '1084251175', '', '3114954177', 1, 'Invitado', 2469571, 1, 'default.png'),
(1084251327, 'CRISTIAN FABIAN ROJAS ROJAS', 'cristianfabianr328@gmail.com', '1084251327', '1084251327', '', '3003187469', 1, 'Invitado', 2451009, 1, 'default.png'),
(1084251369, 'LUISA FERNANDA MONTERO SANCHEZ', 'luisamontero0421@gmail.com', '1084251369', '1084251369', '', '3219246871', 1, 'Invitado', 2469570, 1, 'default.png'),
(1084251450, 'JHON ALEXIS GOMEZ JURADO', 'jhonalexis1865@gmail.com', '1084251450', '1084251450', '', 'null', 1, 'Invitado', 2500267, 1, 'default.png'),
(1084251523, 'SERGIO ALEJANDRO TORO ORDOÑEZ', 'sergiotoro522@gmail.com', '1084251523', '1084251523', '', '3123316772', 1, 'Invitado', 2469570, 1, 'default.png'),
(1084251626, 'ANGIE FERNANDA URBANO ARCOS', 'fernanda49urbano@gmail.com', '1084251626', '1084251626', '', 'null', 1, 'Invitado', 2469571, 1, 'default.png'),
(1084251671, 'MARIA ISABEL CERQUERA BOLAÑOS', 'mcerquerabolanos@gmail.com', '1084251671', '1084251671', '', '3208878179', 1, 'Invitado', 2469571, 1, 'default.png'),
(1084251832, 'XIOMARA DAYANA LARA QUINAYAS', 'xiomaralara482@gmail.com', '1084251832', '1084251832', '', '3127825051', 1, 'Invitado', 2469571, 1, 'default.png'),
(1084254443, 'WILLIAM JAVIER NAVIA SANCHEZ', 'naviawilliam7@gmail.com', '1084254443', '1084254443', '', 'null', 1, 'Invitado', 2464124, 1, 'default.png'),
(1084254480, 'LEIDY YAMILE LARA GARCIA', 'laraleidy1990@gmail.com', '1084254480', '1084254480', '', 'null', 1, 'Invitado', 2464124, 1, 'default.png'),
(1084256890, 'JHON JAIRO ORTEGA ROJAS', 'ogarzonp@misena.edu.co', '1084256890', '1084256890', '', 'null', 1, 'Invitado', 2464124, 1, 'default.png'),
(1084257533, 'Yesid Caicedo Añazco', '', '1084257533', '1084257533', 'Cra 25 # 3-08', '', 9, 'Invitado', 0, 1, 'default.png'),
(1084259237, 'CARLOS ARLEY ANACONA ANACONA', 'carlosaanacona@gmail.com', '1084259237', '1084259237', '', '3213232323', 1, 'Invitado', 2464124, 1, 'default.png'),
(1084259832, 'ANNER EDUARDO TINTINAGO MUÑOZ', 'edutimu@gmail.com', '1084259832', '1084259832', '', 'null', 1, 'Invitado', 2464124, 1, 'default.png'),
(1084260730, 'ANDRES MAURICIO MEDINA CERON', 'andres.mceron2510@gmail.com', '1084260730', '1084260730', '', '3126731744', 1, 'Invitado', 2464124, 1, 'default.png'),
(1084330110, 'LAURA CUELLAR FLOREZ', 'lauracuellar2003@gmail.com', '1084330110', '1084330110', '', '3112033331', 1, 'Invitado', 2546882, 1, 'default.png'),
(1084330134, 'SANTIAGO SALAZAR ASTUDILLO', 'santiagoastudillo907@gmail.com', '1084330134', '1084330134', '', '3133200987', 1, 'Invitado', 2252425, 1, 'default.png'),
(1084330210, 'ROCIO CHILITO CHILITO', 'rociochilito16@gmail.com', '1084330210', '1084330210', '', '3157083348', 1, 'Invitado', 2500094, 1, 'default.png'),
(1084330239, 'DIEGO ANDRÉS VALDÉS BENAVIDES', 'diegovaldes144325@gmail.com', '1084330239', '1084330239', '', 'null', 1, 'Invitado', 2451001, 1, 'default.png'),
(1084330285, 'JUAN ESTEBAN ARBOLEDA ARCOS', 'arboleda2148@gmail.com', '1084330285', '1084330285', '', '3178055138', 1, 'Invitado', 2469571, 1, 'default.png'),
(1084330340, 'GISSELA TATIANA ENRIQUEZ VEGA', 'enriquezt617@gmail.com', '1084330340', '1084330340', '', 'null', 1, 'Invitado', 2500117, 1, 'default.png'),
(1084330391, 'SEBASTIAN DIAZ SANCHEZ', 'dsebas255@gmail.com', '1084330391', '1084330391', '', 'null', 1, 'Invitado', 2469570, 1, 'default.png'),
(1084330517, 'LUIS FERNANDO ARTUNDUAGA VEGA', 'luisfernandovega59@gmail.com', '1084330517', '1084330517', '', '3115587853', 1, 'Invitado', 2500274, 1, 'default.png'),
(1084330581, 'JENNIFER FIGUEROA BRAVO', 'jenifb15@gmail.com', '1084330581', '1084330581', '', '3144824243', 1, 'Invitado', 2469582, 1, 'default.png'),
(1084330594, 'LUIS MARIO ALVAREZ MARINQUE', 'luisma26a@gmail.com', '1084330594', '1084330594', '', '3124942374', 1, 'Invitado', 2500096, 1, 'default.png'),
(1084330596, 'LEIBER SMITH MORALES GONZALEZ', 'moralesgonzalezleiber@gmail.com', '1084330596', '1084330596', '', '3222617622', 1, 'Invitado', 2469966, 1, 'default.png'),
(1084330630, 'DAYANA VALENTINA BECERRA AREIZA', 'dayavalen04@gmail.com', '1084330630', '1084330630', '', '3164479538', 1, 'Invitado', 2500267, 1, 'default.png'),
(1084330687, 'DANIELA CUSPIAN JIMENEZ', 'danielacuspian9@gmail.com', '1084330687', '1084330687', '', '3208550107', 1, 'Invitado', 2236073, 1, 'default.png'),
(1084330817, 'LUISA FERNANDA VILLAREAL ROJAS', 'villarealfernanda768@gmail.com', '1084330817', '1084330817', '', '3133277187', 1, 'Invitado', 2469582, 1, 'default.png'),
(1084330977, 'DANIELA PALOMARES FUENTES', 'danipaloma2005@gmail.com', '1084330977', '1084330977', '', '3103395754', 1, 'Invitado', 2451001, 1, 'default.png'),
(1084867845, 'ANA CRISTINA YUSTRES TORRES', 'anayustres15@gmail.com', '1084867845', '1084867845', '', '3114581559', 1, 'Invitado', 2469571, 1, 'default.png'),
(1084896112, 'YULIANA CHAVARRO CLAROS', 'clarosyuliana257@gmail.com', '1084896112', '1084896112', '', '3152855101', 1, 'Invitado', 2236073, 1, 'default.png'),
(1084896174, 'ANYELI TORRES ROJAS', 'atorres4716@misena.edu.co', '1084896174', '1084896174', '', '3222602512', 1, 'Invitado', 2469570, 1, 'default.png'),
(1084896222, 'LUIS MANUEL LOSADA MUÑOZ', 'losadal225@gmail.com', '1084896222', '1084896222', '', '3102926341', 1, 'Invitado', 2562906, 1, 'default.png'),
(1084896223, 'YULEXY LORENA CUELLAR ALVAREZ', 'yulexy.lo22@gmail.com', '1084896223', '1084896223', '', '3132005954', 1, 'Invitado', 2236073, 1, 'default.png'),
(1084896400, 'YENDI VANESSA MOLINA MUÑOZ', 'yvmolina0@misena.edu.co', '1084896400', '1084896400', '', '3102793822', 1, 'Invitado', 2469570, 1, 'default.png'),
(1084896445, 'EDWIN EDUARDO PORTILLA VELASCO', 'eduardoportilla91@gmail.com', '1084896445', '1084896445', '', '3505977797', 1, 'Invitado', 2500094, 1, 'default.png'),
(1084898503, 'MARITZA BECERRA BERMEO', 'maritzabecerrabermeo@gmail.com', '1084898503', '1084898503', '', '3154985869', 1, 'Invitado', 2554406, 1, 'default.png'),
(1084898803, 'MAURICIO CRUZ CHAVARRO', 'mcruz308@misena.edu.co', '1084898803', '1084898803', '', '3154087806', 1, 'Invitado', 2464124, 1, 'default.png'),
(1084900947, 'SERGIO ALEJANDRO VALENCIANO ROJAS', 'Valencianorojassergioalejandro@gmail.com', '1084900947', '1084900947', '', '3213244072', 1, 'Invitado', 2451011, 1, 'default.png'),
(1085275715, 'RUIZ MARTINEZ JENNIFER TATIANA', 'jtruizm@sena.edu.co', '1085275715', '1085275715', '', '3182595772', 2, 'Invitado', 0, 1, 'default.png'),
(1085688083, 'ANA SILVIA MUÑOZ MARTINEZ', 'r_anita24@hotmail.com', '1085688083', '1085688083', '', '3226249369', 2, 'Invitado', 0, 1, 'default.png'),
(1087789576, 'ESTEBAN MADROÑERO DOMINGUEZ', 'estebanmadronerodominguez77@gmail.com', '1087789576', '1087789576', '', 'null', 1, 'Invitado', 2469582, 1, 'default.png'),
(1089478152, 'DARIO SOSCUE OBANDO', 'dariososcue267@gmail.com', '1089478152', '1089478152', '', '3117893228', 1, 'Invitado', 2500267, 1, 'default.png'),
(1089798940, 'DIDIER FABIAN MARTINEZ ECHAVARRIA', 'anamariayjuandavidmartinez@gmail.com', '1089798940', '1089798940', '', '3116078445', 1, 'Invitado', 2426308, 1, 'default.png'),
(1095484680, 'EDWIN ORLANDO PINEDA CAICEDO', 'ewinpinedac@gmail.com', '1095484680', '1095484680', '', '3213641176', 1, 'Invitado', 2500012, 1, 'default.png'),
(1099342287, 'DIDIER ISIDRO JUTINICO ROJAS', 'ewinpinedac@gmail.com', '1099342287', '1099342287', '', '3213641176', 1, 'Invitado', 2500267, 1, 'default.png'),
(1110443999, 'DUBERNEY MENESES MENESES', 'dmeneses99@misena.edu.co', '1110443999', '1110443999', '', '3107715203', 2, 'Invitado', 0, 1, 'default.png'),
(1110492490, 'KAROL TATIANA FIERRO GUTIERREZ', 'ktatianafierro@misena.edu.co', '1110492490', '1110492490', '', '3112021319', 2, 'Invitado', 0, 1, 'default.png'),
(1110579491, 'ANDRES FELIPE MUÑOZ ORTIZ', 'caromurcia05@gmail.com', '1110579491', '1110579491', '', '3138692174', 1, 'Invitado', 2468752, 1, 'default.png'),
(1115940596, 'SARA ELIZABETH RAMIREZ PERDOMO', 'n_judith@hotmail.com', '1115940596', '1115940596', '', '3153042063', 1, 'Invitado', 2500096, 1, 'default.png'),
(1116236879, 'JOSE RENE JIMENEZ CARDONA', 'jrjimenezc@unal.edu.co', '1116236879', '1116236879', '', '3154462394', 2, 'Invitado', 0, 1, 'default.png'),
(1116912148, 'ALEJANDRO CUBILLOS CONTRERAS', 'acubillos841@misena.edu.co', '1116912148', '1116912148', 'Pitalito', '3134039719', 1, 'Invitado', 2252407, 1, 'default.png'),
(1117484046, 'MARIA JOSE GIRALDO TIRADO', 'mariajosegiraldotirado@gmail.com', '1117484046', '1117484046', '', 'null', 1, 'Invitado', 2546882, 1, 'default.png'),
(1117519102, 'JHONY MESA ALEY', 'jmesa332@gmail.com', '1117519102', '1117519102', '', '3202241443', 2, 'Invitado', 0, 1, 'default.png'),
(1117523736, 'ANA MILENA CAMACHO TÁMARA', 'milena219205@gmail.com', '1117523736', '1117523736', '', '3115079441', 2, 'Invitado', 0, 1, 'default.png'),
(1117807030, 'LUIS FERNANDO MENDEZ VALDERRAMA', 'actualizar@sena.edu.co', '1117807030', '1117807030', '', 'null', 1, 'Invitado', 2469966, 1, 'default.png'),
(1117839291, 'CARLOS ANDRES GOMEZ GONZALEZ', 'carlosandresgomezgonzalez929@gmail.com', '1117839291', '1117839291', '', 'null', 1, 'Invitado', 2541039, 1, 'default.png'),
(1118027875, 'ANYI ROCIO COLLAZOS SOTO', 'collazossotoangierocio@gmail.com', '1118027875', '1118027875', '', '3214545997', 1, 'Invitado', 2469966, 1, 'default.png'),
(1118070414, 'YULI CRISTINA CRUZ PAJOY', 'yulicristinacruz04@gmail.com', '1118070414', '1118070414', '', '3144127500', 1, 'Invitado', 2500117, 1, 'default.png'),
(1118362179, 'MIGUEL FELIPE ESCARPETA CULMA', 'miguelfelipeescarpetaculma@gmail.com', '1118362179', '1118362179', '', 'null', 1, 'Invitado', 2464124, 1, 'default.png'),
(1119580199, 'RONAL HERLEY DUSSAN CHAVARRO', 'ronaldussan321@gmail.com', '1119580199', '1119580199', '', '3222035533', 1, 'Invitado', 2500070, 1, 'default.png'),
(1121326596, 'SHIRLEY PAOLA HERRERA IPUANA', 'herreraipuana1506@gmail.com', '1121326596', '1121326596', '', '3217383071', 1, 'Invitado', 2500274, 1, 'default.png'),
(1121842277, 'MARIA LUISA QUIROGA', 'marialuisaquiroga35@gmail.com', '1121842277', '1121842277', '', '3134372637', 1, 'Invitado', 2546882, 1, 'default.png');
INSERT INTO `personas` (`identificacion`, `Nombres`, `Correo`, `Login`, `password`, `Direccion`, `Telefono`, `Cargo`, `Rol`, `Ficha`, `Estado`, `Foto`) VALUES
(1124242185, 'ARELIS GONZALEZ BELTRAN', 'beltrangonzalesarelis@gmail.com', '1124242185', '1124242185', '', '3146243613', 1, 'Invitado', 2426308, 1, 'default.png'),
(1124849310, 'MATEO DANIEL RAMOS BURGOS', 'mateoramosxd5@gmail.com', '1124849310', '1124849310', '', 'null', 1, 'Invitado', 2562906, 1, 'default.png'),
(1124850116, 'BRAYAN LOPEZ PAPAMIJA', 'bray95946@gmail.com', '1124850116', '1124850116', '', '3208883282', 1, 'Invitado', 2500012, 1, 'default.png'),
(1125178767, 'LEIDER JAVIER SUAREZ ZAMBRANO', 'suarezleider326@gmail.com', '1125178767', '1125178767', '', '3105549640', 1, 'Invitado', 2500070, 1, 'default.png'),
(1125179600, 'WENDY JULIETH HOYOS NIETO', 'juliethnieto0209@gmail.com', '1125179600', '1125179600', '', 'null', 1, 'Invitado', 2451001, 1, 'default.png'),
(1126456187, 'ERNEY PERDOMO FIGUEROA', 'erneyperdomoseguimos52@gmail.com', '1126456187', '1126456187', '', '3155587113', 1, 'Invitado', 2469966, 1, 'default.png'),
(1126624391, 'GIAN PIERRE PARRA BUSTOS', 'gianpierrep13@gmail.com', '1126624391', '1126624391', '', '3144536609', 1, 'Invitado', 2500274, 1, 'default.png'),
(1129424305, 'YURI JULIETH TORRES ALARCON', 'yurijulietht21@gmail.com', '1129424305', '1129424305', '', 'null', 1, 'Invitado', 2500139, 1, 'default.png'),
(1133944114, 'YEISON ESTIVEN PARRA MEDINA', 'parrayeison690@gmail.com', '1133944114', '1133944114', '', '3224171686', 1, 'Invitado', 2500139, 1, 'default.png'),
(1143832520, 'CARLOS CHRISTIAN DIAZ IMBACHI', 'christiancronos@hotmail.com', '1143832520', '1143832520', '', '3162877056', 1, 'Invitado', 2500274, 1, 'default.png'),
(1144128106, 'LUZ AMAR GOMEZ MENDEZ', 'tatianagomezcam@gmail.com', '1144128106', '1144128106', '', '3126702597', 1, 'Invitado', 2500094, 1, 'default.png'),
(1144625759, 'NESMAR LUIGUI CHAVES LOPEZ', 'luiguichavex@gmail.com', '1144625759', '1144625759', '', '3163789983', 1, 'Invitado', 2252425, 1, 'default.png'),
(1192762569, 'MONICA GAITÀN RIVERA', 'riveramonny123@gmail.com', '1192762569', '1192762569', '', '3118782825', 1, 'Invitado', 2236074, 1, 'default.png'),
(1193031688, 'DANIEL FELIPE RUIZ DIAZ', 'danielruiz16diaz@gmail.com', '1193031688', '1193031688', '', 'null', 1, 'Invitado', 2500267, 1, 'default.png'),
(1193043009, 'JAIDER HERMIDA CARDENAS', 'jaider2002hermida@gmail.com', '1193043009', '1193043009', '', '3138437368', 1, 'Invitado', 2546882, 1, 'default.png'),
(1193045173, 'YOLANDA BERMEO TRUJILLO', 'yolandabermeotrujillo@gmail.com', '1193045173', '1193045173', '', '3115071898', 1, 'Invitado', 2280204, 1, '1193045173.png'),
(1193100658, 'KAREN YULIANA GUTIERREZ ESPAÑA', 'karenyuliana0105@gmail.com', '1193100658', '1193100658', '', '3105673881', 1, 'Invitado', 2500096, 1, 'default.png'),
(1193128551, 'JUAN PABLO ORREGO GOMEZ', 'juanpabloorregogomez427@gmail.com', '1193128551', '1193128551', '', 'null', 1, 'Invitado', 2554406, 1, 'default.png'),
(1193352609, 'HAIDER FERNANDO MELO MUÑOZ', 'haidermz312@gmail.com', '1193352609', '1193352609', '', '3222865130', 1, 'Invitado', 2500096, 1, 'default.png'),
(1193476840, 'JHON FAIBER OSORIO ALVAREZ', 'jhon3103236676@gmail.com', '1193476840', '1193476840', '', '3227495870', 1, 'Invitado', 2451011, 1, 'default.png'),
(1193562430, 'ANDRY YULIANA ZEMANATE MUÑOZ', 'andryzemanate23@gmail.com', '1193562430', '1193562430', '', '3144932102', 1, 'Invitado', 2500117, 1, 'default.png'),
(1193566292, 'EMMANUEL JOSE PEPICANO CAICEDO', 'gamerecaicedo@gmail.com', '1193566292', '1193566292', '', 'null', 1, 'Invitado', 2500096, 1, 'default.png'),
(1193572095, 'ERICK JULIAN ANACONA RODRIGUEZ', 'erick.anacona2@gmail.com', '1193572095', '1193572095', '', 'null', 1, 'Invitado', 2500267, 1, 'default.png'),
(3116926361, 'MARGARITA SALAS MUÑOZ', 'margysalas@hotmail.com', '3116926361', '3116926361', '', '3116926361', 2, 'Invitado', 0, 1, 'default.png');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `precios`
--

CREATE TABLE `precios` (
  `id_precio` int NOT NULL,
  `fk_cargo` int DEFAULT NULL,
  `fk_producto` int DEFAULT NULL,
  `precio` decimal(10,2) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Volcado de datos para la tabla `precios`
--

INSERT INTO `precios` (`id_precio`, `fk_cargo`, `fk_producto`, `precio`) VALUES
(6, 1, 1, '8000.00'),
(7, 2, 1, '8000.00'),
(8, 3, 1, '8000.00'),
(9, 4, 1, '8000.00'),
(10, 5, 1, '8000.00'),
(13, 6, 1, '8000.00'),
(16, 7, 1, '8000.00'),
(17, 8, 1, '8000.00'),
(18, 9, 1, '8000.00'),
(19, 10, 1, '8000.00'),
(20, 11, 1, '8000.00'),
(22, 12, 1, '8000.00'),
(23, 13, 1, '8000.00'),
(24, 1, 2, '1000.00'),
(25, 2, 2, '1000.00'),
(26, 3, 2, '1000.00'),
(27, 4, 2, '1000.00'),
(28, 5, 2, '1000.00'),
(29, 6, 2, '1000.00'),
(30, 7, 2, '1000.00'),
(31, 8, 2, '1000.00'),
(32, 9, 2, '1000.00'),
(33, 10, 2, '1000.00'),
(34, 11, 2, '1000.00'),
(37, 12, 2, '1000.00'),
(38, 13, 2, '1000.00'),
(39, 1, 4, '2000.00'),
(40, 9, 4, '5000.00'),
(41, 2, 4, '5000.00'),
(42, 4, 4, '5000.00'),
(43, 3, 4, '5000.00');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `produccion`
--

CREATE TABLE `produccion` (
  `Id_produccion` int NOT NULL,
  `Estado` enum('Producido','Aceptado','Rechazado') DEFAULT NULL,
  `Cantidad` decimal(10,2) NOT NULL,
  `fecha` date NOT NULL,
  `Observacion` varchar(50) DEFAULT NULL,
  `fk_codigo_pdto` int NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Volcado de datos para la tabla `produccion`
--

INSERT INTO `produccion` (`Id_produccion`, `Estado`, `Cantidad`, `fecha`, `Observacion`, `fk_codigo_pdto`) VALUES
(1, NULL, '50.00', '2022-07-13', '', 1),
(2, NULL, '12.00', '2022-07-13', '', 1),
(3, NULL, '10.00', '2022-07-15', '', 2);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `productos`
--

CREATE TABLE `productos` (
  `Codigo_pdto` int NOT NULL,
  `Nombre` varchar(50) NOT NULL,
  `Descripcion` varchar(80) DEFAULT NULL,
  `imagen` varchar(80) DEFAULT NULL,
  `Estado` enum('Activo','Inactivo') DEFAULT NULL,
  `Reserva` enum('Si','No') DEFAULT NULL,
  `MaxReserva` int NOT NULL,
  `Tipo` enum('Venta','Servicio') DEFAULT NULL,
  `hora_inicio` time NOT NULL,
  `hora_fin` time NOT NULL,
  `inventario` enum('Si','No') NOT NULL,
  `medidas` varchar(50) NOT NULL,
  `promocion` enum('Si','No') NOT NULL,
  `porcentaje` int NOT NULL,
  `fk_codigo_up` int NOT NULL,
  `fk_tipo_medida` int DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Volcado de datos para la tabla `productos`
--

INSERT INTO `productos` (`Codigo_pdto`, `Nombre`, `Descripcion`, `imagen`, `Estado`, `Reserva`, `MaxReserva`, `Tipo`, `hora_inicio`, `hora_fin`, `inventario`, `medidas`, `promocion`, `porcentaje`, `fk_codigo_up`, `fk_tipo_medida`) VALUES
(1, 'Huevos', 'Huevos AAA', '1657825271272huevos.png', 'Activo', 'Si', 2, 'Venta', '07:00:00', '17:00:00', 'Si', 'Panal x 30', 'No', 0, 2, NULL),
(2, 'Cebolla Larga', 'Cebolla', 'product.jpg', 'Activo', 'No', 1, 'Venta', '07:00:00', '17:00:00', 'Si', 'Unidad x 500g', 'No', 0, 2, NULL),
(3, 'Tomate', 'Tomate fresco', '1657729641990huevos.png', 'Activo', 'Si', 10, 'Venta', '06:00:00', '17:00:00', 'Si', 'Unidad', 'No', 0, 2, NULL),
(4, 'Almuerzos', 'Almuerzo', '1657902243068comida-saludable.jpg', 'Activo', 'Si', 1, 'Venta', '07:00:00', '13:00:00', 'No', 'Unidad', 'No', 0, 4, NULL);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `punto_venta`
--

CREATE TABLE `punto_venta` (
  `Id_punto_vent` int NOT NULL,
  `Sede` enum('Centro','Yamboro') NOT NULL,
  `Direccion` varchar(30) NOT NULL,
  `Nombre` varchar(30) DEFAULT NULL,
  `fk_persona` bigint NOT NULL,
  `Estado` enum('Activo','Inactivo') DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='1';

--
-- Volcado de datos para la tabla `punto_venta`
--

INSERT INTO `punto_venta` (`Id_punto_vent`, `Sede`, `Direccion`, `Nombre`, `fk_persona`, `Estado`) VALUES
(1, 'Yamboro', '', 'Coordinación', 1083928678, 'Activo'),
(2, 'Yamboro', '', 'Superete', 1006947348, 'Activo');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `sena_empresa`
--

CREATE TABLE `sena_empresa` (
  `id_sena` int NOT NULL,
  `nombre` varchar(45) DEFAULT NULL,
  `num_factura` int DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Volcado de datos para la tabla `sena_empresa`
--

INSERT INTO `sena_empresa` (`id_sena`, `nombre`, `num_factura`) VALUES
(1, 'Sena Empresa', 24);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `unidades_productivas`
--

CREATE TABLE `unidades_productivas` (
  `codigo_up` int NOT NULL,
  `Nombre` varchar(40) NOT NULL,
  `Logo` varchar(80) DEFAULT NULL,
  `Descripcion` varchar(100) DEFAULT NULL,
  `sede` enum('Yamboro','Centro') DEFAULT NULL,
  `estado` enum('Activo','Inactivo') DEFAULT NULL,
  `entrega_producto` tinyint(1) NOT NULL,
  `fk_persona` bigint NOT NULL,
  `fk_sena_empresa` int DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Volcado de datos para la tabla `unidades_productivas`
--

INSERT INTO `unidades_productivas` (`codigo_up`, `Nombre`, `Logo`, `Descripcion`, `sede`, `estado`, `entrega_producto`, `fk_persona`, `fk_sena_empresa`) VALUES
(1, 'Biblioteca', 'ud.png', 'Reserva de equipos', 'Yamboro', 'Activo', 0, 1116912148, 1),
(2, 'Agrícola', 'ud.png', '', 'Yamboro', 'Activo', 1, 1116912148, 1),
(3, 'Agroindustria', 'ud.png', '', 'Yamboro', 'Activo', 1, 1116912148, 1),
(4, 'Gastronomía', 'ud.png', '', 'Yamboro', 'Activo', 1, 1020737788, 1),
(5, 'Pecuaria', 'ud.png', '', 'Yamboro', 'Activo', 1, 1116912148, 1),
(6, ' Ambiental - Recursos Naturales', 'ud.png', '', 'Yamboro', 'Activo', 1, 1116912148, 1),
(7, ' Empresa de Servicios Públicos', 'ud.png', '', 'Centro', 'Activo', 1, 1116912148, 1),
(8, ' Escuela Nacional de la Calidad del Café', 'ud.png', '', 'Yamboro', 'Activo', 1, 1116912148, 1),
(9, ' Moda - Comercio y Servicios', 'ud.png', '', 'Yamboro', 'Activo', 1, 1116912148, 1),
(10, 'Unidad Extena', 'ud.png', '', 'Yamboro', 'Activo', 1, 1116912148, 1);

-- --------------------------------------------------------

--
-- Estructura para la vista `listamovimientos`
--
DROP TABLE IF EXISTS `listamovimientos`;

CREATE ALGORITHM=UNDEFINED DEFINER=`root`@`localhost` SQL SECURITY DEFINER VIEW `listamovimientos`  AS SELECT `up`.`codigo_up` AS `codigo_up`, `up`.`Nombre` AS `up`, `p`.`Codigo_pdto` AS `Codigo_pdto`, `p`.`Nombre` AS `producto`, `pv`.`Id_punto_vent` AS `id_punto_vent`, `pv`.`Nombre` AS `punto`, `i`.`stock` AS `stock`, `m`.`Id_movimiento` AS `Id_movimiento`, `m`.`Fecha` AS `Fecha`, `d`.`Estado` AS `Estado`, `m`.`num_factura` AS `num_factura`, `d`.`id_detalle` AS `id_detalle`, `d`.`cantidad` AS `cantidad`, `d`.`valor` AS `valor`, `p`.`porcentaje` AS `porcentaje`, ((`d`.`cantidad` * `d`.`valor`) - ((`d`.`cantidad` * `d`.`valor`) * (`p`.`porcentaje` / 100))) AS `subtotal`, `d`.`Entregado` AS `Entregado`, `per`.`identificacion` AS `identificacion`, `per`.`Nombres` AS `Nombres` FROM ((((((`unidades_productivas` `up` join `productos` `p` on((`p`.`fk_codigo_up` = `up`.`codigo_up`))) join `inventario` `i` on((`i`.`fk_codigo_pdto` = `p`.`Codigo_pdto`))) join `punto_venta` `pv` on((`pv`.`Id_punto_vent` = `i`.`fk_id_punto_vent`))) join `detalle` `d` on((`d`.`fk_id_inventario` = `i`.`id_inventario`))) join `movimientos` `m` on((`m`.`Id_movimiento` = `d`.`fk_Id_movimiento`))) join `personas` `per` on((`per`.`identificacion` = `d`.`Persona`))) ;

-- --------------------------------------------------------

--
-- Estructura para la vista `lista_detalles`
--
DROP TABLE IF EXISTS `lista_detalles`;

CREATE ALGORITHM=UNDEFINED DEFINER=`adsi`@`%` SQL SECURITY DEFINER VIEW `lista_detalles`  AS SELECT DISTINCT `m`.`Id_movimiento` AS `Id_movimiento`, `m`.`tipo` AS `tipo`, `d`.`Estado` AS `Estado`, `m`.`Fecha` AS `Fecha`, `per`.`Cargo` AS `Cargo`, `per`.`Rol` AS `Rol`, `per`.`identificacion` AS `identificacion`, `per`.`Nombres` AS `Persona`, `per`.`Ficha` AS `ficha`, `d`.`id_detalle` AS `id_detalle`, `p`.`Nombre` AS `Nombre`, `p`.`imagen` AS `imagen`, `p`.`porcentaje` AS `porcentaje`, `d`.`cantidad` AS `cantidad`, `d`.`valor` AS `valor`, ((`d`.`valor` * `d`.`cantidad`) - (((`d`.`valor` * `d`.`cantidad`) * `p`.`porcentaje`) / 100)) AS `subtotal`, (select `pn`.`Nombres` from `personas` `pn` where (`pn`.`identificacion` = `d`.`Persona`)) AS `aprendiz` FROM (((((`movimientos` `m` join `personas` `per` on((`per`.`identificacion` = `m`.`fk_persona`))) left join `detalle` `d` on((`d`.`fk_Id_movimiento` = `m`.`Id_movimiento`))) left join `inventario` `iv` on((`iv`.`id_inventario` = `d`.`fk_id_inventario`))) left join `productos` `p` on((`p`.`Codigo_pdto` = `iv`.`fk_codigo_pdto`))) left join `precios` `pr` on(((`pr`.`fk_producto` = `p`.`Codigo_pdto`) and (`pr`.`fk_cargo` = `per`.`Cargo`)))) WHERE (`d`.`id_detalle` is not null) ;

-- --------------------------------------------------------

--
-- Estructura para la vista `lista_produccion_up`
--
DROP TABLE IF EXISTS `lista_produccion_up`;

CREATE ALGORITHM=UNDEFINED DEFINER=`root`@`localhost` SQL SECURITY DEFINER VIEW `lista_produccion_up`  AS SELECT `pd`.`Id_produccion` AS `Id_produccion`, `pd`.`fecha` AS `fecha`, `pr`.`Codigo_pdto` AS `Codigo_pdto`, `pr`.`Nombre` AS `producto`, `pd`.`Estado` AS `Estado`, `up`.`codigo_up` AS `codigo_up`, `up`.`Nombre` AS `nomb_up`, `pd`.`Cantidad` AS `Producido`, (select sum(`b`.`cantidad`) from `bodega` `b` where (`b`.`fk_produccion` = `pd`.`Id_produccion`)) AS `Distribuido`, (`pd`.`Cantidad` - (select sum(`b`.`cantidad`) from `bodega` `b` where (`b`.`fk_produccion` = `pd`.`Id_produccion`))) AS `Disponible` FROM ((`produccion` `pd` join `productos` `pr` on((`pr`.`Codigo_pdto` = `pd`.`fk_codigo_pdto`))) join `unidades_productivas` `up` on((`up`.`codigo_up` = `pr`.`fk_codigo_up`))) ;

-- --------------------------------------------------------

--
-- Estructura para la vista `lista_productos`
--
DROP TABLE IF EXISTS `lista_productos`;

CREATE ALGORITHM=UNDEFINED DEFINER=`root`@`localhost` SQL SECURITY DEFINER VIEW `lista_productos`  AS SELECT `pv`.`Id_punto_vent` AS `Id_punto_vent`, `pv`.`Nombre` AS `Nombre`, `i`.`id_inventario` AS `id_inventario`, `p`.`Nombre` AS `Producto`, `p`.`Descripcion` AS `descripcion`, `p`.`imagen` AS `imagen`, `p`.`Reserva` AS `reserva`, `p`.`Estado` AS `estado`, `p`.`inventario` AS `control_inventario`, `p`.`MaxReserva` AS `maxreserva`, `p`.`Tipo` AS `tipo`, `p`.`hora_inicio` AS `hora_inicio`, `p`.`hora_fin` AS `hora_fin`, `p`.`medidas` AS `medidas`, `p`.`promocion` AS `promocion`, `p`.`porcentaje` AS `porcentaje`, `i`.`stock` AS `stock`, `up`.`codigo_up` AS `codigo_up`, `up`.`Nombre` AS `nomb_up`, `ca`.`idcargo` AS `idcargo`, `ca`.`nombre_cargo` AS `nombre_cargo`, `pr`.`precio` AS `precio` FROM (((((`punto_venta` `pv` join `inventario` `i` on((`i`.`fk_id_punto_vent` = `pv`.`Id_punto_vent`))) join `productos` `p` on((`p`.`Codigo_pdto` = `i`.`fk_codigo_pdto`))) join `precios` `pr` on((`pr`.`fk_producto` = `p`.`Codigo_pdto`))) join `cargo` `ca` on((`ca`.`idcargo` = `pr`.`fk_cargo`))) join `unidades_productivas` `up` on((`up`.`codigo_up` = `p`.`fk_codigo_up`))) ;

--
-- Índices para tablas volcadas
--

--
-- Indices de la tabla `accesos`
--
ALTER TABLE `accesos`
  ADD PRIMARY KEY (`idacceso`),
  ADD KEY `persona_acceso` (`fk_persona`);

--
-- Indices de la tabla `bodega`
--
ALTER TABLE `bodega`
  ADD PRIMARY KEY (`id_bodega`),
  ADD KEY `bodega_inventario_idx` (`fk_inventario`),
  ADD KEY `bodega_produccion_idx` (`fk_produccion`);

--
-- Indices de la tabla `cargo`
--
ALTER TABLE `cargo`
  ADD PRIMARY KEY (`idcargo`);

--
-- Indices de la tabla `detalle`
--
ALTER TABLE `detalle`
  ADD PRIMARY KEY (`id_detalle`),
  ADD KEY `tiene_1` (`fk_Id_movimiento`),
  ADD KEY `tiene_2` (`fk_id_inventario`),
  ADD KEY `Persona` (`Persona`);

--
-- Indices de la tabla `inventario`
--
ALTER TABLE `inventario`
  ADD PRIMARY KEY (`id_inventario`),
  ADD UNIQUE KEY `unique_pv_pto` (`fk_id_punto_vent`,`fk_codigo_pdto`),
  ADD KEY `tiene_3` (`fk_id_punto_vent`),
  ADD KEY `tiene_4` (`fk_codigo_pdto`);

--
-- Indices de la tabla `movimientos`
--
ALTER TABLE `movimientos`
  ADD PRIMARY KEY (`Id_movimiento`),
  ADD KEY `comprar` (`fk_persona`);

--
-- Indices de la tabla `personas`
--
ALTER TABLE `personas`
  ADD PRIMARY KEY (`identificacion`),
  ADD KEY `persona_cargo_idx` (`Cargo`);

--
-- Indices de la tabla `precios`
--
ALTER TABLE `precios`
  ADD PRIMARY KEY (`id_precio`),
  ADD UNIQUE KEY `unique_precios` (`fk_producto`,`fk_cargo`),
  ADD KEY `precio_cargo_idx` (`fk_cargo`),
  ADD KEY `precio_prodcuto_idx` (`fk_producto`);

--
-- Indices de la tabla `produccion`
--
ALTER TABLE `produccion`
  ADD PRIMARY KEY (`Id_produccion`),
  ADD KEY `Fabrica` (`fk_codigo_pdto`);

--
-- Indices de la tabla `productos`
--
ALTER TABLE `productos`
  ADD PRIMARY KEY (`Codigo_pdto`),
  ADD KEY `Genera` (`fk_codigo_up`);

--
-- Indices de la tabla `punto_venta`
--
ALTER TABLE `punto_venta`
  ADD PRIMARY KEY (`Id_punto_vent`),
  ADD KEY `encargado` (`fk_persona`);

--
-- Indices de la tabla `sena_empresa`
--
ALTER TABLE `sena_empresa`
  ADD PRIMARY KEY (`id_sena`);

--
-- Indices de la tabla `unidades_productivas`
--
ALTER TABLE `unidades_productivas`
  ADD PRIMARY KEY (`codigo_up`),
  ADD KEY `Asignar` (`fk_persona`),
  ADD KEY `sena_up` (`fk_sena_empresa`);

--
-- AUTO_INCREMENT de las tablas volcadas
--

--
-- AUTO_INCREMENT de la tabla `accesos`
--
ALTER TABLE `accesos`
  MODIFY `idacceso` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=22;

--
-- AUTO_INCREMENT de la tabla `bodega`
--
ALTER TABLE `bodega`
  MODIFY `id_bodega` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT de la tabla `cargo`
--
ALTER TABLE `cargo`
  MODIFY `idcargo` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=10;

--
-- AUTO_INCREMENT de la tabla `detalle`
--
ALTER TABLE `detalle`
  MODIFY `id_detalle` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=30;

--
-- AUTO_INCREMENT de la tabla `inventario`
--
ALTER TABLE `inventario`
  MODIFY `id_inventario` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT de la tabla `movimientos`
--
ALTER TABLE `movimientos`
  MODIFY `Id_movimiento` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=31;

--
-- AUTO_INCREMENT de la tabla `precios`
--
ALTER TABLE `precios`
  MODIFY `id_precio` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=44;

--
-- AUTO_INCREMENT de la tabla `produccion`
--
ALTER TABLE `produccion`
  MODIFY `Id_produccion` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT de la tabla `productos`
--
ALTER TABLE `productos`
  MODIFY `Codigo_pdto` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT de la tabla `punto_venta`
--
ALTER TABLE `punto_venta`
  MODIFY `Id_punto_vent` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT de la tabla `sena_empresa`
--
ALTER TABLE `sena_empresa`
  MODIFY `id_sena` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT de la tabla `unidades_productivas`
--
ALTER TABLE `unidades_productivas`
  MODIFY `codigo_up` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;

--
-- Restricciones para tablas volcadas
--

--
-- Filtros para la tabla `accesos`
--
ALTER TABLE `accesos`
  ADD CONSTRAINT `accesos_ibfk_1` FOREIGN KEY (`fk_persona`) REFERENCES `personas` (`identificacion`) ON UPDATE CASCADE;

--
-- Filtros para la tabla `bodega`
--
ALTER TABLE `bodega`
  ADD CONSTRAINT `bodega_inventario` FOREIGN KEY (`fk_inventario`) REFERENCES `inventario` (`id_inventario`),
  ADD CONSTRAINT `bodega_produccion` FOREIGN KEY (`fk_produccion`) REFERENCES `produccion` (`Id_produccion`);

--
-- Filtros para la tabla `detalle`
--
ALTER TABLE `detalle`
  ADD CONSTRAINT `detalle_ibfk_1` FOREIGN KEY (`Persona`) REFERENCES `personas` (`identificacion`) ON UPDATE CASCADE,
  ADD CONSTRAINT `tiene_1` FOREIGN KEY (`fk_Id_movimiento`) REFERENCES `movimientos` (`Id_movimiento`),
  ADD CONSTRAINT `tiene_2` FOREIGN KEY (`fk_id_inventario`) REFERENCES `inventario` (`id_inventario`);

--
-- Filtros para la tabla `inventario`
--
ALTER TABLE `inventario`
  ADD CONSTRAINT `tiene_3` FOREIGN KEY (`fk_id_punto_vent`) REFERENCES `punto_venta` (`Id_punto_vent`),
  ADD CONSTRAINT `tiene_4` FOREIGN KEY (`fk_codigo_pdto`) REFERENCES `productos` (`Codigo_pdto`);

--
-- Filtros para la tabla `movimientos`
--
ALTER TABLE `movimientos`
  ADD CONSTRAINT `movimientos_ibfk_1` FOREIGN KEY (`fk_persona`) REFERENCES `personas` (`identificacion`) ON UPDATE CASCADE;

--
-- Filtros para la tabla `personas`
--
ALTER TABLE `personas`
  ADD CONSTRAINT `persona_cargo` FOREIGN KEY (`Cargo`) REFERENCES `cargo` (`idcargo`);

--
-- Filtros para la tabla `precios`
--
ALTER TABLE `precios`
  ADD CONSTRAINT `precio_cargo` FOREIGN KEY (`fk_cargo`) REFERENCES `cargo` (`idcargo`),
  ADD CONSTRAINT `precio_prodcuto` FOREIGN KEY (`fk_producto`) REFERENCES `productos` (`Codigo_pdto`);

--
-- Filtros para la tabla `produccion`
--
ALTER TABLE `produccion`
  ADD CONSTRAINT `produccion_ibfk_1` FOREIGN KEY (`fk_codigo_pdto`) REFERENCES `productos` (`Codigo_pdto`);

--
-- Filtros para la tabla `productos`
--
ALTER TABLE `productos`
  ADD CONSTRAINT `productos_ibfk_1` FOREIGN KEY (`fk_codigo_up`) REFERENCES `unidades_productivas` (`codigo_up`);

--
-- Filtros para la tabla `punto_venta`
--
ALTER TABLE `punto_venta`
  ADD CONSTRAINT `punto_venta_ibfk_1` FOREIGN KEY (`fk_persona`) REFERENCES `personas` (`identificacion`) ON UPDATE CASCADE;

--
-- Filtros para la tabla `unidades_productivas`
--
ALTER TABLE `unidades_productivas`
  ADD CONSTRAINT `sena_up` FOREIGN KEY (`fk_sena_empresa`) REFERENCES `sena_empresa` (`id_sena`) ON UPDATE CASCADE,
  ADD CONSTRAINT `unidades_productivas_ibfk_1` FOREIGN KEY (`fk_persona`) REFERENCES `personas` (`identificacion`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;

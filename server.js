const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const mysql = require('mysql2');
const cors = require('cors');
const bcrypt = require('bcrypt');
const port = 3000;
const path = require('path');


app.use(express.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors());
app.use(express.json());
const nodemailer = require('nodemailer');

app.use(express.static(path.join(__dirname, 'public')));
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'login', 'login.html'));
});
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ message: 'Error interno del servidor' });
});


const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'paurodriguez170@gmail.com', // Cambia esto a tu correo de Gmail
        pass: 'xcof ivfe gvdr vphj',      // Usa una contraseña de aplicación generada en tu cuenta de Gmail
    },
});
const dbModulos = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'Coco1406.',
    database: 'aranda_db'
});
dbModulos.connect(err => {
    if (err) {
        console.error('Error connecting to MySQL:', err);
        process.exit(1);
    }
    console.log('Conectado a la base de datos MySQL (aranda_db)');
});
dbModulos.query(`
    CREATE TABLE IF NOT EXISTS usuarios (
        id INT AUTO_INCREMENT PRIMARY KEY,
        username VARCHAR(255) NOT NULL,
        password VARCHAR(255) NOT NULL,
        userType VARCHAR(50) NOT NULL,
        autorizado TINYINT(1) DEFAULT 0
    )
`, (err) => {
    if (err) throw err;
    console.log('Tabla de usuarios verificada/creada.');
});
dbModulos.query(`
    CREATE TABLE IF NOT EXISTS clientes (
        id INT AUTO_INCREMENT PRIMARY KEY,
        nombre VARCHAR(255) NOT NULL,
        cuit VARCHAR(50) NOT NULL,
        legajo_impositivo VARCHAR(100) NOT NULL
    )
`, (err) => {
    if (err) throw err;
    console.log('Tabla de clientes verificada/creada.');
});
dbModulos.query(`
    CREATE TABLE IF NOT EXISTS caja (
        id INT AUTO_INCREMENT PRIMARY KEY,
        description VARCHAR(255) NOT NULL,
        amount DECIMAL(10, 2) NOT NULL,
        method VARCHAR(50) NOT NULL,
        type ENUM('Ingreso', 'Egreso') NOT NULL,
        date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
`, (err) => {
    if (err) throw err;
    console.log('Tabla de caja verificada/creada.');
});
dbModulos.query(`
    CREATE TABLE IF NOT EXISTS mercaderia (
        id INT AUTO_INCREMENT PRIMARY KEY,
        producto VARCHAR(255) NOT NULL,
        fecha_produccion DATE NOT NULL,
        fecha_vencimiento DATE NOT NULL,
        lote VARCHAR(50) NOT NULL,
        cantidad INT NOT NULL
    )
`, (err) => {
    if (err) throw err;
    console.log('Tabla de mercadería verificada/creada.');
});
dbModulos.query(`
    CREATE TABLE IF NOT EXISTS empleados (
        id INT AUTO_INCREMENT PRIMARY KEY,
        nombre VARCHAR(255) NOT NULL,
        dni VARCHAR(50),
        legajo VARCHAR(50),
        telefono VARCHAR(50),
        tipo_pago ENUM('Mensual', 'PorHora') NOT NULL,
        salario_base DECIMAL(10, 2) DEFAULT NULL,
        horas_trabajadas INT DEFAULT NULL,
        descuento DECIMAL(10, 2) DEFAULT 0,
        total_pago DECIMAL(10, 2) GENERATED ALWAYS AS (
            CASE WHEN tipo_pago = 'Mensual' THEN salario_base - descuento
                 WHEN tipo_pago = 'PorHora' THEN (horas_trabajadas * salario_base) - descuento
            END
        ) STORED
    )
`, (err) => {
    if (err) throw err;
    console.log('Tabla de empleados verificada/creada.');
});
dbModulos.query(`
    CREATE TABLE IF NOT EXISTS stockmp (
        id INT AUTO_INCREMENT PRIMARY KEY,
        producto VARCHAR(255) NOT NULL,
        tipo ENUM('Ingreso', 'Egreso') NOT NULL,
        cantidad INT NOT NULL,
        lote VARCHAR(255) NOT NULL,
        fecha TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
`, (err) => {
    if (err) throw err;
    console.log('Tabla stockmp actualizada/verificada.');
});
dbModulos.query(`
    CREATE TABLE IF NOT EXISTS productos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    producto VARCHAR(255) NOT NULL UNIQUE,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
`, (err) => {
    if (err) throw err;
    console.log('Tabla productos actualizada/verificada.');
});
dbModulos.query(`
    CREATE TABLE IF NOT EXISTS costos (
        id INT AUTO_INCREMENT PRIMARY KEY,
        producto VARCHAR(50) NOT NULL,
        ingrediente VARCHAR(50) DEFAULT NULL,
        cantidad_bulto DECIMAL(10, 2) DEFAULT NULL,
        precio_bulto DECIMAL(10, 2) DEFAULT NULL,
        cantidad_kg DECIMAL(10, 2) DEFAULT NULL,
        cantidad_utilizo DECIMAL(10, 2) DEFAULT NULL,
        rinde DECIMAL(10, 2) DEFAULT NULL,
        tipo_plastico VARCHAR(50) DEFAULT NULL,
        precio_plastico DECIMAL(10, 2) DEFAULT NULL,
        tipo ENUM('ingrediente', 'plastico') NOT NULL,
        fecha TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
`, (err) => {
    if (err) throw err;
    console.log('Tabla costos verificada/creada.');
});
dbModulos.query(`
    CREATE TABLE IF NOT EXISTS pedidos (
        id INT AUTO_INCREMENT PRIMARY KEY,
        vendedor VARCHAR(255) NOT NULL,
        empresa VARCHAR(255) NOT NULL,
        producto JSON NOT NULL,
        fecha DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        estado ENUM('En Proceso', 'Finalizado') NOT NULL DEFAULT 'En Proceso'
    );
`, (err) => {
    if (err) throw err;
    console.log('Tabla de pedidos verificada/creada.');
});
dbModulos.query(`
    CREATE TABLE IF NOT EXISTS clientes_d (
        id INT AUTO_INCREMENT PRIMARY KEY,
        nombre_cliente VARCHAR(255) NOT NULL,
        nombre_local VARCHAR(255) NOT NULL,
        direccion VARCHAR(255) NOT NULL,
        ciudad VARCHAR(255) NOT NULL,
        telefono VARCHAR(15) NOT NULL
    );
`, (err) => {
    if (err) throw err;
    console.log('Tabla de clientes_d verificada/creada.');
});
dbModulos.query(`
    CREATE TABLE IF NOT EXISTS produccion (
        id INT AUTO_INCREMENT PRIMARY KEY,
        producto VARCHAR(255) NOT NULL,
        fecha DATE NOT NULL,
        produccion INT NOT NULL,
        fecha_vencimiento DATE NOT NULL,
        numero_lote VARCHAR(255) NOT NULL
    );
`, (err) => {
    if (err) throw err;
    console.log('Tabla de producción verificada/creada.');
});
dbModulos.query(`
    CREATE TABLE IF NOT EXISTS cambios (
        id INT AUTO_INCREMENT PRIMARY KEY,
        producto VARCHAR(255) NOT NULL,
        cliente VARCHAR(255) NOT NULL,
        fecha DATE NOT NULL,
        lote VARCHAR(255) NOT NULL,
        fecha_vencimiento DATE,
        descripcion TEXT,
        cantidad INT NOT NULL
    );
`, (err) => {
    if (err) throw err;
    console.log('Tabla cambios verificada/creada.');
});
dbModulos.query(`
    CREATE TABLE IF NOT EXISTS plazos_pago (
        idPlazo INT AUTO_INCREMENT PRIMARY KEY,
        idCliente INT NOT NULL,
        formaPago VARCHAR(255) NOT NULL,
        totalPagar DECIMAL(10, 2) NOT NULL,
        fecha DATE NOT NULL,
        pago DECIMAL(10, 2),
        FOREIGN KEY (idCliente) REFERENCES clientes(id) ON DELETE CASCADE
    )
`, (err) => {
    if (err) throw err;
    console.log('Tabla de plazos_pago verificada/creada.');
});
dbModulos.query(`
    CREATE TABLE IF NOT EXISTS mercaderiaClientes (
        idMercaderia INT AUTO_INCREMENT PRIMARY KEY,
        idCliente INT NOT NULL,
        descripcion VARCHAR(255) NOT NULL,
        cantidad INT NOT NULL,
        precio DECIMAL(10, 2) NOT NULL,
        fecha DATE NOT NULL,
        FOREIGN KEY (idCliente) REFERENCES clientes(id) ON DELETE CASCADE
    )
`, (err) => {
    if (err) throw err;
    console.log('Tabla de mercaderiaClientes verificada/creada.');
});
app.post('/mercaderiaCliente', (req, res) => {
    const { idCliente, descripcion, cantidad, precio, fecha } = req.body;

    if (!idCliente || !descripcion || !cantidad || !precio || !fecha) {
        return res.status(400).json({ message: 'Todos los campos son obligatorios.' });
    }

    const sql = `
        INSERT INTO mercaderiaClientes (idCliente, descripcion, cantidad, precio, fecha)
        VALUES (?, ?, ?, ?, ?)
    `;
    dbModulos.query(sql, [idCliente, descripcion, cantidad, precio, fecha], (err, result) => {
        if (err) {
            console.error('Error al guardar mercadería:', err);
            return res.status(500).json({ message: 'Error al guardar mercadería.' });
        }
        res.status(201).json({ id: result.insertId, message: 'Mercadería agregada con éxito' });
    });
});
app.get('/mercaderiaCliente/:idCliente', (req, res) => {
    const { idCliente } = req.params;

    const sql = `
        SELECT idMercaderia, descripcion, cantidad, CAST(precio AS DECIMAL(10,2)) AS precio, fecha
        FROM mercaderiaClientes
        WHERE idCliente = ?
    `;

    dbModulos.query(sql, [idCliente], (err, rows) => {
        if (err) {
            console.error('Error al obtener mercadería:', err);
            return res.status(500).json({ message: 'Error al obtener mercadería.' });
        }
        res.json(rows);
    });
});
app.delete('/mercaderiaCliente/:id', (req, res) => {
    const { id } = req.params;

    const sql = `
        DELETE FROM mercaderiaClientes
        WHERE idMercaderia = ?
    `;
    dbModulos.query(sql, [id], (err, result) => {
        if (err) {
            console.error('Error al eliminar mercadería:', err);
            return res.status(500).json({ message: 'Error al eliminar mercadería.' });
        }
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Registro de mercadería no encontrado.' });
        }
        res.json({ message: 'Registro de mercadería eliminado con éxito' });
    });
});
app.post('/plazos-pago', (req, res) => {
    const { idCliente, formaPago, totalPagar, fecha, pago } = req.body;

    if (!idCliente || !formaPago || !totalPagar || !fecha) {
        return res.status(400).json({ message: 'Todos los campos son obligatorios excepto "pago".' });
    }

    const sql = `
        INSERT INTO plazos_pago (idCliente, formaPago, totalPagar, fecha, pago)
        VALUES (?, ?, ?, ?, ?)
    `;
    dbModulos.query(sql, [idCliente, formaPago, totalPagar, fecha, pago], (err, result) => {
        if (err) {
            console.error('Error al guardar plazo de pago:', err);
            return res.status(500).json({ message: 'Error al guardar plazo de pago.' });
        }
        res.status(201).json({ id: result.insertId, message: 'Plazo de pago agregado con éxito' });
    });
});
app.get('/plazos-pago/:idCliente', (req, res) => {
    const { idCliente } = req.params;

    const sql = `
        SELECT idPlazo, formaPago, totalPagar, fecha, pago
        FROM plazos_pago
        WHERE idCliente = ?
    `;
    dbModulos.query(sql, [idCliente], (err, rows) => {
        if (err) {
            console.error('Error al obtener plazos de pago:', err);
            return res.status(500).json({ message: 'Error al obtener plazos de pago.' });
        }
        res.json(rows);
    });
});
app.put('/plazos-pago/registrar-pago', (req, res) => {
    const { idPlazo, montoPago } = req.body;

    if (!idPlazo || !montoPago || isNaN(montoPago)) {
        console.error('Datos inválidos recibidos:', req.body);
        return res.status(400).json({ message: 'ID del plazo y monto del pago son obligatorios y deben ser válidos.' });
    }

    const sql = `
        UPDATE plazos_pago
        SET pago = IFNULL(pago, 0) + ?
        WHERE idPlazo = ?
    `;
    dbModulos.query(sql, [montoPago, idPlazo], (err, result) => {
        if (err) {
            console.error('Error al registrar el pago:', err);
            return res.status(500).json({ message: 'Error al registrar el pago.' });
        }
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'No se encontró el plazo de pago.' });
        }

        // Confirmar el pago actualizado
        res.status(200).json({ message: 'Pago registrado con éxito.' });
    });
});
app.get('/cambios/cliente/:idCliente', (req, res) => {
    const idCliente = req.params.idCliente;

    const query = `
        SELECT producto, fecha, lote, fecha_vencimiento, descripcion, cantidad 
        FROM cambios 
        WHERE cliente = (SELECT nombre FROM clientes WHERE id = ?)
    `;

    dbModulos.query(query, [idCliente], (err, results) => {
        if (err) {
            console.error('Error al obtener cambios del cliente:', err.message);
            return res.status(500).json({ error: 'Error al obtener cambios del cliente.' });
        }
        res.json(results);
    });
});
app.post('/cambios', (req, res) => {
    const { producto, cliente, fecha, lote, fecha_vencimiento, descripcion, cantidad } = req.body;

    if (!producto || !cliente || !fecha || !lote || cantidad == null) {
        return res.status(400).json({ message: 'Los campos producto, cliente, fecha, lote y cantidad son obligatorios.' });
    }

    const query = `
        INSERT INTO cambios (producto, cliente, fecha, lote, fecha_vencimiento, descripcion, cantidad)
        VALUES (?, ?, ?, ?, ?, ?, ?)
    `;
    dbModulos.query(query, [producto, cliente, fecha, lote, fecha_vencimiento || null, descripcion || null, cantidad], (err) => {
        if (err) {
            console.error('Error al registrar el cambio:', err.message);
            return res.status(500).json({ error: 'Error al registrar el cambio.' });
        }
        res.json({ message: 'Cambio registrado con éxito.' });
    });
});
app.get('/traer_cambios', (req, res) => {
    const { fecha } = req.query;
    let query = `SELECT * FROM cambios`;
    const params = [];

    if (fecha) {
        query += ` WHERE fecha = ?`;
        params.push(fecha);
    }
    query += ` ORDER BY fecha DESC`;

    dbModulos.query(query, params, (err, results) => {
        if (err) {
            console.error('Error al obtener los cambios:', err.message);
            return res.status(500).json({ error: 'Error al obtener los cambios.' });
        }
        res.json(results);
    });
});
app.put('/cambios/:id', (req, res) => {
    const { id } = req.params;
    const { producto, fecha, lote, fecha_vencimiento, descripcion, cliente, cantidad } = req.body;

    if (!producto || !fecha || !lote || !cliente || cantidad == null) {
        return res.status(400).json({ message: 'Todos los campos obligatorios excepto la descripción y fecha de vencimiento.' });
    }

    const query = `
        UPDATE cambios 
        SET producto = ?, fecha = ?, lote = ?, fecha_vencimiento = ?, descripcion = ?, cliente = ?, cantidad = ?
        WHERE id = ?
    `;
    dbModulos.query(query, [producto, fecha, lote, fecha_vencimiento || null, descripcion || null, cliente, cantidad, id], (err) => {
        if (err) {
            console.error('Error al actualizar el cambio:', err.message);
            return res.status(500).json({ message: 'Error al actualizar el cambio.' });
        }
        res.json({ message: 'Cambio actualizado con éxito.' });
    });
});
app.delete('/cambios/:id', (req, res) => {
    const { id } = req.params;

    const query = `DELETE FROM cambios WHERE id = ?`;
    dbModulos.query(query, [id], (err) => {
        if (err) {
            console.error('Error al eliminar el cambio:', err.message);
            return res.status(500).json({ message: 'Error al eliminar el cambio.' });
        }
        res.json({ message: 'Cambio eliminado con éxito.' });
    });
});
app.post('/produccion', (req, res) => {
    const { producto, fecha, produccion, fecha_vencimiento, numero_lote } = req.body;

    if (!producto || !fecha || !produccion || !fecha_vencimiento || !numero_lote) {
        return res.status(400).json({ message: 'Todos los campos son obligatorios.' });
    }

    const query = `
        INSERT INTO produccion (producto, fecha, produccion, fecha_vencimiento, numero_lote)
        VALUES (?, ?, ?, ?, ?)
    `;
    dbModulos.query(query, [producto, fecha, produccion, fecha_vencimiento, numero_lote], (err) => {
        if (err) {
            console.error('Error al registrar la producción:', err.message);
            return res.status(500).json({ error: 'Error al registrar la producción.' });
        }
        res.json({ message: 'Producción registrada con éxito.' });
    });
});
app.get('/traer_produccion', (req, res) => {
    const { fecha } = req.query; // Captura el parámetro de fecha de la query string
    let query = `SELECT * FROM produccion`;
    const params = [];

    if (fecha) {
        query += ` WHERE fecha = ?`; // Agrega la condición de filtro por fecha
        params.push(fecha);
    }
    query += ` ORDER BY fecha DESC`;

    dbModulos.query(query, params, (err, results) => {
        if (err) {
            console.error('Error al obtener la producción:', err.message);
            return res.status(500).json({ error: 'Error al obtener la producción.' });
        }
        res.json(results);
    });
});
app.put('/produccion/:id', (req, res) => {
    const { id } = req.params;
    const { producto, fecha, produccion, fecha_vencimiento, numero_lote } = req.body;

    if (!producto || !fecha || !produccion || !fecha_vencimiento || !numero_lote) {
        return res.status(400).json({ message: 'Todos los campos son obligatorios.' });
    }

    const query = `
        UPDATE produccion 
        SET producto = ?, fecha = ?, produccion = ?, fecha_vencimiento = ?, numero_lote = ?
        WHERE id = ?
    `;
    dbModulos.query(query, [producto, fecha, produccion, fecha_vencimiento, numero_lote, id], (err) => {
        if (err) {
            console.error('Error al actualizar la producción:', err.message);
            return res.status(500).json({ error: 'Error al actualizar la producción.' });
        }
        res.json({ message: 'Producción actualizada con éxito.' });
    });
});
app.delete('/produccion/:id', (req, res) => {
    const { id } = req.params;

    const query = `DELETE FROM produccion WHERE id = ?`;
    dbModulos.query(query, [id], (err) => {
        if (err) {
            console.error('Error al eliminar la producción:', err.message);
            return res.status(500).json({ error: 'Error al eliminar la producción.' });
        }
        res.json({ message: 'Producción eliminada con éxito.' });
    });
});
app.post('/pedidos', (req, res) => {
    const { vendedor, empresa, productos, cliente } = req.body;

    if (!vendedor || !empresa || !Array.isArray(productos) || productos.length === 0 || !cliente) {
        return res.status(400).json({ message: 'Todos los campos son obligatorios.' });
    }

    const { nombre_cliente, nombre_local, direccion, ciudad, telefono } = cliente;
    if (!nombre_cliente || !nombre_local || !direccion || !ciudad || !telefono) {
        return res.status(400).json({ message: 'Todos los datos del cliente son obligatorios.' });
    }

    const invalidProduct = productos.find(p => !p.product || !p.quantity || p.quantity <= 0);
    if (invalidProduct) {
        return res.status(400).json({ message: 'Cada producto debe tener un nombre válido y una cantidad mayor a 0.' });
    }

    const insertClientSql = `
        INSERT INTO clientes_d (nombre_cliente, nombre_local, direccion, ciudad, telefono)
        VALUES (?, ?, ?, ?, ?)
    `;
    dbModulos.query(insertClientSql, [nombre_cliente, nombre_local, direccion, ciudad, telefono], (err, clientResult) => {
        if (err) {
            console.error('Error al registrar el cliente:', err.message);
            return res.status(500).json({ error: 'Error al registrar el cliente.' });
        }

        const clientId = clientResult.insertId;

        const insertPedidoSql = `
            INSERT INTO pedidos (vendedor, empresa, producto, fecha)
            VALUES (?, ?, ?, ?)
        `;
        const productosJson = JSON.stringify(productos);

        dbModulos.query(insertPedidoSql, [clientId, empresa, productosJson, new Date()], (err) => {
            if (err) {
                console.error('Error al registrar el pedido:', err.message);
                return res.status(500).json({ error: 'Error al registrar el pedido.' });
            }

            res.json({ message: 'Pedido y cliente registrados con éxito.' });
        });
    });
});
app.get('/traer_clientes', (req, res) => {
    const query = `
        SELECT 
            c.id AS distribuidor,
            c.nombre_cliente,
            c.nombre_local,
            c.direccion,
            c.ciudad,
            c.telefono,
            p.empresa AS empresa_distribuidor
        FROM clientes_d AS c
        LEFT JOIN pedidos AS p ON c.id = p.vendedor;
    `;

    dbModulos.query(query, (err, results) => {
        if (err) {
            console.error('Error al obtener los clientes:', err.message);
            return res.status(500).json({ error: 'Error al obtener los clientes.' });
        }

        const formattedResults = results.map(cliente => ({
            ...cliente,
            distribuidor: cliente.empresa_distribuidor || 'Sin Empresa'
        }));

        res.json(formattedResults);
    });
});
app.get('/traer_clientes', (req, res) => {
    const query = `
        SELECT 
            c.id AS distribuidor,
            c.nombre_cliente,
            c.nombre_local,
            c.direccion,
            c.ciudad,
            c.telefono,
            p.empresa AS empresa_distribuidor
        FROM clientes_d AS c
        LEFT JOIN pedidos AS p ON c.id = p.vendedor;
    `;

    dbModulos.query(query, (err, results) => {
        if (err) {
            console.error('Error al obtener los clientes:', err.message);
            return res.status(500).json({ error: 'Error al obtener los clientes.' });
        }

        // Reemplazar el campo `distribuidor` con `empresa_distribuidor` si existe
        const formattedResults = results.map(cliente => ({
            ...cliente,
            distribuidor: cliente.empresa_distribuidor || 'Sin Empresa'
        }));

        res.json(formattedResults);
    });
});
app.get('/traer_pedidos', (req, res) => {
    const selectSql = `
        SELECT id, vendedor, empresa, producto, fecha, estado
        FROM pedidos
        WHERE estado = 'En Proceso'
        ORDER BY fecha DESC
    `;

    dbModulos.query(selectSql, (err, results) => {
        if (err) {
            console.error('Error al obtener los pedidos:', err.message);
            return res.status(500).json({ error: 'Error al obtener los pedidos.' });
        }

        res.json(results);
    });
});
app.get('/traer_pedido/:id', (req, res) => {
    const pedidoId = req.params.id;
    dbModulos.query('SELECT * FROM pedidos WHERE id = ?', [pedidoId], (error, results) => {
        if (error) {
            res.status(500).json({ error: 'Error al obtener el pedido.' });
        } else {
            res.status(200).json(results[0]);
        }
    });
});
app.put('/actualizar_estado', (req, res) => {
    const { id, estado } = req.body;

    if (!id || !estado) {
        return res.status(400).json({ message: 'El ID y el estado son obligatorios.' });
    }

    const updateSql = `
        UPDATE pedidos
        SET estado = ?
        WHERE id = ?
    `;

    dbModulos.query(updateSql, [estado, id], (err) => {
        if (err) {
            console.error('Error al actualizar el estado del pedido:', err.message);
            return res.status(500).json({ error: 'Error al actualizar el estado.' });
        }

        res.json({ message: 'Estado actualizado con éxito.' });
    });
});
app.post('/send-authorization-email', (req, res) => {
    const { username, email, userType } = req.body;

    if (!email || !username || !userType) {
        return res.status(400).json({ message: 'Todos los campos son obligatorios.' });
    }

    const mailOptions = {
        from: 'paurodriguez170@gmail.com',
        to: email,
        subject: 'Autorización de registro en el sistema',
        html: `
            <h1>Solicitud de Autorización</h1>
            <p>El usuario <strong>${username}</strong> ha solicitado registrarse como <strong>${userType}</strong> en el sistema.</p>
            <p>Por favor, autorice o rechace la solicitud:</p>
            <a href="http://localhost:3000/approve?username=${username}" style="margin-right: 10px;">Autorizar</a>
            <a href="http://localhost:3000/reject?username=${username}">Rechazar</a>
        `,
    };

    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            console.error('Error al enviar correo:', error);
            return res.status(500).json({ message: 'Error al enviar correo.' });
        }
        res.status(200).json({ message: 'Correo enviado con éxito.', info });
    });
});
app.get('/approve', (req, res) => {
    const { username } = req.query;

    if (!username) {
        return res.status(400).json({ message: 'Falta el nombre de usuario.' });
    }

    const sql = 'UPDATE usuarios SET autorizado = 1 WHERE username = ?';
    dbModulos.query(sql, [username], (err, result) => {
        if (err) {
            console.error('Error al actualizar usuario:', err);
            return res.status(500).json({ message: 'Error al aprobar usuario.' });
        }
        res.send('<h1>Usuario autorizado con éxito.</h1>');
    });
});
app.get('/reject', (req, res) => {
    const { username } = req.query;

    if (!username) {
        return res.status(400).json({ message: 'Falta el nombre de usuario.' });
    }

    const sql = 'DELETE FROM usuarios WHERE username = ?';
    dbModulos.query(sql, [username], (err, result) => {
        if (err) {
            console.error('Error al eliminar usuario:', err);
            return res.status(500).json({ message: 'Error al rechazar usuario.' });
        }
        res.send('<h1>Usuario rechazado con éxito.</h1>');
    });
});
app.post('/register', (req, res) => {
    const { username, password, userType } = req.body;

    if (!username || !password || !userType) {
        return res.status(400).json({ message: 'Todos los campos son obligatorios.' });
    }

    bcrypt.hash(password, 10, (err, hashedPassword) => {
        if (err) {
            return res.status(500).json({ message: 'Error en la encriptación de la contraseña.' });
        }

        const sql = 'INSERT INTO usuarios (username, password, userType) VALUES (?, ?, ?)';
        dbModulos.query(sql, [username, hashedPassword, userType], (err, result) => {
            if (err) {
                console.error('Error al registrar usuario:', err);
                return res.status(500).json({ message: 'Error al registrar usuario.' });
            }
            res.status(201).json({ id: result.insertId, message: 'Usuario registrado con éxito' });
        });
    });
})
app.post('/iniciarSesion', (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ message: 'Todos los campos son obligatorios.' });
    }

    const sql = 'SELECT * FROM usuarios WHERE username = ?';
    dbModulos.query(sql, [username], (err, results) => {
        if (err) {
            return res.status(500).json({ message: 'Error en la base de datos.' });
        }

        if (results.length === 0) {
            return res.status(401).json({ message: 'Usuario no encontrado.' });
        }

        const user = results[0];
        bcrypt.compare(password, user.password, (err, isMatch) => {
            if (err) {
                return res.status(500).json({ message: 'Error en la comparación de contraseñas.' });
            }

            if (isMatch) {
                if (user.autorizado) { // Verificación de autorizado
                    res.json({
                        success: true,
                        username: user.username,
                        userType: user.userType,
                        autorizado: user.autorizado
                    });
                } else {
                    res.json({ success: false, autorizado: false });
                }
            } else {
                res.status(401).json({ message: 'Contraseña incorrecta.' });
            }
        });
    });
});
const verificarEmpleado = (req, res, next) => {
    const userType = req.userType; // Supongamos que esta información viene con un token o sesión

    if (userType !== 'empleado') {
        return res.status(403).json({ message: 'Acceso no autorizado' });
    }
    next();
};
app.post('/registrar_costos', (req, res) => {
    const {
        producto, ingrediente, cantidad_bulto, precio_bulto,
        cantidad_kg, cantidad_utilizo, rinde,
        tipo_plastico, precio_plastico
    } = req.body;

    if (!producto) {
        return res.status(400).json({ message: 'El campo producto es obligatorio.' });
    }

    const tipo = ingrediente ? 'ingrediente' : 'plastico';

    const sql = `
        INSERT INTO costos (
            producto, ingrediente, cantidad_bulto, precio_bulto,
            cantidad_kg, cantidad_utilizo, rinde, 
            tipo_plastico, precio_plastico, tipo
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    dbModulos.query(sql, [
        producto, ingrediente || null, cantidad_bulto || null, precio_bulto || null,
        cantidad_kg || null, cantidad_utilizo || null, rinde || null,
        tipo_plastico || null, precio_plastico || null, tipo
    ], (err, result) => {
        if (err) {
            console.error('Error al registrar costos:', err.message);
            return res.status(500).json({ error: 'Error al registrar costos' });
        }
        res.json({ id: result.insertId, message: 'Costo registrado con éxito' });
    });
});
app.get('/obtener_costos_producto/:producto', (req, res) => {
    const { producto } = req.params;

    const sqlIngredientes = `
        SELECT id, producto, ingrediente, cantidad_bulto, precio_bulto, cantidad_kg, 
               cantidad_utilizo, rinde, fecha 
        FROM costos 
        WHERE tipo = 'ingrediente' AND producto = ?
    `;
    const sqlPlasticos = `
        SELECT id, producto, tipo_plastico, precio_plastico, fecha 
        FROM costos 
        WHERE tipo = 'plastico' AND producto = ?
    `;

    dbModulos.query(sqlIngredientes, [producto], (err, ingredientes) => {
        if (err) {
            console.error('Error al obtener costos de ingredientes:', err.message);
            return res.status(500).json({ error: 'Error al obtener costos de ingredientes' });
        }

        dbModulos.query(sqlPlasticos, [producto], (err, plasticos) => {
            if (err) {
                console.error('Error al obtener costos de plásticos:', err.message);
                return res.status(500).json({ error: 'Error al obtener costos de plásticos' });
            }

            res.json({ ingredientes, plasticos });
        });
    });
});
app.get('/total_por_paquete/:producto', (req, res) => {
    const { producto } = req.params;

    const sql = `
        SELECT
            SUM(COALESCE(precio_plastico, 0)) AS total_plasticos,
            SUM(COALESCE(precio_plastico, 0)) AS total_por_paquete
        FROM costos
        WHERE producto = ?
    `;

    dbModulos.query(sql, [producto], (err, results) => {
        if (err) {
            console.error('Error al calcular total por paquete:', err.message);
            return res.status(500).json({ error: 'Error al calcular total por paquete' });
        }

        const total = results.length > 0 ? results[0].total_por_paquete || 0 : 0;
        res.json({ total_por_paquete: total });
    });
});
app.get('/obtener_todos_costos', (req, res) => {
    const sql = `
        SELECT 
            producto,
            SUM(COALESCE(precio_plastico, 0)) AS total_plasticos,
            SUM(COALESCE(precio_plastico, 0)) AS total_por_paquete
        FROM costos
        GROUP BY producto
    `;

    dbModulos.query(sql, (err, results) => {
        if (err) {
            console.error('Error al obtener todos los costos:', err.message);
            return res.status(500).json({ error: 'Error al obtener los costos' });
        }
        res.json(results || []);
    });
});
app.delete('/eliminar_costo/:id', (req, res) => {
    const { id } = req.params;

    if (!id) {
        return res.status(400).json({ message: 'El ID es obligatorio para eliminar un costo.' });
    }

    const sql = `DELETE FROM costos WHERE id = ?`;

    dbModulos.query(sql, [id], (err, result) => {
        if (err) {
            console.error('Error al eliminar el costo:', err.message);
            return res.status(500).json({ error: 'Error al eliminar el costo.' });
        }

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'No se encontró el registro para eliminar.' });
        }

        res.json({ message: 'Costo eliminado con éxito.' });
    });
});
app.put('/actualizar_costo', (req, res) => {
    const { id, tipo, nuevoPrecio } = req.body;

    // Validar tipo
    if (!['ingredientes', 'plasticos'].includes(tipo)) {
        return res.status(400).json({ error: 'Tipo de tabla inválido.' });
    }

    // Determinar el campo a actualizar
    const campo = tipo === 'ingredientes' ? 'precio_bulto' : 'precio_plastico';

    // Consulta SQL ajustada
    const query = `UPDATE costos SET ${campo} = ? WHERE id = ?`;

    dbModulos.query(query, [nuevoPrecio, id], (err, result) => {
        if (err) {
            console.error(err);
            res.status(500).json({ error: 'Error al actualizar el costo' });
        } else {
            res.json({ message: 'Costo actualizado correctamente' });
        }
    });
});
app.post('/movimientos_materia_prima', (req, res) => {
    const { producto, tipo, cantidad, lote } = req.body;

    // Validaciones
    if (!producto || !tipo || !cantidad || !lote || isNaN(cantidad) || cantidad <= 0) {
        return res.status(400).json({ message: 'Todos los campos son obligatorios y deben tener valores válidos.' });
    }

    const sql = `
        INSERT INTO stockmp (producto, tipo, cantidad, lote) 
        VALUES (?, ?, ?, ?)
    `;

    dbModulos.query(sql, [producto, tipo, parseInt(cantidad), lote], (err, result) => {
        if (err) {
            console.error('Error al registrar el movimiento:', err.message);
            return res.status(500).json({ error: 'Error al registrar el movimiento' });
        }
        res.json({ id: result.insertId, message: 'Movimiento registrado con éxito' });
    });
});
app.post('/agregar_producto', (req, res) => {
    const { producto } = req.body;

    // Validaciones
    if (!producto || producto.trim() === '') {
        return res.status(400).json({ message: 'El nombre del producto es obligatorio.' });
    }

    const sql = `
        INSERT INTO productos (producto) 
        VALUES (?)
    `;

    dbModulos.query(sql, [producto.trim()], (err, result) => {
        if (err) {
            if (err.code === 'ER_DUP_ENTRY') {
                return res.status(409).json({ error: 'El producto ya existe.' });
            }
            console.error('Error al agregar el producto:', err.message);
            return res.status(500).json({ error: 'Error al agregar el producto' });
        }
        res.json({ id: result.insertId, message: 'Producto agregado con éxito' });
    });
});
app.get('/disponibilidad_materia_prima', (req, res) => {
    const sql = `
        SELECT producto, lote, SUM(CASE WHEN tipo = 'Ingreso' THEN cantidad ELSE -cantidad END) AS disponibilidad
        FROM stockmp
        GROUP BY producto, lote
    `;

    dbModulos.query(sql, (err, results) => {
        if (err) {
            console.error('Error al obtener la disponibilidad:', err.message);
            return res.status(500).json({ error: 'Error al obtener la disponibilidad' });
        }
        res.json(results);
    });
});
app.get('/productos', (req, res) => {
    const sql = 'SELECT producto FROM productos';

    dbModulos.query(sql, (err, results) => {
        if (err) {
            console.error('Error al obtener productos:', err.message);
            return res.status(500).json({ error: 'Error al obtener productos' });
        }
        res.json(results); // Asegúrate de que `results` contiene los datos correctos
    });
});
app.post('/registrar-empleado', (req, res) => {
    console.log("Datos recibidos:", req.body);
    const { tipo, nombre, dni, legajo, telefono, sueldo, pagoHora } = req.body;

    let tipo_pago = tipo === 'Mensual' ? 'Mensual' : 'PorHora';
    let salario_base = tipo_pago === 'Mensual' ? sueldo : pagoHora;
    let horas_trabajadas = tipo_pago === 'PorHora' ? 0 : null;
    const query = `INSERT INTO empleados (tipo_pago, nombre, dni, legajo, telefono, salario_base, horas_trabajadas) VALUES (?, ?, ?, ?, ?, ?, ?)`;
    dbModulos.query(query, [tipo_pago, nombre, dni, legajo, telefono, salario_base, horas_trabajadas], (err, result) => {
        if (err) {
            console.error("Error al insertar empleado:", err);
            res.status(500).json({ message: "Error al guardar empleado en la base de datos" });
        } else {
            console.log("Empleado registrado correctamente");
            res.status(200).json({ message: "Empleado registrado exitosamente" });
        }
    });
});
app.get('/obtener-empleados', (req, res) => {
    const sql = `SELECT * FROM empleados`;
    dbModulos.query(sql, (err, rows) => {
        if (err) {
            console.error('Error al obtener empleados:', err);
            return res.status(500).json({ message: 'Error al obtener empleados.' });
        }
        res.json(rows);
    });
});
app.get('/obtener-empleado/:id', (req, res) => {
    const empleadoId = req.params.id;
    const query = 'SELECT * FROM empleados WHERE id = ?';
    dbModulos.query(query, [empleadoId], (err, result) => {
        if (err) {
            console.error('Error al obtener empleado:', err);
            res.status(500).json({ message: 'Error al obtener empleado' });
        } else {
            res.status(200).json(result[0]);
        }
    });
});
app.put('/aplicar-descuento/:empleadoId', (req, res) => {
    const empleadoId = req.params.empleadoId;
    const { descuento } = req.body;

    const query = 'UPDATE empleados SET descuento = ? WHERE id = ?';
    dbModulos.query(query, [descuento, empleadoId], (err, result) => {
        if (err) {
            console.error('Error al aplicar descuento:', err);
            return res.status(500).json({ success: false, message: 'Error al aplicar descuento.' });
        }
        if (result.affectedRows === 0) {
            return res.status(404).json({ success: false, message: 'Empleado no encontrado.' });
        }
        res.json({ success: true, message: 'Descuento aplicado correctamente.' });
    });
});
app.put('/registrar-asistencia/:id', (req, res) => {
    const { horasTrabajadas, tipoPago } = req.body;
    const empleadoId = req.params.id;

    const query = 'UPDATE empleados SET horas_trabajadas = IFNULL(horas_trabajadas, 0) + ? WHERE id = ? AND tipo_pago = ?';
    const params = [horasTrabajadas, empleadoId, tipoPago];

    dbModulos.query(query, params, (err, results) => {
        if (err) {
            console.error('Error al registrar asistencia:', err);
            res.status(500).json({ message: 'Error al registrar asistencia' });
        } else {
            res.json({ message: 'Asistencia registrada con éxito' });
        }
    });
});
app.put('/reiniciar-datos/:tipoPago', (req, res) => {
    const { tipoPago } = req.params;
    const reiniciarCampos = {
        horas_trabajadas: 0,
        descuento: 0,
    };

    let query = '';
    if (tipoPago === 'Mensual') {
        query = 'UPDATE empleados SET horas_trabajadas = ?, descuento = ? WHERE tipo_pago = "Mensual"';
    } else if (tipoPago === 'PorHora') {
        query = 'UPDATE empleados SET horas_trabajadas = ?, descuento = ? WHERE tipo_pago = "PorHora"';
    } else {
        return res.status(400).json({ success: false, message: 'Tipo de pago inválido.' });
    }
    dbModulos.query(query, [reiniciarCampos.horas_trabajadas, reiniciarCampos.descuento], (err, result) => {
        if (err) {
            console.error('Error al reiniciar los datos:', err);
            return res.status(500).json({ success: false, message: 'Error al reiniciar los datos.' });
        }
        res.json({ success: true, message: `Datos reiniciados correctamente para ${tipoPago === 'Mensual' ? 'mensuales' : 'por hora'}.` });
    });
});
app.put('/editar-pago/:id', (req, res) => {
    const empleadoId = req.params.id;
    const { salario_base } = req.body;

    if (!salario_base || isNaN(salario_base)) {
        return res.status(400).json({ message: 'Pago inválido.' });
    }

    const query = 'UPDATE empleados SET salario_base = ? WHERE id = ?';
    connection.query(query, [salario_base, empleadoId], (error, results) => {
        if (error) {
            console.error('Error al actualizar el pago:', error);
            return res.status(500).json({ message: 'Error del servidor.' });
        }

        if (results.affectedRows === 0) {
            return res.status(404).json({ message: 'Empleado no encontrado.' });
        }

        res.json({ message: 'Pago actualizado correctamente.' });
    });
});
app.put('/actualizar-sueldo', (req, res) => {
    const { id, tipoPago, nuevoSueldo } = req.body;
    const campo = tipoPago === 'Mensual' ? 'salario_base' : 'salario_base'; // Aquí puedes ajustar el campo según sea necesario
    const query = `UPDATE empleados SET ${campo} = ? WHERE id = ?`;

    dbModulos.query(query, [nuevoSueldo, id], (err, result) => {
        if (err) {
            console.error(err);
            res.status(500).json({ error: 'Error al actualizar el sueldo' });
        } else {
            res.json({ message: 'Sueldo actualizado correctamente' });
        }
    });
});
app.delete('/eliminar-empleado/:id', (req, res) => {
    const empleadoId = req.params.id;
    dbModulos.query('DELETE FROM empleados WHERE id = ?', [empleadoId], (err, result) => {
        if (err) {
            res.status(500).json({ message: 'Error al eliminar el empleado.' });
        } else {
            res.json({ success: true, message: 'Empleado eliminado correctamente.' });
        }
    });
});
app.get('/mercaderia/:producto', (req, res) => {
    const { producto } = req.params;

    const sql = `
        SELECT producto, fecha_produccion, fecha_vencimiento, lote, cantidad 
        FROM mercaderia 
        WHERE producto = ?
        ORDER BY fecha_vencimiento ASC
    `;
    dbModulos.query(sql, [producto], (err, results) => {
        if (err) {
            console.error('Error al obtener los datos:', err.message);
            return res.status(500).json({ error: 'Error al obtener los datos de mercadería' });
        }
        res.json(results);
    });
});
app.post('/mercaderia/ingreso', (req, res) => {
    const { producto, fecha_produccion, fecha_vencimiento, lote, cantidad } = req.body;

    if (!producto || !fecha_produccion || !fecha_vencimiento || !lote || !cantidad) {
        return res.status(400).json({ message: 'Todos los campos son obligatorios.' });
    }

    const selectSql = `
        SELECT * FROM mercaderia 
        WHERE producto = ? AND lote = ? AND fecha_vencimiento = ?
    `;
    dbModulos.query(selectSql, [producto, lote, fecha_vencimiento], (err, results) => {
        if (err) return res.status(500).json({ error: err.message });

        if (results.length > 0) {
            // Actualizar cantidad si el lote ya existe
            const updateSql = `
                UPDATE mercaderia SET cantidad = cantidad + ? 
                WHERE producto = ? AND lote = ? AND fecha_vencimiento = ?
            `;
            dbModulos.query(updateSql, [cantidad, producto, lote, fecha_vencimiento], (err) => {
                if (err) return res.status(500).json({ error: err.message });
                res.json({ message: 'Ingreso de mercadería actualizado con éxito.' });
            });
        } else {
            // Insertar nueva entrada
            const insertSql = `
                INSERT INTO mercaderia (producto, fecha_produccion, fecha_vencimiento, lote, cantidad) 
                VALUES (?, ?, ?, ?, ?)
            `;
            dbModulos.query(insertSql, [producto, fecha_produccion, fecha_vencimiento, lote, cantidad], (err) => {
                if (err) return res.status(500).json({ error: err.message });
                res.json({ message: 'Ingreso de mercadería registrado con éxito.' });
            });
        }
    });
});
app.post('/mercaderia/egreso', (req, res) => {
    const { producto, lote, fecha_vencimiento, cantidad } = req.body;

    if (!producto || !lote || !fecha_vencimiento || !cantidad) {
        return res.status(400).json({ message: 'Todos los campos son obligatorios.' });
    }

    const selectSql = `
        SELECT cantidad FROM mercaderia 
        WHERE producto = ? AND lote = ? AND fecha_vencimiento = ?
    `;
    dbModulos.query(selectSql, [producto, lote, fecha_vencimiento], (err, results) => {
        if (err) {
            console.error('Error al consultar la base de datos:', err.message);
            return res.status(500).json({ error: 'Error al consultar la base de datos.' });
        }

        if (results.length === 0) {
            return res.status(404).json({ message: 'No se encontró el producto con la fecha de vencimiento y lote especificado.' });
        }

        const cantidadDisponible = results[0].cantidad;

        if (cantidadDisponible < cantidad) {
            return res.status(400).json({ message: 'Cantidad insuficiente para realizar el egreso.' });
        }

        const updateSql = `
            UPDATE mercaderia 
            SET cantidad = cantidad - ? 
            WHERE producto = ? AND lote = ? AND fecha_vencimiento = ?
        `;
        dbModulos.query(updateSql, [cantidad, producto, lote, fecha_vencimiento], (err) => {
            if (err) {
                console.error('Error al actualizar la cantidad:', err.message);
                return res.status(500).json({ error: 'Error al registrar el egreso.' });
            }

            res.json({ message: 'Egreso de mercadería registrado con éxito.' });
        });
    });
});
app.get('/modulos/stockMateriaPrima', verificarEmpleado, (req, res) => {
    res.sendFile(path.join(__dirname, 'modulos/stockMateriaPrima.html'));
});
app.get('/modulos/stockMercaderia', verificarEmpleado, (req, res) => {
    res.sendFile(path.join(__dirname, 'modulos/stockMercaderia.html'));
});
app.post('/transacciones', (req, res) => {
    const { id_producto, tipo, cantidad } = req.body;

    if (!id_producto || !tipo || !cantidad) {
        return res.status(400).json({ message: 'Todos los campos son obligatorios.' });
    }
    const sql = 'INSERT INTO transacciones (id_producto, tipo, cantidad) VALUES (?, ?, ?)';
    dbModulos.query(sql, [id_producto, tipo, cantidad], (err, result) => {
        if (err) {
            console.error('Error al registrar la transacción:', err.message);
            return res.status(500).json({ error: 'Error al registrar la transacción' });
        }
        res.json({ id: result.insertId, message: 'Transacción registrada con éxito' });
    });
});
app.post('/transactions', (req, res) => {
    const { description, amount, method, type } = req.body;

    const sql = 'INSERT INTO caja (description, amount, method, type) VALUES (?, ?, ?, ?)';
    dbModulos.query(sql, [description, amount, method, type], (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ id: result.insertId, message: `${type} agregado con éxito` });
    });
});
app.get('/transactions', (req, res) => {
    const sql = 'SELECT * FROM caja ORDER BY date DESC';
    dbModulos.query(sql, (err, rows) => {
        if (err) {
            return res.status(400).json({ error: err.message });
        }
        res.json(rows);
    });
});
app.get('/transactions/date/:date', (req, res) => {
    const { date } = req.params;

    const query = 'SELECT * FROM caja WHERE DATE(date) = ?';
    dbModulos.query(query, [date], (error, results) => {
        if (error) {
            console.error('Error al obtener transacciones por fecha:', error);
            res.status(500).json({ error: 'Error al obtener transacciones' });
        } else {
            res.json(results);
        }
    });
});
app.get('/summary', (req, res) => {
    const sql =
        'SELECT type, SUM(amount) AS total FROM caja GROUP BY type';
    dbModulos.query(sql, (err, rows) => {
        if (err) {
            return res.status(400).json({ error: err.message });
        }
        res.json(rows);
    });
})
app.post('/clientes', (req, res) => {
    const { nombre, cuit, legajo_impositivo } = req.body;

    if (!nombre || !cuit || !legajo_impositivo) {
        return res.status(400).json({ message: 'Todos los campos son obligatorios.' });
    }

    const sql = 'INSERT INTO clientes (nombre, cuit, legajo_impositivo) VALUES (?, ?, ?)';
    dbModulos.query(sql, [nombre, cuit, legajo_impositivo], (err, result) => {
        if (err) {
            console.error('Error al agregar cliente:', err);
            return res.status(500).json({ message: 'Error al agregar cliente.' });
        }
        res.status(201).json({ id: result.insertId, message: 'Cliente agregado con éxito' });
    });
});
app.get('/clientes', (req, res) => {
    const nombre = req.query.nombre || '';
    const sql = 'SELECT * FROM clientes WHERE nombre LIKE ?';
    const searchValue = `%${nombre}%`;

    dbModulos.query(sql, [searchValue], (err, rows) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.json({ clientes: rows });
    });
});
app.put('/clientes/:id', (req, res) => {
    const { id } = req.params;
    const { nombre, cuit, legajo_impositivo } = req.body;

    const sql = 'UPDATE clientes SET nombre = ?, cuit = ?, legajo_impositivo = ? WHERE id = ?';
    dbModulos.query(sql, [nombre, cuit, legajo_impositivo, id], (err, result) => {
        if (err) {
            console.error('Error al editar cliente:', err);
            return res.status(500).json({ message: 'Error al editar cliente.' });
        }
        res.json({ message: 'Cliente editado con éxito' });
    });
});
app.delete('/clientes/:id', (req, res) => {
    const { id } = req.params;

    const sql = 'DELETE FROM clientes WHERE id = ?';
    dbModulos.query(sql, [id], (err, result) => {
        if (err) {
            console.error('Error al eliminar cliente:', err);
            return res.status(500).json({ message: 'Error al eliminar cliente.' });
        }
        res.json({ message: 'Cliente eliminado con éxito' });
    });
});
app.use((req, res) => {
    res.status(404).json({ message: 'Página no encontrada' });
});
app.listen(port, () => {
    console.log(`Servidor corriendo en http://localhost:${port}`);
});

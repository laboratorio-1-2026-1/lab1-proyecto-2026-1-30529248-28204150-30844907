PASO A PASO PARA LEVANTAR LA APLICACIÓN Y LA BASE DE DATOS CON DOCKER:

Primero y principal, se debe ejecutar el Docker Desktop (tenerlo activo aunque sea en segundo plano).
Luego, en la terminal (preferiblemente en la terminal del editor que estés utilizando), se ejecuta el comando que llama al archivo docker-compose.yml para inicializar el contenedor de docker:

docker-compose up -d

Una vez completada la inicialización, ejecutamos el siguiente comando para asegurarnos de tener el cliente de prisma:

npx prisma generate

Con ello, ya tenemos activos el contenedor, la base de datos y el cliente de prisma. Ahora nos faltaría insertar datos iniciales a la base de datos. Para ello, llamaremos al seed.js que se encuentra en la carpeta db, utilizando el siguiente comando:

npx prisma db seed

Al completarse, ya tendremos los datos iniciales en la base de datos.
A continuación solo debemos abrir la api para comenzar a utilizarla, utilizando solo uno de estos dos comandos:

npm run dev
npm start

Al ejecutarlo, cargará en nuestra terminal una serie de textos, y entre ellos, el link del localhost que nos permite ejecutar y utilizar la api.

INSTRUCCIONES PARA EL USO DE LA API:

Al iniciar la api, una vez en la interfaz, debemos iniciar sesión con el endpoint de autenticación 
/api/v1/auth/login. Hacemos click en él, luego en "Try Out", y a continuación se nos pedirá el email y la contraseña. Por defecto, tenemos el email admin@smartgym.com y la contraseña admin123, para un usuario que por defecto tiene acceso a todas las funciones del sistema. 

Al haber iniciado sesión correctamente, se nos muestra el código 201 y un JSON que contiene nuestros datos de usuario, y al final, un token, el cual es una cadena de string con caracteres aleatorios. Este token es de suma importancia para acceder a funciones del sistema, por lo que deberemos seleccionarlo y copiarlo (sin las comillas) y luego dirigirnos al botón verde que está en la parte inicial de la interfaz (arriba y a la derecha) que dice "Authorize". Este botón nos abre una ventana, con una barra de input donde debemos pegar nuestro token y clickear en el botón "Authorize" de esa misma ventana.

Si se insertó un token válido, entonces ahora tendremos acceso a las funciones de nuestro sistema, dependiendo de nuestro rol (el rol de ADMIN tiene acceso a todas las funciones). De lo contrario, el sistema seguirá retornando error 401 (alerta de token inválido) y no nos permitirá acceder a ninguna función.

Al insertar el token, la ventana se actualizará con los botones "logout" para cerrar sesión y "close" para cerrar dicha ventana y volver al sistema. Con ello, ya tendremos acceso a diversas funciones, entre ellas, destacando que ahora podremos crear nuestro propio usuario, mediante el método POST /api/v1/usuarios.

//Se crea una clase para representar cada evento de la agenda (objeto).
class Evento {
    constructor(titulo, fecha, hora, tipo) {
        //Se genera un id unico combinando la fecha actual y un trozo aleatorio,
        this.id = Date.now() + "-" + Math.floor(Math.random() * 10000); //Fecha con un número random entre 0 y 9999, para que no haya solapamientos o confusiones.
        this.titulo = titulo;
        this.fecha = fecha;   
        this.hora = hora;     
        this.tipo = tipo;     
    }
        //Método para obtener fecha en español
        obtenerFechaFormateada() {
            const opciones = { year: "numeric", month: "long", day: "numeric" };
            const fechaObj = new Date(this.fecha + "T00:00:00");
            return fechaObj.toLocaleDateString("es-ES", opciones);
        }
        //Método para saber si es festivo ya que todo está en el mismo array.
        // Se comprueba si es festivo para saber si se puede borar o no
        esFestivo() {
            return this.tipo === "festivo";
        }
}
//Variables y constantes
// Aqui se guardam todos los eventos ya sean festivos o personales
let eventos = [];

// Elementos del DOM
const listaEventos = document.getElementById("event-list");
const modal = document.getElementById("modal-overlay");
const formulario = document.getElementById("event-form");
const btnAbrir = document.getElementById("btn-open-modal");
const btnCerrar = document.getElementById("btn-close-modal");
const btnCancelar = document.getElementById("btn-cancel");
const estadoApi = document.getElementById("api-status");

// Campos del formulario
const inputTitulo = document.getElementById("title");
const inputFecha = document.getElementById("date");
const inputHora = document.getElementById("time");

// Spans donde se muestran los mensajes de informaciónn
const errorTitulo = document.getElementById("error-title");
const errorFecha = document.getElementById("error-date");
const errorHora = document.getElementById("error-time");

// Se espera a que el DOM esté completamente cargado antes de hacer nada, primero se cargan los eventos guardados en localStorage, luego los festivos
document.addEventListener("DOMContentLoaded", function () {
    cargarEventosLocalStorage();
    cargarFestivos();
    configurarModal();
    configurarFormulario();
});
//Función cargarFestivos
// Peticion GET a la API publica para los festivos, si la API falla, se le manda al usuario un mensaje informativo.
function cargarFestivos() {
    const url = "https://date.nager.at/api/v3/PublicHolidays/2025/ES";

    fetch(url)
        .then(function (respuesta) {
            if (!respuesta.ok) {
                throw new Error("La API respondio con estado " + respuesta.status);
            }
            return respuesta.json();
        })
        .then(function (festivos) {
            for (let i = 0; i < festivos.length; i++) {
                const festivo = festivos[i];
                const evento = new Evento(
                    festivo.localName,  
                    festivo.date,       
                    "",                 
                    "festivo"
                );
                eventos.push(evento);
            }

            // Mensaje informativo para el usuario
            estadoApi.textContent = "API conectada";

            mostrarEventos();
        })
        .catch(function (error) {
            //Mensaje de error de la API para el usuaerio.
            console.error("No se pudieron cargar los festivos:", error);
            estadoApi.textContent = "Error al conectar con la API";
            mostrarEventos();
        });
}
//Función mostrarEventos
// Primero se borra todo el contenido, 
function mostrarEventos() {
    listaEventos.innerHTML = "";

    // Si no hay ningun evento, se muestra un mensaje diciendo que no hay eventos
    if (eventos.length === 0) {
        listaEventos.innerHTML = '<p class="empty-msg">No hay eventos programados.</p>';
        return;
    }

    // Ordenar eventos por fecha, sino por hora
    const ordenados = eventos.slice().sort(function (a, b) {
        if (a.fecha === b.fecha) {
            return a.hora.localeCompare(b.hora);
        }
        return a.fecha.localeCompare(b.fecha);
    });

    for (let i = 0; i < ordenados.length; i++) {
        const ev = ordenados[i];
        const tarjeta = crearTarjetaEvento(ev);
        listaEventos.appendChild(tarjeta);
    }
}

//Función crearTarjetaEvento
function crearTarjetaEvento(evento) {
    const tarjeta = document.createElement("div");

    // Segun el tipo que sea cargará el estilo de uno u otro
    if (evento.esFestivo()) {
        tarjeta.className = "event-card holiday";
    } else {
        tarjeta.className = "event-card user-event";
    }

    const badgeClase = evento.esFestivo() ? "badge-holiday" : "badge-user";
    const badgeTexto = evento.esFestivo() ? "Festivo" : "Personal";

    // Si tiene hora se muestra antes de la fecha, si no festivos se omite
    const textoHora = evento.hora ? evento.hora + " · " : "";

    let html = "";
    html += '<div class="event-info">';
    html += '<div class="event-title">' + evento.titulo;
    html += '<span class="badge ' + badgeClase + '">' + badgeTexto + '</span>';
    html += '</div>';
    html += '<div class="event-date">' + textoHora + evento.obtenerFechaFormateada() + '</div>';
    html += '</div>';

    if (!evento.esFestivo()) {
        html += '<button class="btn-delete" title="Eliminar evento">🗑</button>';
    }

    tarjeta.innerHTML = html;

    if (!evento.esFestivo()) {
        const botonBorrar = tarjeta.querySelector(".btn-delete");
        botonBorrar.addEventListener("click", function () {
            eliminarEvento(evento.id);
        });
    }

    return tarjeta;
}

// Función crearEvento, para crear un evento personal nuevo con los datos del formulario, lo mete en el array, lo guarda en localStorage y vuelve a mostrar la lista
function crearEvento(titulo, fecha, hora) {
    const nuevo = new Evento(titulo, fecha, hora, "personal");
    eventos.push(nuevo);
    guardarEventosLocalStorage();
    mostrarEventos();
}

//Función eliminarEvento, para eliminar un evento buscandolo por su id.
function eliminarEvento(id) {
    eventos = eventos.filter(function (ev) {  //Filter para coger los que no lo cumplen
        return ev.id !== id;
    });
    guardarEventosLocalStorage();
    mostrarEventos();
}

//Función guardarEventosLocalStorage,para guardar en localStorage solo los eventos personales, ya que los festivos se cargan desde la API.
function guardarEventosLocalStorage() {
    // Filtro para quedarme solo con los personales
    const personales = eventos.filter(function (ev) {
        return ev.tipo === "personal";
    });

    const datos = [];
    for (let i = 0; i < personales.length; i++) {
        datos.push({
            id: personales[i].id,
            titulo: personales[i].titulo,
            fecha: personales[i].fecha,
            hora: personales[i].hora,
            tipo: personales[i].tipo
        });
    }

    localStorage.setItem("mis_eventos", JSON.stringify(datos));
}

// Función cargarEventosLocalStorage, para recuperar los eventos del localStorage cuando se carga la pagina.
function cargarEventosLocalStorage() {
    const guardados = localStorage.getItem("mis_eventos");

    if (guardados) {
        const datos = JSON.parse(guardados);

        for (let i = 0; i < datos.length; i++) {
            // Creo un Evento nuevo con los datos guardados
            const evento = new Evento(datos[i].titulo, datos[i].fecha, datos[i].hora, datos[i].tipo);
            // Se mantiene en id original
            evento.id = datos[i].id;
            eventos.push(evento);
        }
    }
}

// Función configurarModal para abrir y cerrar el modal
function configurarModal() {
    btnAbrir.addEventListener("click", function () {
        modal.classList.remove("hidden");
    });

    // La X de arriba a la derecha cierra el modal
    btnCerrar.addEventListener("click", cerrarModal);

    // El boton "Cancelar" tambien cierra
    btnCancelar.addEventListener("click", cerrarModal);

    // Si hacen click en el fondo oscuro (overlay) tambien se cierra, pero solo si el click es directamente en el overlay, no en el modal
    modal.addEventListener("click", function (e) {
        if (e.target === modal) {
            cerrarModal();
        }
    });
}

// Se cierra el modal, se limpia el formulario y se quitan los errores
function cerrarModal() {
    modal.classList.add("hidden");
    formulario.reset();
    limpiarErrores();
}

// Función configurarFormulario para validaciones
function configurarFormulario() {
    formulario.addEventListener("submit", function (e) {
        e.preventDefault();

        limpiarErrores();

        let hayErrores = false;

        // Comprobador para que el titulo no este vacio.
        const titulo = inputTitulo.value.trim();
        if (titulo === "") {
            errorTitulo.textContent = "El título no puede estar vacío.";
            hayErrores = true;
        }

        // La fecha Tiene que estar rellena y no puede ser anterior a hoy
        const fecha = inputFecha.value;
        if (fecha === "") {
            errorFecha.textContent = "Tienes que seleccionar una fecha.";
            hayErrores = true;
        } else {
            // Comparar las fechas
            const hoy = new Date();
            hoy.setHours(0, 0, 0, 0);
            const fechaElegida = new Date(fecha + "T00:00:00");

            if (fechaElegida < hoy) {
                errorFecha.textContent = "La fecha no puede ser anterior a hoy.";
                hayErrores = true;
            }
        }

        const hora = inputHora.value;
        if (hora === "") {
            errorHora.textContent = "Tienes que indicar una hora.";
            hayErrores = true;
        } else {
            // Regex para comprobar formato HH:MM
            const regexHora = /^([01]\d|2[0-3]):([0-5]\d)$/;
            if (!regexHora.test(hora)) {
                errorHora.textContent = "Formato de hora no válido (HH:MM).";
                hayErrores = true;
            }
        }

        // Si todo esta correcto, creo el evento y se cierra el modal
        if (!hayErrores) {
            crearEvento(titulo, fecha, hora);
            cerrarModal();
        }
    });
}
//Función limpiarErrores, esta función limpia todos los mensajes de error
function limpiarErrores() {
    errorTitulo.textContent = "";
    errorFecha.textContent = "";
    errorHora.textContent = "";
}

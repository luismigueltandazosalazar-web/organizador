/* ================== PESTAÑAS ================== */
function mostrarTab(id) {
    document.querySelectorAll(".tab").forEach(t => t.classList.add("oculto"));
    document.getElementById(id).classList.remove("oculto");

    if (id === 'dashboard') {
        actualizarDashboard();
    }
}

/* ================== SUEÑO ================== */
let horaDespertarGlobal = null;

// Cargar configuración de sueño guardada
const sueñoGuardado = JSON.parse(localStorage.getItem("sueño") || "{}");
document.getElementById("horaDormir").value = sueñoGuardado.horaDormir || "";
document.getElementById("horasSueno").value = sueñoGuardado.horasSueno || "";

function calcularDespertar() {
    const horaDormir = document.getElementById("horaDormir").value;
    const horas = parseInt(document.getElementById("horasSueno").value);
    if (!horaDormir) return;

    // Guardar configuración
    localStorage.setItem("sueño", JSON.stringify({ horaDormir, horasSueno: horas }));

    const ahora = new Date();
    const [h, m] = horaDormir.split(":").map(Number);

    let dormir = new Date(
        ahora.getFullYear(),
        ahora.getMonth(),
        ahora.getDate(),
        h, m
    );

    if (dormir <= ahora) dormir.setDate(dormir.getDate() + 1);

    horaDespertarGlobal = new Date(dormir.getTime() + horas * 3600000);

    document.getElementById("resultadoSueño").textContent =
        `Despiertas a las ${horaDespertarGlobal.toLocaleTimeString([], {
            hour: "2-digit", minute: "2-digit"
        })}`;

    generarRutina();
    programarNotificacionesAgua();
    programarNotificacionesRutina();
}

/* ================== AGUA ================== */
let vasos = parseInt(localStorage.getItem("vasos") || "0");

function actualizarAguaVisual() {
    const vasosElement = document.getElementById("agua-vasos");
    vasosElement.innerHTML = "";
    for (let i = 0; i < 12; i++) {
        const vaso = document.createElement("span");
        vaso.className = "vaso";
        vaso.textContent = "🥤";
        if (i < vasos) vaso.classList.add("lleno");
        vasosElement.appendChild(vaso);
    }
}

function agregarAgua() {
    if (vasos < 12) {
        vasos++;
        document.getElementById("vasos").textContent = vasos;
        localStorage.setItem("vasos", vasos.toString());
        actualizarAguaVisual();
    }
}

// Función para obtener la semana actual (lunes a domingo)
function obtenerSemanaActual() {
    const hoy = new Date();
    const diaSemana = hoy.getDay(); // 0 = Domingo, 1 = Lunes, etc.
    const lunes = new Date(hoy);
    lunes.setDate(hoy.getDate() - (diaSemana === 0 ? 6 : diaSemana - 1)); // Ajustar a lunes
    lunes.setHours(0, 0, 0, 0);
    return lunes.toISOString().split('T')[0]; // Formato YYYY-MM-DD
}

// Función para resetear vasos diariamente
function resetearVasosDiariamente() {
    const hoy = new Date().toDateString();
    const ultimoDia = localStorage.getItem("ultimoDiaAgua");

    if (ultimoDia !== hoy) {
        // Guardar datos del día anterior
        const vasosAnteriores = parseInt(localStorage.getItem("vasos") || "0");
        if (vasosAnteriores > 0) {
            const datosDiarios = JSON.parse(localStorage.getItem("datosDiarios") || "{}");
            datosDiarios[ultimoDia || hoy] = {
                fecha: new Date().toISOString(),
                vasos: vasosAnteriores
            };
            localStorage.setItem("datosDiarios", JSON.stringify(datosDiarios));
        }

        // Resetear vasos
        vasos = 0;
        localStorage.setItem("vasos", "0");
        localStorage.setItem("ultimoDiaAgua", hoy);
        document.getElementById("vasos").textContent = vasos;
        actualizarAguaVisual();
    }
}

// Cargar configuración de balance guardada
const balanceGuardado = JSON.parse(localStorage.getItem("balance") || "{}");
document.getElementById("encuentro").value = balanceGuardado.encuentro || "";
document.getElementById("estres").value = balanceGuardado.estres || "";

/* ================== BALANCE PERSONAL (PLAN ÍNTIMO) ================== */
function generarPlanBalance() {
    // Verificar si hay configuración guardada y si el encuentro ya pasó
    const balanceGuardado = JSON.parse(localStorage.getItem("balance") || "{}");
    if (balanceGuardado.encuentro) {
        const encuentro = new Date(balanceGuardado.encuentro);
        const ahora = new Date();

        // Si el encuentro ya pasó, resetear configuración
        if (encuentro <= ahora) {
            localStorage.removeItem("balance");
            document.getElementById("encuentro").value = "";
            document.getElementById("estres").value = "";
            const lista = document.getElementById("planBalance");
            lista.innerHTML = "<li>¡Encuentro completado! Configura un nuevo encuentro.</li>";
            return;
        }
    }

    const encuentroInput = document.getElementById("encuentro").value;
    const estres = document.getElementById("estres").value;
    const lista = document.getElementById("planBalance");
    lista.innerHTML = "";

    if (!encuentroInput) {
        lista.innerHTML = "<li>Selecciona la fecha del encuentro</li>";
        return;
    }

    // Guardar configuración
    localStorage.setItem("balance", JSON.stringify({ encuentro: encuentroInput, estres }));

    const hoy = new Date();
    const encuentro = new Date(encuentroInput);
    const dias = Math.ceil((encuentro - hoy) / 86400000);

    if (dias <= 0) {
        lista.innerHTML = "<li>El encuentro ya pasó</li>";
        return;
    }

    for (let i = 0; i < dias; i++) {
        const d = new Date();
        d.setDate(d.getDate() + i);

        const nombreDia = d.toLocaleDateString("es-ES", { weekday: "long" });
        let texto = "";

        if (estres === "alto") {
            texto = (i % 3 === 0)
                ? "🟢 Masturbación consciente: sin porno, respiración lenta, terminar relajado."
                : "🔴 No masturbarse: retención, respiración profunda, descanso mental.";
        }

        if (estres === "medio") {
            texto = (i % 4 === 0)
                ? "🟡 Descarga ligera: rápida, sin estímulos fuertes."
                : "🔵 Control: enfocar energía en estudio o calma.";
        }

        if (estres === "bajo") {
            texto = (i % 5 === 0)
                ? "🟢 Opcional: solo si el cuerpo lo pide, tranquilo."
                : "🧘 Mantener energía: sueño y alimentación.";
        }

        const li = document.createElement("li");
        li.textContent = `${nombreDia}: ${texto}`;
        lista.appendChild(li);
    }
}

/* ================== CLASES ================== */
let clases = JSON.parse(localStorage.getItem("clases") || "[]");

function guardarClase() {
    if (!materiaClase.value || !horaInicioClase.value || !horaFinClase.value) return;

    clases.push({
        materia: materiaClase.value.trim(),
        dia: parseInt(diaClase.value),
        inicio: horaInicioClase.value,
        fin: horaFinClase.value
    });

    localStorage.setItem("clases", JSON.stringify(clases));
    listarClases();
    mostrarHorarioSemanal();
    generarRutina();
}

function eliminarClase(index) {
    clases.splice(index, 1);
    localStorage.setItem("clases", JSON.stringify(clases));
    listarClases();
    mostrarHorarioSemanal();
    generarRutina();
}

function listarClases() {
    listaClases.innerHTML = "";

    if (clases.length === 0) {
        listaClases.innerHTML = "<li>No hay clases guardadas</li>";
        return;
    }

    clases.forEach((c, i) => {
        const li = document.createElement("li");
        li.innerHTML = `
            <strong>${c.materia}</strong>
            (${diaTexto(c.dia)} ${c.inicio} - ${c.fin})
            <button onclick="eliminarClase(${i})">❌</button>
        `;
        listaClases.appendChild(li);
    });
}

function mostrarHorarioSemanal() {
    const contenedor = document.getElementById("horarioSemanal");
    contenedor.innerHTML = "";

    const dias = ["Domingo","Lunes","Martes","Miércoles","Jueves","Viernes","Sábado"];

    dias.forEach((nombre, dia) => {
        const delDia = clases.filter(c => c.dia === dia);
        if (delDia.length === 0) return;

        const h = document.createElement("li");
        h.innerHTML = `<strong>${nombre}</strong>`;
        contenedor.appendChild(h);

        delDia.forEach(c => {
            const li = document.createElement("li");
            li.textContent = `• ${c.materia} | ${c.inicio} - ${c.fin}`;
            contenedor.appendChild(li);
        });
    });

    if (contenedor.innerHTML === "") {
        contenedor.innerHTML = "<li>No hay horario académico aún</li>";
    }
}

function diaTexto(d) {
    return ["Dom","Lun","Mar","Mié","Jue","Vie","Sáb"][d];
}

/* ================== RUTINA COMPLETA (TERAPÉUTICA) ================== */
function generarRutina() {
    const lista = document.getElementById("listaRutina");
    lista.innerHTML = "";
    if (!horaDespertarGlobal) return;

    let t = new Date(horaDespertarGlobal);
    const hoy = new Date().getDate();

    function agregar(texto, min) {
        const ini = t.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
        t = new Date(t.getTime() + min * 60000);
        const fin = t.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
        const li = document.createElement("li");
        li.textContent = `${ini} – ${fin} | ${texto}`;
        lista.appendChild(li);
    }

    agregar("Despertar + agua", 10);
    agregar("Aseo íntimo", 15);
    agregar("Cambio de ropa interior", 5);

    if (hoy % 2 === 0) {
        agregar("Ducha completa", 20);
    }

    agregar("Desayuno", 30);
    agregar("Snack mañana", 15);

    const hoyDia = new Date().getDay();
    const hoyClases = clases.filter(c => c.dia === hoyDia);

    if (hoyClases.length > 0) {
        hoyClases.forEach(c => agregar(`Clase: ${c.materia}`, 90));
    } else {
        agregar("Estudio personal", 120);
    }

    agregar("Almuerzo", 60);
    agregar("Descanso / respiración", 30);
    agregar("Tareas / estudio", 120);
    agregar("Merienda", 20);
    agregar("Tiempo personal", 60);
    agregar("Cena", 40);
    agregar("Lavado nocturno íntimo", 10);
    agregar("Prepararse para dormir", 30);
}

/* ================== TEMA ================== */
function toggleTema() {
    document.body.classList.toggle("dark");
}

/* ================== DASHBOARD ================== */
function actualizarDashboard() {
    // Actualizar agua en dashboard
    document.getElementById("vasos-dashboard").textContent = vasos;
    actualizarAguaVisualDashboard();

    // Actualizar sueño en dashboard
    const sueñoGuardado = JSON.parse(localStorage.getItem("sueño") || "{}");
    const dashboardSueño = document.getElementById("dashboard-sueño");
    if (sueñoGuardado.horaDormir && sueñoGuardado.horasSueno) {
        dashboardSueño.textContent = `Duermes ${sueñoGuardado.horasSueno}h desde ${sueñoGuardado.horaDormir}`;
    } else {
        dashboardSueño.textContent = "Configura tu horario de sueño";
    }

    // Actualizar clases de hoy
    const hoyDia = new Date().getDay();
    const hoyClases = clases.filter(c => c.dia === hoyDia);
    const dashboardClasesHoy = document.getElementById("dashboard-clases-hoy");
    dashboardClasesHoy.innerHTML = "";

    if (hoyClases.length > 0) {
        hoyClases.forEach(c => {
            const li = document.createElement("li");
            li.textContent = `${c.materia} (${c.inicio} - ${c.fin})`;
            dashboardClasesHoy.appendChild(li);
        });
    } else {
        const li = document.createElement("li");
        li.textContent = "No hay clases hoy";
        dashboardClasesHoy.appendChild(li);
    }

    // Actividad actual según la hora
    const dashboardProxima = document.getElementById("dashboard-proxima");
    const actividadActual = obtenerActividadActual();
    dashboardProxima.textContent = actividadActual;

    // Estadísticas diarias
    const datosDiarios = JSON.parse(localStorage.getItem("datosDiarios") || "{}");
    const dias = Object.keys(datosDiarios);
    let totalVasos = 0;
    dias.forEach(d => totalVasos += datosDiarios[d].vasos);
    const promedioVasos = dias.length > 0 ? Math.round(totalVasos / dias.length) : 0;

    document.getElementById("stat-agua").textContent = promedioVasos;
    document.getElementById("stat-clases").textContent = clases.length;
    document.getElementById("stat-balance").textContent = dias.length; // Usando días como proxy de días de balance
}

// Función para obtener la actividad actual según la hora del día
function obtenerActividadActual() {
    if (!horaDespertarGlobal) return "Sin actividades programadas";

    const ahora = new Date();
    const horaActual = ahora.getHours() * 60 + ahora.getMinutes(); // Minutos desde medianoche

    // Definir actividades con sus rangos de tiempo aproximados
    const actividades = [
        { nombre: "Despertar + agua", inicio: 0, fin: 10 },
        { nombre: "Aseo íntimo", inicio: 10, fin: 25 },
        { nombre: "Cambio de ropa interior", inicio: 25, fin: 30 },
        { nombre: "Ducha completa", inicio: 30, fin: 50 },
        { nombre: "Desayuno", inicio: 50, fin: 80 },
        { nombre: "Snack mañana", inicio: 80, fin: 95 },
        { nombre: "Clase/Estudio personal", inicio: 95, fin: 215 },
        { nombre: "Almuerzo", inicio: 215, fin: 275 },
        { nombre: "Descanso / respiración", inicio: 275, fin: 305 },
        { nombre: "Tareas / estudio", inicio: 305, fin: 425 },
        { nombre: "Merienda", inicio: 425, fin: 445 },
        { nombre: "Tiempo personal", inicio: 445, fin: 505 },
        { nombre: "Cena", inicio: 505, fin: 545 },
        { nombre: "Lavado nocturno íntimo", inicio: 545, fin: 555 },
        { nombre: "Prepararse para dormir", inicio: 555, fin: 585 }
    ];

    // Calcular minutos desde el despertar
    const minutosDesdeDespertar = Math.floor((ahora - horaDespertarGlobal) / 60000);

    for (const actividad of actividades) {
        if (minutosDesdeDespertar >= actividad.inicio && minutosDesdeDespertar < actividad.fin) {
            return `Actividad actual: ${actividad.nombre}`;
        }
    }

    // Si no está en ninguna actividad específica, mostrar la próxima
    if (horaDespertarGlobal > ahora) {
        return `Próxima actividad: ${horaDespertarGlobal.toLocaleTimeString([], {
            hour: "2-digit", minute: "2-digit"
        })} - Despertar`;
    }

    return "Día completado - ¡Buen trabajo!";
}

function actualizarAguaVisualDashboard() {
    const vasosElement = document.getElementById("agua-vasos-dashboard");
    vasosElement.innerHTML = "";
    for (let i = 0; i < 12; i++) {
        const vaso = document.createElement("span");
        vaso.className = "vaso";
        vaso.textContent = "🥤";
        if (i < vasos) vaso.classList.add("lleno");
        vasosElement.appendChild(vaso);
    }
}

/* ================== NOTIFICACIONES ================== */
let notificacionesAgua = [];
let notificacionesRutina = [];

// Solicitar permiso para notificaciones
async function solicitarPermisoNotificaciones() {
    if ('Notification' in window) {
        const permiso = await Notification.requestPermission();
        console.log('Permiso de notificaciones:', permiso);
        return permiso === 'granted';
    }
    return false;
}

// Registrar service worker
async function registrarServiceWorker() {
    if ('serviceWorker' in navigator) {
        try {
            const registro = await navigator.serviceWorker.register('sw.js');
            console.log('Service Worker registrado:', registro);
            return registro;
        } catch (error) {
            console.error('Error registrando Service Worker:', error);
        }
    }
    return null;
}

// Programar notificaciones de agua
function programarNotificacionesAgua() {
    if (!horaDespertarGlobal) return;

    // Limpiar notificaciones anteriores
    notificacionesAgua.forEach(id => clearTimeout(id));
    notificacionesAgua = [];

    const ahora = new Date();
    let tiempoNotificacion = new Date(horaDespertarGlobal);

    // Programar 6 notificaciones cada 2 horas
    for (let i = 0; i < 6; i++) {
        tiempoNotificacion = new Date(tiempoNotificacion.getTime() + 2 * 60 * 60 * 1000); // +2 horas

        if (tiempoNotificacion > ahora) {
            const delay = tiempoNotificacion.getTime() - ahora.getTime();
            const id = setTimeout(() => {
                enviarNotificacion({
                    title: "💧 ¡Hora de hidratarte!",
                    body: `Vasos consumidos: ${vasos}/12. ¡Mantén tu hidratación!`,
                    tag: "agua"
                });
            }, delay);
            notificacionesAgua.push(id);
        }
    }
}

// Programar notificaciones de rutina
function programarNotificacionesRutina() {
    if (!horaDespertarGlobal) return;

    // Limpiar notificaciones anteriores
    notificacionesRutina.forEach(id => clearTimeout(id));
    notificacionesRutina = [];

    const ahora = new Date();
    let tiempoRutina = new Date(horaDespertarGlobal);

    // Notificación de despertar
    if (horaDespertarGlobal > ahora) {
        const delayDespertar = horaDespertarGlobal.getTime() - ahora.getTime();
        const idDespertar = setTimeout(() => {
            enviarNotificacion({
                title: "🌅 ¡Buenos días!",
                body: "¡Es hora de despertar! Comienza tu rutina diaria.",
                tag: "despertar"
            });
        }, delayDespertar);
        notificacionesRutina.push(idDespertar);
    }

    // Notificaciones para cambios de rutina (cada hora)
    const actividades = [
        { texto: "¡Es hora de tu ducha matutina!", delay: 30 * 60 * 1000 }, // 30 min después de despertar
        { texto: "¡Momento de desayunar!", delay: 60 * 60 * 1000 }, // 1 hora después
        { texto: "¡Tiempo de almorzar!", delay: 4 * 60 * 60 * 1000 }, // 4 horas después
        { texto: "¡Hora de merendar!", delay: 6 * 60 * 60 * 1000 }, // 6 horas después
        { texto: "¡Cena lista!", delay: 8 * 60 * 60 * 1000 }, // 8 horas después
        { texto: "¡Prepárate para dormir!", delay: 12 * 60 * 60 * 1000 } // 12 horas después
    ];

    actividades.forEach(actividad => {
        const tiempoNotif = new Date(tiempoRutina.getTime() + actividad.delay);
        if (tiempoNotif > ahora) {
            const delay = tiempoNotif.getTime() - ahora.getTime();
            const id = setTimeout(() => {
                enviarNotificacion({
                    title: "📋 Recordatorio de Rutina",
                    body: actividad.texto,
                    tag: "rutina"
                });
            }, delay);
            notificacionesRutina.push(id);
        }
    });

    // Notificaciones adicionales cada hora para rutina completa
    for (let i = 1; i <= 12; i++) {
        const tiempoNotif = new Date(tiempoRutina.getTime() + i * 60 * 60 * 1000); // Cada hora
        if (tiempoNotif > ahora) {
            const delay = tiempoNotif.getTime() - ahora.getTime();
            const id = setTimeout(() => {
                enviarNotificacion({
                    title: "📋 Recordatorio de Rutina",
                    body: `¡Es hora de continuar con tu rutina diaria!`,
                    tag: "rutina"
                });
            }, delay);
            notificacionesRutina.push(id);
        }
    }
}

// Enviar notificación
async function enviarNotificacion(datos) {
    if ('serviceWorker' in navigator && 'Notification' in window) {
        const registro = await navigator.serviceWorker.ready;
        registro.showNotification(datos.title, {
            body: datos.body,
            icon: "icon-192.png",
            badge: "icon-192.png",
            tag: datos.tag,
            requireInteraction: true
        });
    } else if ('Notification' in window && Notification.permission === 'granted') {
        new Notification(datos.title, {
            body: datos.body,
            icon: "icon-192.png",
            tag: datos.tag
        });
    }
}

/* ================== HISTORIAL DIARIO ================== */
function mostrarHistorialDiario() {
    const datosDiarios = JSON.parse(localStorage.getItem("datosDiarios") || "{}");
    const lista = document.getElementById("historialSemanal");
    lista.innerHTML = "";

    const dias = Object.keys(datosDiarios).sort().reverse(); // Más recientes primero

    if (dias.length === 0) {
        lista.innerHTML = "<li>No hay datos diarios guardados</li>";
        return;
    }

    dias.forEach(dia => {
        const datos = datosDiarios[dia];
        const fecha = new Date(datos.fecha);
        const diaTexto = `${fecha.toLocaleDateString("es-ES", {
            weekday: "long", day: "numeric", month: "long"
        })}`;
        const li = document.createElement("li");
        li.innerHTML = `<strong>${diaTexto}</strong>: ${datos.vasos} vasos de agua`;
        lista.appendChild(li);
    });
}

// Función para verificar si es un nuevo día y regenerar rutina
function verificarNuevoDia() {
    const hoy = new Date().toDateString();
    const ultimoDia = localStorage.getItem("ultimoDiaRutina");

    if (ultimoDia !== hoy) {
        // Cargar configuración de sueño guardada y regenerar rutina
        const sueñoGuardado = JSON.parse(localStorage.getItem("sueño") || "{}");
        if (sueñoGuardado.horaDormir && sueñoGuardado.horasSueno) {
            const horas = parseInt(sueñoGuardado.horasSueno);
            const [h, m] = sueñoGuardado.horaDormir.split(":").map(Number);

            const ahora = new Date();
            let dormir = new Date(
                ahora.getFullYear(),
                ahora.getMonth(),
                ahora.getDate(),
                h, m
            );

            if (dormir <= ahora) dormir.setDate(dormir.getDate() + 1);

            horaDespertarGlobal = new Date(dormir.getTime() + horas * 3600000);

            generarRutina();
            programarNotificacionesAgua();
            programarNotificacionesRutina();
        }

        localStorage.setItem("ultimoDiaRutina", hoy);
    }
}

/* ================== INIT ================== */
document.addEventListener("DOMContentLoaded", async () => {
    resetearVasosDiariamente();
    listarClases();
    mostrarHorarioSemanal();
    actualizarAguaVisual();
    mostrarHistorialDiario();
    verificarNuevoDia();

    // Inicializar notificaciones
    await solicitarPermisoNotificaciones();
    await registrarServiceWorker();

    // Programar notificaciones si hay configuración de sueño
    if (horaDespertarGlobal) {
        programarNotificacionesAgua();
        programarNotificacionesRutina();
    }
});


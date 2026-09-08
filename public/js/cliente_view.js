document.addEventListener("DOMContentLoaded", () => {
    
    const usuarioLogueado = localStorage.getItem("usuario");
    if (usuarioLogueado) {
        const txtWelcomeCliente = document.getElementById("nombreusuarioCliente") || document.getElementById("nombreUsuarioCliente");
        if (txtWelcomeCliente) {
            txtWelcomeCliente.textContent = usuarioLogueado;
        }
    }
    cargarDatosDashboard();
    configurarBotones();
});

async function cargarDatosDashboard() {
    try {
        await Promise.all([
            obtenerPerfilUsuario(),
            cargarVehiculosUsuario(),
            cargarReservaActiva()
        ]);
    } catch (error) {
        console.error("Error al inicializar los datos del dashboard:", error);
    }
}

async function obtenerPerfilUsuario() {
    const txtDisplay = document.getElementById("user-display-name");
    const txtWelcome = document.getElementById("nombre-usuario");

    try {
        const response = await fetch("/api/auth/session");
        if (!response.ok) throw new Error("No se pudo obtener la sesion activa");
        const data = await response.json();

        if (data && data.nombre_completo) {
            if (txtDisplay) txtDisplay.textContent = data.nombre_completo;
            if (txtWelcome) txtWelcome.textContent = data.nombre_completo.split(" ")[0]; 
        }
    } catch (error) {
        console.error("Error al obtener perfil:", error);
        if (txtDisplay) txtDisplay.textContent = "Invitado";
    }
}

async function cargarVehiculosUsuario() {
    const selectVehiculo = document.getElementById("select-vehiculo");
    if (!selectVehiculo) return;

    try {
        const response = await fetch("/api/vehiculos"); 
        if (!response.ok) throw new Error("No se pudieron cargar los vehículos");
        const vehiculos = await response.json();
        
        selectVehiculo.innerHTML = '<option value="">Seleccione un vehículo</option>';
        if (vehiculos.length === 0) {
            selectVehiculo.innerHTML += '<option value="" disabled>No tienes vehiculos registrados</option>';
            return;
        }
        vehiculos.forEach(v => {
            const option = document.createElement("option");
            option.value = v.id_vehiculo || v.id;
            option.textContent = `${v.marca} ${v.modelo} (${v.matricula || v.patente})`;
            selectVehiculo.appendChild(option);
        });
    } catch (error) {
        console.error("Error al cargar vehículos:", error);
        selectVehiculo.innerHTML = '<option value="">Error al cargar vehículos</option>';
    }
}

async function cargarReservaActiva() {
    const container = document.getElementById("reserva-activa-container");
    if(!container) return;

    try {
        const response = await fetch("/api/reservas/activa");
        if (!response.ok) {
            container.innerHTML = `<p style="color:var(--text-muted);">No tienes ninguna reserva activa en este momento.</p>`;
            return;
        }
        throw new Error("Error al obtener reserva activa");
    }
    const reserva = await response.json();

    container.innerHTML = `
        <p><stong>${reserva.nombre_parking}</strong></p>
        <p style = "font-size: 0.95rem; margin-top: 5px;">
            Piso: ${reserva.nro_piso} | Lugar: ${reserva.codigo_lugar}
        </p>
        <p style ="font-size: 0.9rem; color: var(--text-muted); margin-top: 2px;">
            Horario: ${reserva.hora_inicio} - ${reserva.hora_fin}
        </p>
        <span class="badge badge-success" style="margin-tp: 10px; display: inline-block;">Activa / Confirmada</span>            
    `;
}   catch (error) {}

function configurarBotones() {

    const btnReservar = document.querySelector(".btn-buscar");
    if (btnReservar) {
        btnReservar.addEventListener("click", (e) => {
            e.preventDefault();
            window.location.href = "/cliente/buscar-parking";
        });
    }
    const btnAgregarVehiculo = document.querySelector(".btn-ver");
    if (btnAgregarVehiculo) {
        btnAgregarVehiculo.addEventListener("click", () => {
            window.location.href = "/cliente/mis-vehiculos";
        });
    }
    const enlacesSidebar = document.querySelectorAll(".sidebar-menu a:not(.logout-btn)");
    enlacesSidebar.forEach(enlace => {

    });
}

document.addEventListener("click", (e) => {
    
    if (e.target.classList.contains("btn-reservar") || e.target.closest(".btn-reservar")) {
        const btn = e.target.closest(".btn-reservar");
        const parking = btn.getAttribute("data-parking");
        const piso = btn.getAttribute("data-piso");

        Swal.fire({
            title: 'Confirmar Reserva?',
            text: `Deseas solicitar un lugar en "${parking}" (${piso})?`,
            icon: 'question',
            showCancelButton: true,
            confirmButtonColor: '#211A60',
            cancelButtonColor: '#6c757d',
            confirmButtonText: 'Sí, reservar',
            cancelButtonText: 'Cancelar',
            reverseButtons: true
        }).then((result) => {
            if (result.isConfirmed) {
                Swal.fire({
                    title: '¡Reservado!',
                    text: `Flujo de reserva exitosamente abierto para ${parking} en el ${piso}.`,
                    icon: 'success',
                    confirmButtonColor: '#211A60'
                });
            }
        });
    }

    if (e.target.classList.contains("btn-cancelar") || e.target.closest(".btn-cancelar")) {
        const btn = e.target.closest(".btn-cancelar");
        const idReserva = btn.getAttribute("data-id");
        Swal.fire({
            title: 'Estás seguro?',
            text: `De verdad deseas cancelar la reserva #${idReserva}? Esta acción no se puede deshacer.`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#dc3545',
            cancelButtonColor: '#6c757d',
            confirmButtonText: 'Sí, cancelar reserva',
            cancelButtonText: 'No, mantener reserva',
            reverseButtons: true
        }).then((result) => {
            if (result.isConfirmed) {
                Swal.fire({
                    title: 'Cancelada',
                    text: `La solicitud para anular la reserva #${idReserva} ha sido enviada con éxito.`,
                    icon: 'success',
                    confirmButtonColor: '#211A60'
                });
            }
        });
    }
});
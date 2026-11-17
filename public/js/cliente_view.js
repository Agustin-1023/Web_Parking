document.addEventListener("DOMContentLoaded", () => {
    
    const usuarioLogueado = localStorage.getItem("usuario");
    if (usuarioLogueado) {
        const txtWelcomeCliente = document.getElementById("nombreusuarioCliente") || document.getElementById("nombreUsuarioCliente");
        if (txtWelcomeCliente) {
            txtWelcomeCliente.textContent = usuarioLogueado;
        }
    }
    cargarDatosDashboard();
});

async function cargarDatosDashboard() {
    try {
        await Promise.all([
            obtenerPerfilUsuario(),
            cargarEspaciosDisponibles(),
            cargarMisReservas()
        ]);
    } catch (error) {
        console.error("Error al inicializar los datos del dashboard:", error);
    }
}

async function obtenerPerfilUsuario() {
    const txtDisplay = document.getElementById("user-display-name");
    const txtWelcome = document.getElementById("nombre-usuario");
    const usuarioLocal = localStorage.getItem("usuario") || "Cliente";

    if (txtDisplay) txtDisplay.textContent = usuarioLocal;
    if (txtWelcome) txtWelcome.textContent = usuarioLocal;

}

async function cargarEspaciosDisponibles() {
    const tableBody = document.querySelector(".card-container .data-table tbody");
    if (!tableBody) return;
    try {
        const response = await fetch("/api/parkings-disponibles");
        if (!response.ok) throw new Error("Error al cargar espacios disponibles");
        const lugares = await response.json();

        tableBody.innerHTML = "";

        if(lugares.length === 0) {
            tableBody.innerHTML = `<tr><td colspan="5" style="text-align: center;">No hay lugares disponibles en este momento.</td></tr>`;
            return;
        }
        lugares.forEach(lugar => {
            const tr = document.createElement("tr");
            tr.innerHTML = `
                <td><strong>${lugar.nombre_parking}</strong></td>
                <td><span class="badge badge-success">${lugar.lugares_libres} lugares libres</span></td>
                <td>
                    <button class="btn btn-primary btn-reservar-parking"
                        data-id-parking="${lugar.id_parking}"
                        data-parking="${lugar.nombre_parking}">
                        RESERVAR
                    </button>
                </TD>
            `;
        tableBody.appendChild(tr);
    });
    } catch (error) {
    console.error("Error al obtener estacionamientos:", error);
    }
}

async function cargarMisReservas() {
    const historialBody = document.getElementById("historialReservasCliente");
    const badgeEstado = document.getElementById("userStatusBadge");
    const userName = localStorage.getItem("usuario");
    if (!historialBody) return;

    try {
        const response = await fetch(
        `/api/cliente/mis-reservas?user_name=${encodeURIComponent(userName)}`);
        if (!response.ok) throw new Error("Error al obtener reservas");
        const reservas = await response.json();
        historialBody.innerHTML = "";

        if (reservas.length === 0) {
            historialBody.innerHTML = `<tr><td colspan="5" style="text-align: center;"> No tienes reservas registradas.</td></tr>`;
            if (badgeEstado) {
                badgeEstado.textContent = "Sin reservas activas";
                badgeEstado.className = "badge badge-primary";
            }
            return;
        }

        let tieneActiva = false;

        reservas.forEach((reserva) => {
            const esActiva = 
                reserva.estado === "Activa" || reserva.estado === "Confirmada";
                if (esActiva) tieneActiva = true;

                const tr = document.createElement("tr");
                tr.innerHTML = `
                    <td>${reserva.numero_piso} - ${reserva.codigo_lugar || "Lugar"} (${reserva.tipo_lugar || "Normal"})</td>
                    <td>${reserva.fecha_ingreso || "-"}</td>
                    <td>${reserva.fecha_salida || "En curso"}</td>
                    <td><span class="badge ${esActiva ? "badge-primary" : "badge-success"}">${reserva.estado}</span></td>
                    <td>
                        ${esActiva ? `<button class="btn btn-eliminar btn-cancelar" data-id="${reserva.id_reserva}">CANCELAR</button>` : "-"}
                    </td>
                    `;
                historialBody.appendChild(tr);
        });
        if (badgeEstado) {
            if (tieneActiva) {
                badgeEstado.textContent = "Reserva Activa";
                badgeEstado.className = "badge baadge-success";
            } else {
                badgeEstado.textContent = "Sin reserva activa";
                badgeEstado.className = "badge badge-primary";
            }
        }
    } catch (error) {
        console.error("Error al cargar historial de reservas:", error);
    }

}
document.addEventListener("click", async (e) => {
    if(
        e.target.classList.contains("btn-reservar-parking") ||
        e.target.closest(".btn-reservar-parking")
    ) {
        const btn = e.target.closest(".btn-reservar-parking");
        const idParking = btn.getAttribute("data-id-parking");
        const nombreParking = btn.getAttribute("data-parking");
        const userName = localStorage.getItem("usuario");

        Swal.fire({
            title:"Confirmar Reserva?",
            text: `Desea Reservar un espacio disponible en "${nombreParking}"?`,
            icon: "question",
            showCancelButton: true,
            confirmButtonColor: "#211A60",
            cancelButtonColor: "#6c757d",
            confirmButtonText: "Si, reservar",
            cancelButtonText: "Cancelar",
            reverseButtons: true,

        }).then(async (result) => {
            if (result.isConfirmed) {
                try {
                    const res = await fetch("/api/cliente/reserva-por-parking",{
                        method: "POST",
                        headers: { "Content-Type": "application/json"},
                        body: JSON.stringify({
                            user_name: userName,
                            id_parking: idParking,
                        }),
                    });
                    const data = await res.json();
                    if(res.ok) {
                        Swal.fire({
                            title: "Reservado!",
                            text: "Tu Espaco ha sido asignado con exito y se envio un correo de confirmacion.",
                            icon: "success",
                            confirmButtonColor: "#211A60",
                        });
                        cargarEspaciosDisponibles();
                        cargarMisReservas();
                    }else {
                        Swal.fire(
                            "Error",
                            data.message || "No se pudo procesar la reserva",
                            "error",
                        );
                    }
                } catch (err) {
                    console.error("Error en peticion de reserva:", err);
                    Swal.fire("Error", "No se pudo conectar con el servidro:", "error");
                }
            }
        });
    }
    if (e.target.classList.contains("btn-cancelar") ||
        e.target.closest(".btn-cancelar")
) {
    const btn = e.target.closest(".btn-cancelar");
    const idReserva = btn.getAttribute("data-id");

    Swal.fire({
        title: "Estas seguro?",
        text: `Deseas cancelar la reserva #${idReserva}? Esta accion libera el espacio.`,
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#dc3545",
        cancelButtonColor: "#6c757d",
        confirmButtonText: "Si, cancelar reserva",
        confirmButtonText: "No, mantener Reserva",
        reverseButtons: true,
    }).then(async (result) => {
        if (result.isConfirmed) {
            try {
                const res = await fetch(
                `/api/cliente/reservas/${idReserva}/cancelar`,
                {
                    methd: "PUT",
                },
            );
                const data = await res.json();
                if (res.ok) {
                    Swal.fire({
                        title: "Cancelarda",
                        text: "La reserva ah sido cancelada Correctamente.",
                        icon: "success",
                        confirmButtonColor: "#211A60",
                    });
                    cargarEspaciosDisponibles();
                    cargarMisReservas();
                }else {
                    Swal.fire("Error", data.message || "No se pudo cancelar","Error");
                }
            } catch (err) {
                console.error("Error", data.message || "Error de conexion con el servidor", "error");
                Swal.fire("Error","No se pudo conectar con el servidor", "error");
            }
        }
    });
    }
});
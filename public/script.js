function formatearPrecio(precio) {
  const num = Number(precio);
  if (isNaN(num)) return "N/A";
  if (num >= 1_000_000) return (num / 1_000_000).toFixed(1).replace(/\.0$/, '') + 'kk';
  if (num >= 1_000) return (num / 1_000).toFixed(2).replace(/\.00$/, '') + 'k';
  return num.toString();
}

async function cargarProductos() {
  try {
    const res = await fetch("/datos");
    const posts = await res.json();
    const container = document.getElementById("productosContainer");
    if (!container) return;

    container.innerHTML = "";

    if (Array.isArray(posts) && posts.length > 0) {
      posts.reverse().forEach((post) => {
        const div = document.createElement("div");
        div.className = "producto";

        // Imagen
        if (post.imagen) {
          const img = document.createElement("img");
          img.src = post.imagen;
          img.alt = "Imagen del producto";
          img.className = "producto-imagen";
          div.appendChild(img);
        }

        // Título
        const titulo = document.createElement("h3");
        titulo.textContent = post.item || "Sin nombre";
        div.appendChild(titulo);

        // Precio
        const precio = document.createElement("p");
        precio.textContent = `Precio: $${formatearPrecio(post.precio)}`;
        div.appendChild(precio);

        // Jugador
        const jugador = document.createElement("p");
        jugador.textContent = `Jugador: ${post.nombre_juego || "Anónimo"}`;
        div.appendChild(jugador);

        // Fecha
        const fechaElem = document.createElement("p");
        let fechaTexto = "Fecha desconocida";
        if (post.fecha && !isNaN(post.fecha)) {
          const f = new Date(Number(post.fecha));
          const dia = String(f.getDate()).padStart(2, '0');
          const mes = String(f.getMonth() + 1).padStart(2, '0');
          const año = f.getFullYear();
          const h = String(f.getHours()).padStart(2, '0');
          const m = String(f.getMinutes()).padStart(2, '0');
          fechaTexto = `${dia}/${mes}/${año} a las ${h}:${m}`;
        }
        fechaElem.innerHTML = `<strong>Publicado el:</strong> ${fechaTexto}`;
        div.appendChild(fechaElem);

// WhatsApp
if (post.numero) {
  const nombre = post.nombre_juego || "jugador";
  const mensaje = encodeURIComponent(`Hola ${nombre}, vi que vendias: ${post.item} a $${formatearPrecio(post.precio)}. ¿Sigue disponible?`);
  const link = document.createElement("a");
  link.href = `https://wa.me/${post.numero}?text=${mensaje}`;
  link.target = "_blank";
  link.className = "btn-whatsapp";
  link.innerHTML = `<img src="https://upload.wikimedia.org/wikipedia/commons/6/6b/WhatsApp.svg" alt="WhatsApp" class="icono-wsp"> Contactar por WhatsApp`;
  div.appendChild(link);
}
        container.appendChild(div);
      });
    } else {
      container.innerHTML = "<p>No hay publicaciones disponibles.</p>";
    }
  } catch (error) {
    console.error("Error cargando productos:", error);
    const container = document.getElementById("productosContainer");
    if (container) container.innerHTML = "<p>Error al cargar los productos.</p>";
  }
}
// Mostrar el mensaje temporal
function mostrarMensaje(texto, tipo) {
  const msg = document.createElement("div");
  msg.textContent = texto;
  msg.className = tipo === "success" ? "mensaje-exito" : "mensaje-error";

  document.body.appendChild(msg);

  setTimeout(() => {
    msg.remove();
  }, 3000);
}

// Mostrar formulario para publicar
const publicarBtn = document.getElementById("publicarBtn");
if (publicarBtn) {
  publicarBtn.addEventListener("click", () => {
    const userId = localStorage.getItem("userId");
    if (!userId) {
      document.getElementById("advertencia").classList.remove("hidden");
      return;
    }
    document.getElementById("formularioContainer").classList.remove("hidden");
  });
}

// Cerrar formulario
const cerrarForm = document.getElementById("cerrarForm");
if (cerrarForm) {
  cerrarForm.addEventListener("click", () => {
    document.getElementById("formularioContainer").classList.add("hidden");
  });
}

// Enviar el formulario para publicar un producto
const formulario = document.getElementById("formulario");
if (formulario) {
  formulario.addEventListener("submit", async (e) => {
    e.preventDefault();
    const formData = new FormData(formulario);

    try {
      const res = await fetch("/publicar", {
        method: "POST",
        body: formData
      });

      if (res.ok) {
        formulario.reset();
        document.getElementById("formularioContainer").classList.add("hidden");
        alert("Publicación exitosa"); // Muestra el mensaje de éxito
        cargarProductos();
      } else {
        mostrarMensaje("Error al publicar", "error"); // Muestra el mensaje de error si falla
      }
    } catch (err) {
      console.error("Error al publicar:", err);
      mostrarMensaje("Ocurrió un error", "error"); // Muestra el mensaje de error si ocurre una excepción
    }
  });
}

// Cargar los productos al cargar la página
window.addEventListener("load", cargarProductos);
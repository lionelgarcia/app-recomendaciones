document.addEventListener("DOMContentLoaded", () => {
  const form = document.querySelector("form");
  const gridSeries = document.getElementById("grid-series");
  const inputId = document.getElementById("serie-id");
  const tituloForm = document.querySelector("form h2") || document.querySelector("form legend") || document.querySelector("form"); 
  const btnSubmit = form.querySelector("button[type='submit']") || form.querySelector("button");

  // 1. Función para cargar y renderizar el catálogo con botones de acción
  async function cargarSeries() {
    if (!gridSeries) return;

    try {
      const { data: series, error } = await supabaseClient
        .from("recomendacione")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;

      gridSeries.innerHTML = "";

      series.forEach((item) => {
        const article = document.createElement("article");
        article.classList.add("card-serie");

        article.innerHTML = `
          <div class="card-content">
            <h3>${item.titulo || "Sin título"}</h3>
            <p><strong>Puntuación:</strong> ${item.puntuacion || "-"}/10</p>
            <p><strong>Fecha:</strong> ${item.fecha_lanzamiento || "No especificada"}</p>
            <p><strong>Reseña:</strong> ${item.motivo || "Sin reseña"}</p>
            <p class="card-portada"><strong>Portada:</strong> ${item.portada || "Sin portada"}</p>
            
            <!-- BOTONES DE ACCIÓN (Editar / Eliminar) -->
            <div class="card-actions" style="margin-top: 10px;">
              <button class="btn-action btn-edit" type="button" onclick="prepararEdicion(${item.id})">✏️ Editar</button>
              <button class="btn-action btn-delete" type="button" onclick="eliminarSerie(${item.id})">🗑️ Eliminar</button>
            </div>
          </div>
        `;

        gridSeries.appendChild(article);
      });
    } catch (error) {
      console.error("Error al cargar las recomendaciones:", error.message);
    }
  }

  // Cargar al iniciar la página
  cargarSeries();

  if (!form) return;

  // 2. Manejar el evento submit (Decide entre INSERT o UPDATE según si hay ID)
  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const id = inputId.value; // Si tiene valor, estamos editando
    const titulo = document.getElementById("titulo")?.value || document.querySelector("[name='titulo']")?.value;
    const puntuacion = document.getElementById("puntuacion")?.value || document.querySelector("[name='puntuacion']")?.value;
    const fecha_lanzamiento = document.getElementById("fecha")?.value || document.querySelector("[name='fecha']")?.value;
    const motivo = document.getElementById("motivo")?.value || document.querySelector("[name='motivo']")?.value;
    
    const inputImagen = document.getElementById("imagen-file");
    const archivoSeleccionado = inputImagen?.files[0];
    const portada = archivoSeleccionado ? archivoSeleccionado.name : null;

    try {
      if (id) {
        // --- MODO UPDATE (Actualizar) ---
        const datosActualizados = {
          titulo,
          puntuacion: puntuacion ? parseInt(puntuacion) : null,
          fecha_lanzamiento: fecha_lanzamiento || null,
          motivo
        };
        if (portada) datosActualizados.portada = portada; // Solo cambia si subió una nueva

        const { error } = await supabaseClient
          .from("recomendacione")
          .update(datosActualizados)
          .eq("id", id);

        if (error) throw error;
        alert("¡Recomendación actualizada con éxito!");
      } else {
        // --- MODO INSERT (Crear nuevo) ---
        const nuevaRecomendacion = {
          titulo,
          puntuacion: puntuacion ? parseInt(puntuacion) : null,
          fecha_lanzamiento: fecha_lanzamiento || null,
          portada: portada || "sin-portada.jpg",
          motivo
        };

        const { error } = await supabaseClient
          .from("recomendacione")
          .insert([nuevaRecomendacion]);

        if (error) throw error;
        alert("¡Recomendación guardada con éxito!");
      }

      cancelarEdicion();
      await cargarSeries();
    } catch (error) {
      console.error("Error en la operación:", error.message);
      alert("Error: " + error.message);
    }
  });

  // Funciones globales para que funcionen los botones onclick del HTML dinámico
  window.eliminarSerie = async function(id) {
    const confirmacion = confirm("¿Estás seguro de que querés eliminar esta recomendación?");
    if (!confirmacion) return;

    try {
      const { error } = await supabaseClient
        .from("recomendacione")
        .delete()
        .eq("id", id);

      if (error) throw error;
      alert("Recomendación eliminada con éxito.");

      if (inputId.value == id) {
        cancelarEdicion();
      }
      await cargarSeries();
    } catch (err) {
      alert("Error al eliminar: " + err.message);
    }
  };

  window.prepararEdicion = async function(id) {
    try {
      const { data: item, error } = await supabaseClient
        .from("recomendacione")
        .select("*")
        .eq("id", id)
        .single();

      if (error) throw error;

      // Cargar datos en el formulario
      inputId.value = item.id;
      document.getElementById("titulo").value = item.titulo || "";
      document.getElementById("puntuacion").value = item.puntuacion || "";
      document.getElementById("fecha").value = item.fecha_lanzamiento || "";
      document.getElementById("motivo").value = item.motivo || "";

      // Desplazar pantalla arriba para ver el formulario
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) {
      alert("No se pudo cargar para editar: " + err.message);
    }
  };

  function cancelarEdicion() {
    form.reset();
    inputId.value = "";
  }
});
document.addEventListener("DOMContentLoaded", () => {
  const form = document.querySelector("form");
  const gridSeries = document.getElementById("grid-series");

  // Función para cargar y renderizar las series desde Supabase
  async function cargarSeries() {
    if (!gridSeries) return;

    try {
      // Consulta SELECT ordenada por fecha de creación descendente
      const { data: series, error } = await supabaseClient
        .from("recomendacione") // Recordá que tu tabla se llama 'recomendacione'
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;

      // Limpiar el contenedor antes de renderizar
      gridSeries.innerHTML = "";

      // Generar las tarjetas dinámicamente con el DOM
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
          </div>
        `;

        gridSeries.appendChild(article);
      });
    } catch (error) {
      console.error("Error al cargar las series:", error.message);
    }
  }

  // Cargar las series al abrir la página
  cargarSeries();

  if (!form) {
    console.error("No se encontró ningún formulario en la página.");
    return;
  }

  // Lógica de envío del formulario (INSERT)
  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const titulo = document.getElementById("titulo")?.value || document.querySelector("[name='titulo']")?.value;
    const puntuacion = document.getElementById("puntuacion")?.value || document.querySelector("[name='puntuacion']")?.value;
    const fecha_lanzamiento = document.getElementById("fecha")?.value || document.querySelector("[name='fecha']")?.value;
    const motivo = document.getElementById("motivo")?.value || document.querySelector("[name='motivo']")?.value;
    
    const inputImagen = document.getElementById("imagen-file");
    const archivoSeleccionado = inputImagen?.files[0];
    const portada = archivoSeleccionado ? archivoSeleccionado.name : "sin-portada.jpg";

    const nuevaRecomendacion = {
      titulo: titulo,
      puntuacion: puntuacion ? parseInt(puntuacion) : null,
      fecha_lanzamiento: fecha_lanzamiento || null,
      portada: portada,
      motivo: motivo
    };

    try {
      const { error } = await supabaseClient
        .from("recomendacione")
        .insert([nuevaRecomendacion]);

      if (error) throw error;

      alert("¡Recomendación guardada con éxito!");
      form.reset();
      
      // Recargar el catálogo automáticamente para que aparezca la nueva tarjeta
      cargarSeries();
    } catch (error) {
      console.error("Error al insertar:", error.message);
      alert("Error al guardar: " + error.message);
    }
  });
});
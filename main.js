document.addEventListener("DOMContentLoaded", () => {
  const form = document.querySelector("form");

  if (!form) {
    console.error("No se encontró ningún formulario en la página.");
    return;
  }

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    // 1. Capturar los valores de los inputs
    const titulo = document.getElementById("titulo")?.value || document.querySelector("[name='titulo']")?.value;
    const puntuacion = document.getElementById("puntuacion")?.value || document.querySelector("[name='puntuacion']")?.value;
    const fecha_lanzamiento = document.getElementById("fecha")?.value || document.querySelector("[name='fecha']")?.value;
    const motivo = document.getElementById("motivo")?.value || document.querySelector("[name='motivo']")?.value;
    const favorito = document.getElementById("favorito")?.checked || false;

    // 2. Capturar el archivo de imagen seleccionado en id="imagen-file"
    const inputImagen = document.getElementById("imagen-file");
    const archivoSeleccionado = inputImagen?.files[0];
    const portada = archivoSeleccionado ? archivoSeleccionado.name : "sin-portada.jpg";

    // 3. Armar el objeto JSON con las columnas exactas de tu tabla en Supabase
    const nuevaRecomendacion = {
      titulo: titulo,
      puntuacion: puntuacion ? parseInt(puntuacion) : null,
      fecha_lanzamiento: fecha_lanzamiento || null,
      portada: portada,
      motivo: motivo,
      favorito: favorito
    };

    try {
      // 4. Enviar a Supabase
      const { data, error } = await supabaseClient
        .from("recomendacione")
        .insert([nuevaRecomendacion]);

      if (error) {
        throw error;
      }

      alert("¡Recomendación guardada con éxito!");
      form.reset();
    } catch (error) {
      console.error("Error al insertar:", error.message);
      alert("Error al guardar: " + error.message);
    }
  });
});
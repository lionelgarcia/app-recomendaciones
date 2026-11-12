form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const id = inputId.value; // Si tiene ID, está editando; si está vacío, es nuevo
  const titulo = document.getElementById("titulo")?.value;
  const puntuacion = document.getElementById("puntuacion")?.value;
  const motivo = document.getElementById("motivo")?.value;
  
  // 👉 ESTO ES LO QUE TENÉS QUE AGREGAR DENTRO DEL SUBMIT:
  const { data: { session } } = await supabaseClient.auth.getSession();
  const userEmail = session ? session.user.email : 'Anónimo';

  if (!id) {
    // --- MODO INSERT (Crear nuevo) ---
    const nuevaRecomendacion = {
      titulo,
      puntuacion: puntuacion ? parseInt(puntuacion) : null,
      motivo,
      user_email: userEmail // <-- Esto guarda el email para que funcione la política RLS
    };

    const { error } = await supabaseClient
      .from("recomendacione")
      .insert([nuevaRecomendacion]);

    if (error) throw error;
    alert("¡Recomendación guardada con éxito!");
  } else {
    // --- MODO UPDATE (Actualizar si estás editando) ---
    const datosActualizados = {
      titulo,
      puntuacion: puntuacion ? parseInt(puntuacion) : null,
      motivo
    };

    const { error } = await supabaseClient
      .from("recomendacione")
      .update(datosActualizados)
      .eq("id", id);

    if (error) throw error;
    alert("¡Recomendación actualizada con éxito!");
  }

  form.reset();
  inputId.value = "";
  if (typeof cargarSeries === "function") cargarSeries();
});
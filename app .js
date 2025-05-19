let idTareaEnEdicion = null;

document.addEventListener('DOMContentLoaded', async () => {
  const supabaseUrl = 'https://khioylqqfewihdjwoleu.supabase.co';
  const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtoaW95bHFxZmV3aWhkandvbGV1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDM0MTYxNjgsImV4cCI6MjA1ODk5MjE2OH0.sMKbs-4YFNAs-IJ5rZGcOS2eAjedAq4k6lPVeg---hk';
  const supabaseClient = window.supabase.createClient(supabaseUrl, supabaseAnonKey); 

  // Seleccionamos el formulario por su id
const formularioTarea = document.getElementById('formularioTarea');

// Capturamos el evento "submit" del formulario
formularioTarea.addEventListener('submit', async (event) => {
  event.preventDefault(); // Evita que la página se recargue
  await guardarTarea(supabaseClient);  // Llama a la función que guarda la tarea
  formularioTarea.reset(); // Limpia los campos del formulario
  botonCancelar.addEventListener('click', () => {
    
  // Cancelamos el modo edición
  idTareaEnEdicion = null;

  // Limpiamos el formulario
  formularioTarea.reset();

  // Restauramos el aspecto del botón principal
  botonGuardar.textContent = "Guardar tarea";
  botonCancelar.style.display = "none";
});
});

  await cargarTareas(supabaseClient); 
});


async function cargarTareas(supabase) { 
  const listadoTareas = document.getElementById('listadoTareas');

  const { data: tareas, error } = await supabase
    .from('tareas')
    .select('*');

  if (error) {
    listadoTareas.innerHTML = '<p>Error al cargar tareas.</p>';
    console.error(error);
    return;
  }

  listadoTareas.innerHTML = ''; // Limpiamos la vista anterior
   tareas.forEach(tarea => {
  // Creamos un contenedor div para cada tarea
  const contenedor = document.createElement('div');

  // Creamos el párrafo con el título de la tarea
  const p = document.createElement('p');
  p.textContent = tarea.nombre;

  // Botón para eliminar la tarea
  const botonEliminar = document.createElement('button');
  botonEliminar.textContent = 'Eliminar';
  botonEliminar.addEventListener('click', async () => {
    await eliminarTarea(tarea.id, supabase);
  });

  // Botón para editar la tarea
  const botonEditar = document.createElement('button');
  botonEditar.textContent = 'Editar';
  botonEditar.addEventListener('click', () => {
    // Activamos el modo edición guardando el ID de la tarea
    idTareaEnEdicion = tarea.id;

     // Rellenamos el formulario con los datos de la tarea
    formularioTarea.nombre.value = tarea.nombre;
    formularioTarea.equipo.value = tarea.equipo || '';
    formularioTarea.año.value = tarea.año || '';
    formularioTarea.hora.value = tarea.hora || '';
    formularioTarea.puesto.value = tarea.puesto || '';
    formularioTarea.completada.checked = tarea.completada || false;

    // Cambiamos los elementos visuales del formulario
    botonGuardar.textContent = "Guardar cambios";
    botonCancelar.style.display = "inline-block";
  });

  // Añadimos los elementos al contenedor y este al listado
  contenedor.appendChild(p);
  contenedor.appendChild(botonEditar);
  contenedor.appendChild(botonEliminar);
  listadoTareas.appendChild(contenedor);

  

   });
}
async function guardarTarea(supabase) {
  // Recogemos los datos del formulario
  const nuevaTarea = {
    nombre: formularioTarea.nombre.value,
    equipo: formularioTarea.equipo.value,
    año: formularioTarea.año.value,
    hora: formularioTarea.hora.value,
    puesto: parseInt(formularioTarea.puesto.value),
    completada: formularioTarea.completada.checked
  };

  let resultado;

  if (idTareaEnEdicion) {
    // Estamos editando una tarea existente
    resultado = await supabase
      .from('tareas')
      .update(nuevaTarea)
      .eq('id', idTareaEnEdicion);

    // Salimos del modo edición
    idTareaEnEdicion = null;
  } else {
    // Estamos insertando una tarea nueva
    resultado = await supabase
      .from('tareas')
      .insert([nuevaTarea]);
  }

  if (resultado.error) {
    console.error('Error al guardar tarea:', resultado.error.message);
    return;
  }

  // Reiniciamos el formulario y el aspecto visual
  formularioTarea.reset();
  botonGuardar.textContent = "Guardar tarea";
  botonCancelar.style.display = "none";

  await cargarTareas(supabase);
} 

async function eliminarTarea(id, supabase) {
  const { error } = await supabase
    .from('tareas')
    .delete()
    .eq('id', id); // Elimina la tarea cuyo ID coincida

  if (error) {
    console.error('Error al eliminar tarea:', error.message);
    return;
  }

  // Volvemos a cargar la lista para que desaparezca la tarea eliminada
  await cargarTareas(supabase);
}
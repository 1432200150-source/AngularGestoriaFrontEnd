import Swal from 'sweetalert2';

/**
 * Muestra un mensaje de éxito (verde con icono de check)
 */
export function mensajeExito(titulo: string, texto: string): void {
  Swal.fire({
    title: titulo,
    text: texto,
    icon: 'success',
    confirmButtonColor: '#28a745',
    confirmButtonText: 'Aceptar',
    allowOutsideClick: false,
    allowEscapeKey: false
  });
}

/**
 * Muestra un mensaje de alerta (amarillo con icono de warning)
 */
export function mensajeAlerta(titulo: string, texto: string): void {
  Swal.fire({
    title: titulo,
    text: texto,
    icon: 'warning',
    confirmButtonColor: '#ffc107',
    confirmButtonText: 'Entendido',
    allowOutsideClick: false,
    allowEscapeKey: false
  });
}

/**
 * Muestra un mensaje de error (rojo con icono de error)
 */
export function mensajeError(titulo: string, texto: string): void {
  Swal.fire({
    title: titulo,
    text: texto,
    icon: 'error',
    confirmButtonColor: '#dc3545',
    confirmButtonText: 'Cerrar',
    allowOutsideClick: false,
    allowEscapeKey: false
  });
}

/**
 * Muestra un mensaje informativo (azul con icono de info)
 */
export function mensajeInformativo(titulo: string, texto: string): void {
  Swal.fire({
    title: titulo,
    text: texto,
    icon: 'info',
    confirmButtonColor: '#007bff',
    confirmButtonText: 'OK',
    allowOutsideClick: false,
    allowEscapeKey: false
  });
}

/**
 * Muestra un mensaje de confirmación (Sí/No)
 * @returns true si confirmó, false si canceló
 */
export function mensajeConfirmacion(
  titulo: string,
  texto: string,
  textoBotonConfirmar = 'Sí',
  textoBotonCancelar = 'No'
): Promise<boolean> {
  return Swal.fire({
    title: titulo,
    text: texto,
    icon: 'question',
    showCancelButton: true,
    allowOutsideClick: false,
    allowEscapeKey: false,
    confirmButtonColor: '#28a745',
    cancelButtonColor: '#dc3545',
    confirmButtonText: textoBotonConfirmar,
    cancelButtonText: textoBotonCancelar
  }).then((result) => result.isConfirmed);
}

/**
 * Muestra una confirmación con botones personalizados (máximo 2)
 * @param botones Objeto donde la llave es la etiqueta del botón y el valor lo que se retorna al elegirlo
 * @returns el valor asociado al botón elegido, o null si se cerró el modal
 */
export function mensajeConfirmacionMultiple<T>(
  titulo: string,
  texto: string,
  botones: Record<string, T>
): Promise<T | null> {
  const claves = Object.keys(botones);

  return Swal.fire({
    title: titulo,
    text: texto,
    icon: 'question',
    showCancelButton: false,
    showDenyButton: claves.length >= 2,
    showConfirmButton: true,
    confirmButtonText: claves[0],
    denyButtonText: claves[1] || '',
    showCloseButton: true,
    allowOutsideClick: false,
    allowEscapeKey: false
  }).then((result) => {
    if (result.isConfirmed) return botones[claves[0]];
    if (result.isDenied) return botones[claves[1]];
    return null;
  });
}
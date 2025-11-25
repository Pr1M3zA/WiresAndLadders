
function getHour() {
  const ahora = new Date();
  const horas = ahora.getHours().toString().padStart(2, '0');
  const minutos = ahora.getMinutes().toString().padStart(2, '0');
  const segundos = ahora.getSeconds().toString().padStart(2, '0');
  const milisegundos = ahora.getMilliseconds().toString().padStart(3, '0');
  return `${horas}:${minutos}:${segundos}:${milisegundos}`;
}

export {getHour}
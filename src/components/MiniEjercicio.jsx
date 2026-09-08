// Miniatura del dibujo de un ejercicio: siempre visible allá donde aparezca
// un ejercicio, para reconocerlo a simple vista. Se oculta sola si no hay
// imagen (ejercicios personalizados). `chica` = 32px para tiras compactas.
export default function MiniEjercicio({ id, chica = false }) {
  return (
    <img
      className={chica ? 'mini-ej mini-ej-chica' : 'mini-ej'}
      src={`img/ejercicios/${id}.webp`}
      alt=""
      loading="lazy"
      onError={(e) => { e.currentTarget.style.display = 'none' }}
    />
  )
}

function randomText() {
  const text = ('abcdefghijklmnopqrstuvwsyz0123456789')

  const letter = text[Math.floor(Math.random() * text.length)]
  return letter
}

function rain () {
  const cloud = document.querySelector('.cloud')
  const e = document.createElement('div')
  const left = Math.floor(Math.random() * 310)
  const size = Math.random() * 1.5 
  const duration = Math.random() * 1
  e.classList.add('text')
  cloud.appendChild(e)
  e.innerText = randomText()
  e.style.left = left + 'px'
  e.style.fontSize = 0.5 + size + 'em'
  e.style.animationDuration = 1 + duration + 's'
  setTimeout(() => {
    cloud.removeChild(e)
  },2000)
}

setInterval(function() {
  rain()
}, 20)
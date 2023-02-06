import { onMounted } from 'vue'
import JSConfetti from 'js-confetti'
import type { Ref } from 'vue'

export function useConfettis(canvas: Ref<HTMLCanvasElement>) {
  let confettiInstance: JSConfetti

  onMounted(
    () => {
      confettiInstance = new JSConfetti({
        canvas: canvas.value,
      })
    },
  )
  const confettis = () => {
    confettiInstance.addConfetti({
      emojis: ['🖖', '🖌️', '🥰', '🇳🇱'],
      emojiSize: 128,
      confettiNumber: 10,
    })
  }

  return {
    poof: confettis,
  }
}

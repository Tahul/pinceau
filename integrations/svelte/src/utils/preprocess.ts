import sveltePreprocess from 'svelte-preprocess'
import { preprocess } from 'svelte/compiler'

export async function autoProcessTS(filename: string, content: string, compilerOptions?: any) {
  const opts = sveltePreprocess({
    typescript: {
      tsconfigFile: false,
      compilerOptions: {
        ...compilerOptions,
        skipLibCheck: true,
      },
    },
  })

  return await preprocess(content, opts, { filename })
}

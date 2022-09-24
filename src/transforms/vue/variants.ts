import { camelCase, upperFirst } from 'scule'
import * as recast from 'recast'
import { fullVariantsPropsRegex, shortVariantsPropsRegex } from '../../utils'

export function transformVariants(code = '', variants: any = {}): string {
  // code += `\nconst __$variants = ${JSON.stringify(variants)}\n`
  return code
}

export function transformVariantsProps(code = '', variants: any = {}): string {
  const propKeyToAst = (ast: any, key: string, prefix: string) => {
    ast.properties.push(
      recast.types.builders.objectProperty(
        recast.types.builders.stringLiteral(camelCase(camelCase(prefix + upperFirst(key)))),
        recast.types.builders.objectExpression([
          recast.types.builders.objectProperty(
            recast.types.builders.identifier('type'),
            recast.types.builders.identifier('Boolean'),
          ),
          recast.types.builders.objectProperty(
            recast.types.builders.identifier('required'),
            recast.types.builders.identifier('false'),
          ),
          recast.types.builders.objectProperty(
            recast.types.builders.identifier('default'),
            recast.types.builders.identifier('false'),
          ),
        ]),
      ),
    )
  }

  // $variantProps('tagName')
  code = code.replace(
    shortVariantsPropsRegex,
    (_, tagName) => {
      const ast = recast.types.builders.objectExpression([])
      if (variants[tagName]) {
        Object.keys(variants[tagName])
          .forEach(
            propKey => propKeyToAst(ast, propKey, ''),
          )
      }
      return recast.print(ast).code
    })

  // $variantsProps('tagName', 'prefix')
  code = code.replace(
    fullVariantsPropsRegex,
    (_, tagName, prefix) => {
      const ast = recast.types.builders.objectExpression([])
      if (variants[tagName]) {
        Object.keys(variants[tagName])
          .forEach(
            propKey => propKeyToAst(ast, propKey, prefix),
          )
      }
      return recast.print(ast).code
    },
  )

  return code
}

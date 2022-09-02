import { camelCase, upperFirst } from 'scule'
import recast from 'recast'

const shortVariantsPropsRegex = /\$variantsProps\('(.*)'\)/g
const fullVariantsPropsRegex = /\$variantsProps\(('(.*?)'),\s'(.*?)'\)/g

export function resolveVariantProps(code = '', variantProps: any = {}): string {
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
  code = code.replace(shortVariantsPropsRegex,
    (_, tagName) => {
      const ast = recast.types.builders.objectExpression([])
      if (variantProps[tagName]) {
        Object.keys(variantProps[tagName])
          .forEach(
            propKey => propKeyToAst(ast, propKey, ''),
          )
      }
      return recast.print(ast).code
    })

  // $variantProps('tagName', 'prefix')
  code = code.replace(fullVariantsPropsRegex,
    (_, tagName, prefix) => {
      const ast = recast.types.builders.objectExpression([])
      if (variantProps[tagName]) {
        Object.keys(variantProps[tagName])
          .forEach(
            propKey => propKeyToAst(ast, propKey, prefix),
          )
      }
      return recast.print(ast).code
    },
  )

  return code
}

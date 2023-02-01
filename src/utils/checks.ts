export function isSafeConstName(name) {
  // Check if the name starts with a letter, underscore, or dollar sign
  if (!/^[a-zA-Z_$][0-9a-zA-Z_$]*$/.test(name)) {
    return false
  }

  // Check if the name is a reserved word
  if (['break', 'case', 'catch', 'class', 'const', 'continue', 'debugger', 'default', 'delete', 'do', 'else', 'enum', 'export', 'extends', 'false', 'finally', 'for', 'function', 'if', 'implements', 'import', 'in', 'instanceof', 'interface', 'let', 'new', 'null', 'package', 'private', 'protected', 'public', 'return', 'static', 'super', 'switch', 'this', 'throw', 'true', 'try', 'typeof', 'var', 'void', 'while', 'with', 'yield'].includes(name)) {
    return false
  }

  return true
}

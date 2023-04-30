import {
  Expr,
  FunctionDeclaration,
  IfElseStatement,
  Program,
  Stmt,
  VarDeclaration,
} from "../../frontend/2-ast"
import Environment from "../environment"
import { evaluate } from "../interpreter"
import { MK_NULL } from "../macros"
import { BooleanVal, FunctionVal, RuntimeVal } from "../values"

export function eval_program(program: Program, env: Environment): RuntimeVal {
  let evaluated: RuntimeVal = MK_NULL()

  for (const stmt of program.body) {
    evaluated = evaluate(stmt, env)
  }

  return evaluated
}

export function eval_var_declaration(declaration: VarDeclaration, env: Environment): RuntimeVal {
  const value = declaration.value ? evaluate(declaration.value, env) : MK_NULL()

  return env.declareVar(declaration.identifier, value, declaration.constant)
}

export function eval_fn_declaration(
  declaration: FunctionDeclaration,
  env: Environment
): RuntimeVal {
  const fn = {
    type: "function",
    name: declaration.name,
    paramteres: declaration.parameters,
    declarationEnv: env,
    body: declaration.body,
  } as FunctionVal

  return env.declareVar(declaration.name, fn, true)
}

export function eval_code_block(block: Stmt[], parentEnv: Environment) {
  let result: RuntimeVal = MK_NULL()
  const scope = new Environment(parentEnv)

  for (const stmt of block) result = evaluate(stmt, scope)

  return result
}

export function eval_if_check(check: Expr, env: Environment): BooleanVal {
  const eval_check = evaluate(check, env) as BooleanVal

  if (eval_check.type != "boolean")
    throw new Error("Restult of check in 'if' statment must be a boolean")

  return eval_check
}

export function eval_if_else_statement(ifstmt: IfElseStatement, env: Environment): RuntimeVal {
  const { check, body, childChecks } = ifstmt

  if (eval_if_check(check, env).value) {
    eval_code_block(body, env)
  } else if (childChecks && childChecks.length > 0) {
    for (const acheck of childChecks) {
      if (eval_if_check(acheck.check, env).value) {
        eval_code_block(acheck.body, env)
        break
      }
    }
  } else if (ifstmt.else) eval_code_block(ifstmt.else, env)

  return MK_NULL()
}

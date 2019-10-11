import template from "@babel/template";

const buildErrorHandler = template(`
const IDENTIFY = (window.wrapAsync||(window.wrapAsync=(wrapedFn)=>{
      return (...args)=>{
         return wrapedFn(...args).catch(err=>{
            console.error(err)
          });
      }
  }))(ASYNC_EXPRESSION)
`);

export default function({ types: t }) {
  function wrapPathWithHandler(path) {
    if (path.get("async").node) {
      const sourceId = path.get("id.name").node;
      delete path.node.id;
      path.replaceWith(
        buildErrorHandler({
          IDENTIFY: sourceId,
          ASYNC_EXPRESSION: t.toExpression(path.node)
        })
      );
    }
  }
  const visitor = [
    "FunctionDeclaration",
    "ArrowFunctionExpression",
    "FunctionExpression"
  ].reduce((v, key) => {
    v[key] = wrapPathWithHandler;
    return v;
  }, {});
  return {
    visitor
  };
}

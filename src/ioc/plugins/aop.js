/**
 * @file aop插件
 *
 */
// import 'proxy-polyfill/proxy.min';

const REFS_TOKEN = '$refs';
const RAW_TOKEN = '$raw';
let RAW_NAME;

function getTrap(val, property, pattern, context) {
    return pattern[property] && pattern[property].get
        ? Reflect.apply(pattern[property].get, context, [val])
        : val;
}

function callTrap(method, args, trapName, pattern, context) {
    let processed = pattern[trapName].before
        ? Reflect.apply(pattern[trapName].before, context, args)
        : args;
    let result = pattern[trapName].around
        ? Reflect.apply(pattern[trapName].around, context, [method, processed])
        : Reflect.apply(method, context, [processed]);
    let payload = pattern[trapName].after
        ? Reflect.apply(pattern[trapName].after, context, [result])
        : result;
    return payload;
}

/**
 * 创建代理对象
 *
 * @export createProxy
 * @param {IComponent} target - 被代理对象
 * @param {Object} [pattern={}]
 * @param {*} context
 * @returns
 */
export function createProxy(target, pattern = {}, context) {
    const proxy = new Proxy(target, {
        get(object, property, receiver) {
            const thisContext = context || receiver;
            const originVal = object[property];

            if (
                property === RAW_TOKEN
                && typeof originVal === 'function'
                && originVal.name
            ) {
                RAW_NAME = originVal.name;
            }

            if (originVal == null) {
                return;
            }

            // 对`$refs` 只做get拦截
            if (property === REFS_TOKEN && originVal) {
                // 组件依赖注入
                return getTrap(originVal, property, pattern, thisContext);
            } else {
                if (pattern[property]) {
                    let result = getTrap(
                        originVal,
                        property,
                        pattern,
                        thisContext
                    );
                    if (
                        typeof result === 'function'
                        || typeof result === 'object'
                    ) {
                        return createProxy(result, pattern, context);
                    }
                }
                return Reflect.get(target, property, thisContext);
            }
        },

        apply(method, object, args) {
            let thisContext = context || object;
            if (method.name === RAW_NAME && Reflect.has(object, RAW_TOKEN)) {
                return callTrap(method, args, RAW_TOKEN, pattern, thisContext);
            }
            // 自定义的函数拦截
            if (Reflect.has(pattern, method.name)) {
                return callTrap(
                    method,
                    args,
                    method.name,
                    pattern,
                    thisContext
                );
            } else {
                return Reflect.apply(method, thisContext, args);
            }
        }
    });

    return proxy;
}

export default {
    createProxy
};

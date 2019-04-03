/**
 * @file IoC 类
 */
import { createProxy } from './plugins/aop';
import IComponent from './component';

const COMPONENTS = Symbol('components');
const CREATE_INSTANCE = Symbol('createInstance');
const GET_INSTANCE = Symbol('getInstance');
const CREATE_ASPECT = Symbol('createAspect');
const GET_VIEW_COMPONENT = Symbol('getViewComponent');
const AUTO_INJECT = Symbol('autoInject');

/**
 * IoC 容器类
 *
 * @export Ioc
 * @class Ioc
 */
export default class Ioc {
    constructor(config = {}) {
        this.config = config;
        this[COMPONENTS] = Object.create(null);
    }

    /**
     * 注册IoC组件方法
     * @method register
     * @param {string} name - 组件名称
     * @param {Function|string} HOC - 高阶组件
     * @param {Object} [options] - 配置项集合
     * @param {Array} [options.$refs] - 组件依赖
     * @param {Object} [options.$config] - 配置项
     * @param {Object} [options.$aop] - aop拦截属性
     * @returns {IComponent} instance - IComponent实例
     * @memberof Ioc
     */
    register(name, HOC, { $refs = [], $config = {}, $aop, $result } = {}) {
        if (typeof name === 'object') {
            let keys = Object.keys(name);

            return keys.reduce((components, key) => {
                let { $raw, ...options } = name[key];
                components[key] = this.register(key, $raw, options);
                return components;
            }, {});
        }

        Object.defineProperty(this, name, {
            get() {
                if (!this[COMPONENTS][name]) {
                    const instance = this[CREATE_INSTANCE](
                        name,
                        HOC,
                        $refs,
                        $config,
                        $aop,
                        $result
                    );
                    if ($aop) {
                        const pattern = this[CREATE_ASPECT]($aop);
                        this[COMPONENTS][name] = createProxy(instance, pattern);
                    } else {
                        this[COMPONENTS][name] = instance;
                    }
                }

                return this[COMPONENTS][name];
            },
            configurable: true,
            enumerable: true
        });

        return this[name];
    }

    /**
     * 判断组件是否已经注册
     *
     * @param {string} name - 组件名
     * @returns {boolean}
     * @memberof Ioc
     */
    hasComponent(name) {
        return !!this[COMPONENTS][name];
    }

    /**
     * 创建IoC组件容器
     *
     * @private
     * @param {string} name - 组件名
     * @param {Function} HOC - 高阶组件
     * @param {Array} $refs - 依赖组件
     * @param {Object} $config - 配置项
     * @param {Object} $aop - 拦截trap
     * @returns {IComponent}
     * @memberof Ioc
     */
    [CREATE_INSTANCE](name, HOC, $refs, $config, $aop) {
        return new IComponent({
            name,
            $raw: HOC,
            $refs: this[GET_VIEW_COMPONENT]($refs),
            $config: this[AUTO_INJECT](HOC, $config),
            $aop
        });
    }

    [GET_INSTANCE](refs) {
        return refs.reduce((acc, item) => {
            if (typeof item === 'object') {
                item = item.name;
            }
            return acc.concat(this[COMPONENTS][item]);
        }, []);
    }

    [GET_VIEW_COMPONENT](refs) {
        return this[GET_INSTANCE](refs).map(instance => instance.getComponent());
    }

    /**
     * 初始化切面配置
     *@private
     * @param {Object} config
     * @returns {Object}
     * @memberof Ioc
     */
    [CREATE_ASPECT](config) {
        // 确保$aop中存在 `$config` 字段，否则无法对`$config`中属性进行代理
        return {
            $config: {},
            ...config
        };
    }

    [AUTO_INJECT](HOC, config) {
        if (!config.$view) {
            config.$view = HOC.$view;
        }
        if (!config.$logic) {
            config.$logic = HOC.$logic;
        }
        return config;
    }
}

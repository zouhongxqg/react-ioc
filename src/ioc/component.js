const COMPILE = Symbol('compile');
/**
 * 组件容器类
 *
 * @export
 * @class IComponent
 */
export default class IComponent {
    /**
     *Creates an instance of IComponent.
     * @param {*} { name, $raw, $refs, $config, $aop }
     * @memberof IComponent
     */
    constructor({ name, $raw, $refs, $config, $aop }) {
        this.name = name;
        this.$raw = $raw;
        this.$refs = $refs;
        this.$config = $config;
        this.$aop = $aop;
        this.__component__ = null;
    }

    /**
     * 组件导出方法
     * @private
     * @return {ReactComponent}
     * @memberof IComponent
     */
    [COMPILE]() {
        const component = this.$raw(this.$refs, this.$config);
        // 对高阶组件进行手动命名
        component.displayName = this.$raw.name;
        return component;
    }

    /**
     * 获取包装后的ReactComponent
     *
     * @returns {ReactComponent}
     * @memberof IComponent
     */
    getComponent() {
        this.__component__ = this.__component__ || this[COMPILE]();
        return this.__component__;
    }
}

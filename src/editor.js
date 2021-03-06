import RangeHandler from './range/handler'
import './style.css'
import template from './editor.html'
/**
 * Created by peak on 2017/2/9.
 */
export default {
    template,
    props: {
        content: {
            type: String,
            required: true,
            default: ''
        },
        height: {
            type: Number,
            default: 300,
            validator(val) {
                return val >= 100
            }
        },
        zIndex: {
            type: Number,
            default: 1000
        },
        autoHeight: {
            type: Boolean,
            default: true
        },
        showModuleName: {},
        action: {
            type: String,
            required: true,
            default: ''
        },
        options: {
            type: Object,
            default() {
                return {}
            }
        }
    },
    data() {
        return {
            // defaultShowModuleName:false
            // locale: {},
            // modules:{},
            fullScreen: false,
            dashboard: null
        }
    },
    watch: {
        content(val) {
            const content = this.$refs.content.innerHTML
            if (val !== content) {
                this.$refs.content.innerHTML = val
            }
            this.$emit('update:content', val)
        },
        fullScreen(val) {
            const component = this
            if (val) {
                component.parentEl = component.$el.parentNode
                component.nextEl = component.$el.nextSibling
                document.body.appendChild(component.$el)
                return
            }
            if (component.nextEl) {
                component.parentEl.insertBefore(component.$el, component.nextEl)
                return
            }
            component.parentEl.appendChild(component.$el)
        }
    },
    computed: {
        contentStyle() {
            const style = {}
            if (this.fullScreen) {
                style.height = `${window.innerHeight - this.$refs.toolbar.clientHeight - 1}px`
                return style
            }
            if (!this.autoHeight) {
                style.height = `${this.height}px`
                return style
            }
            style['min-height'] = `${this.height}px`
            return style
        }
    },
    methods: {
        toggleFullScreen() {
            this.fullScreen = !this.fullScreen
        },
        enableFullScreen() {
            this.fullScreen = true
        },
        exitFullScreen() {
            this.fullScreen = false
        },
        focus() {
            this.$refs.content.focus()
        },
        toggleDashboard(dashboard) {
            this.dashboard = this.dashboard === dashboard ? null : dashboard
        },
        execCommand(command, arg) {
            this.restoreSelection()
            if (this.range) {
                new RangeHandler(this.range).execCommand(command, arg)
            }
            this.toggleDashboard()
            this.$emit('update:content', this.$refs.content.innerHTML)
            this.$emit('change', this.$refs.content.innerHTML)
        },
        getCurrentRange() {
            return this.range
        },
        saveCurrentRange() {
            const selection = window.getSelection ? window.getSelection() : document.getSelection()
            if (!selection.rangeCount) {
                return
            }

            for (let i = 0; i < selection.rangeCount; i++) {
                const range = selection.getRangeAt(0)
                let start = range.startContainer
                let end = range.endContainer
                // for IE11 : node.contains(textNode) always return false
                start = start.nodeType === Node.TEXT_NODE ? start.parentNode : start
                end = end.nodeType === Node.TEXT_NODE ? end.parentNode : end
                if (this.$refs.content.contains(start) && this.$refs.content.contains(end)) {
                    this.range = range
                    break
                }
            }
        },
        restoreSelection() {
            const selection = window.getSelection ? window.getSelection() : document.getSelection()
            selection.removeAllRanges()
            if (this.range) {
                selection.addRange(this.range)
            } else {
                const div = document.createElement('div')
                const range = document.createRange()
                this.$refs.content.appendChild(div)
                range.setStart(div, 0)
                range.setEnd(div, 0)
                selection.addRange(range)
                this.range = range
            }
        },
        activeModule(module) {
            if (typeof module.handler === 'function') {
                module.handler(this)
                return
            }
            if (module.hasDashboard) {
                this.toggleDashboard(`dashboard-${module.name}`)
            }
        }
    },
    created() {
        this.modules.forEach((module) => {
            if (typeof module.init === 'function') {
                module.init(this)
            }
        })
    },
    mounted() {
        this.$refs.content.innerHTML = this.content
        this.$refs.content.addEventListener('mouseup', this.saveCurrentRange, false)
        this.$refs.content.addEventListener('keyup', () => {
            this.$emit('change', this.$refs.content.innerHTML)
            this.$emit('update:content', this.$refs.content.innerHTML)
            this.saveCurrentRange()
        }, false)
        this.$refs.content.addEventListener('mouseout', (e) => {
            if (e.target === this.$refs.content) {
                this.saveCurrentRange()
            }
        }, false)
        this.touchHandler = (e) => {
            if (this.$refs.content.contains(e.target)) {
                this.saveCurrentRange()
            }
        }

        window.addEventListener('touchend', this.touchHandler, false)
    },
    updated() {
        // update dashboard style
        if (this.$refs.dashboard) {
            this.$refs.dashboard.style.maxHeight = `${this.$refs.content.clientHeight}px`
        }
    },
    beforeDestroy() {
        window.removeEventListener('touchend', this.touchHandler)
        this.modules.forEach((module) => {
            if (typeof module.destroyed === 'function') {
                module.destroyed(this)
            }
        })
    }
}
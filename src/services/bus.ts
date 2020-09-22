interface IdFunction {
    fn: (payload: any) => void
    id: number
}

class Bus {
    private actions: { [key: string]: IdFunction[] } = {}
    private id = 0
    private components: { [key: string]: { [key: string]: number } } = {}

    $emit(action: string, ...params: any) {
        if (!this.actions[action]) {
            return
        }
        this.actions[action].forEach(fn => setTimeout(() => fn.fn.apply(this, params)))
    }

    $emitSync(action: string, ...params: any) {
        if (!this.actions[action]) {
            return
        }
        const results = this.actions[action].map(fn => fn.fn.apply(this, params))
        return results.length > 1 ? results : results[0]
    }

    $on(action: string, fn: (...payload: any) => void): number {
        const idfn: IdFunction = {
            id: ++this.id,
            fn: fn
        }
        this.actions[action] ? this.actions[action].push(idfn) : this.actions[action] = [idfn]
        return idfn.id
    }

    $onC(component: string, action: string, fn: (...payload: any) => void) {
        if (!(component in this.components)) this.components[component] = {}
        //Prevents adding an on action listener twice - BUT also prevents several instances to have a listener each!
        !this.components[component][action] ? this.components[component][action] = this.$on(action, fn) : 0
    }

    $offC(component: string) {
        if (!(component in this.components)) return
        for (const action of Object.keys(this.components[component])) {
            this.$off(action, this.components[component][action])
            delete this.components[component][action]
        }
    }

    $off(action: string, id: number) {
        if (!this.actions[action]) return
        id ? this.actions[action] = this.actions[action].filter(fn => fn.id !== id) : delete this.actions[action]
    }

    $subscribed(action: string) {
        return this.actions[action] && this.actions[action].length > 0
    }
}

const bus = new Bus()
export default bus

import React from "react"
import { Subscription } from "rxjs"

// Requirements for the view-to-model binding utility:
// 1. Models should be re-instantiated only if their arguments are changing.
// 2. Observables should be re-subscribed to only when the model is re-instantiated.
// 3. Types of all props passed down to the dumb view should be potentially inferrable & checkable by typescript.
// 4. It should be possible to combine multiple observable values to render a single element.
// 5. It should be possible to transform observable values before render.

function arraysEqual(lhs, rhs) {
    return lhs.length === rhs.length && lhs.every((value, index) => value === rhs[index])
}

export function render(renderFunc) {
    return class X extends React.Component {
        constructor(props) {
            super(props)
            this.state = {}
            this.usedHooks = []
            this.currentHookIndex = -1
        }

        nextHook = () => {
            this.currentHookIndex += 1
            if (this.currentHookIndex >= this.usedHooks.length) {
                this.usedHooks.push({})
            }
            return this.usedHooks[this.currentHookIndex]
        }
        
        useDistinct = (calculate, ...args) => {
            const hook = this.nextHook()
            if (hook.args === undefined || !arraysEqual(hook.args, args)) {
                hook.args = args
                hook.cachedResult = calculate()
            }
            return hook.cachedResult
        }

        useObservable = (buildSource, ...args) => {
            const hook = this.nextHook()
            if (hook.args === undefined || !arraysEqual(hook.args, args)) {
                hook.args = args

                hook.subscription && hook.subscription.unsubscribe()

                // Check to detect if current call is not finished yet and no re-rendering is needed.
                let finishedSubscribing = false
                const source = buildSource()
                if (Array.isArray(source)) {

                    hook.latestValue = []
                    hook.subscription = new Subscription()

                    source.forEach((observable, index) => {
                        hook.latestValue.push(undefined)
                        hook.subscription.add(observable.subscribe(value => {
                            hook.latestValue[index] = value
                            if (finishedSubscribing) {
                                this.setState(this.state)
                            }
                        }))
                    })

                } else {
                    hook.subscription = source.subscribe(value => {
                        hook.latestValue = value
                        if (finishedSubscribing) {
                            this.setState(this.state)
                        }
                    })
                }
                finishedSubscribing = true
            }
            return hook.latestValue
        }

        render() {
            this.currentHookIndex = -1
            return renderFunc(this.props, this)
        }
    }
}

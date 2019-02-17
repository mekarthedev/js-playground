import React from "react"
import { Observable, of } from "rxjs"
import { map, tap } from "rxjs/operators"

export function App(props) {

    let result = 0
    const value = of(2019)
        |> map(x => x * 2)
        |> map(x => x + 1)
        |> (v => v.subscribe(x => { result = x }))

    return (
        <p>Hello World: {result}</p>
    )
}

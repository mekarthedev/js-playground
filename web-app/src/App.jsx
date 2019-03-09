import React from "react"
import { of, BehaviorSubject } from "rxjs"
import { delay } from "rxjs/operators"
import { render } from "./react-rx-render"

class User {
    constructor(userId) {
        this.userId = userId
        this.name = of("John") |> delay(1000)
        this.age = of(42) |> delay(2000)
        this.isFollowed = new BehaviorSubject(false)
    }

    follow = () => {
        this.isFollowed.next(true)
    }

    unfollow = () => {
        this.isFollowed.next(false)
    }
}

class ActivityFeed {
    constructor(userId, date) {
        this.userId = userId
        this.date = date
        this.latestNews = of("No activity") |> delay(3000)
        this.likesCount = new BehaviorSubject(13)
    }

    like = () => {
        this.likesCount.next(this.likesCount.value + 1)
    }
}

export const UserActivityFeed = render((props, { useDistinct, useObservable }) => {
    const user = useDistinct(() => new User(props.userId), props.userId)
    const activityFeed = useDistinct(() => new ActivityFeed(props.userId, props.date), props.userId, props.date)

    const [ name, age, userIsFollowed ] = useObservable(() => [user.name, user.age, user.isFollowed], user)
    const latestNews = useObservable(() => activityFeed.latestNews, activityFeed)
    const likesCount = useObservable(() => activityFeed.likesCount, activityFeed)

    return (
        <div>
            <h1>{name}, {age}</h1>
            <button onClick={ userIsFollowed ? user.unfollow : user.follow}>{ userIsFollowed ? '🔕 Unfollow' : '🔔 Follow' }</button>
            <h3>{name}'s activity:</h3>
            <p>{latestNews}</p>
            <button onClick={activityFeed.like}>❤️ {likesCount}</button>
        </div>
    )
})

export function App(props) {
    return <UserActivityFeed userId="1234" date="today" />
}

import {h} from 'preact';
import {useEffect, useState} from "preact/hooks";
import {voteStore} from "../store/VoteStore";
import {Member} from "../models/member";
import {api} from "../services/api";

export default ({edit}: { edit: Function }) => {
    const emptySeat = Member.empty()
    let [members, setMembers] = useState<Member[]>([])
    let [seated, setSeated] = useState<Member[]>([])
    let [selected, setSelected] = useState<Member>(emptySeat)

    useEffect(() => {
        api.getMembers().then(m => {
            setMembers(m)

            let seated = voteStore.members
            if (!seated.length)
                seated = Array(Math.ceil(m.length / 2) * 2).fill(emptySeat)
            setSeated(seated)
        })
    }, [])

    const setSeat = (idx: number, m: Member, aSeated: Member[] | undefined = undefined) => {
        let seatedMembers = aSeated || seated
        seatedMembers[idx] = m
        setSeated([])
        setSeated(seatedMembers)
    }
    const isSeated = (m: Member) => seated.some((mx) => mx && mx.id == m.id)
    const isSelected = (m: Member) => m.id == selected.id
    const leftClicked = (m: Member) => {
        if (selected.id == m.id) {
            setSelected(emptySeat)
            return
        }
        setSelected(m)
        const seatedIdx = seated.findIndex(mx => mx.id == m.id)
        if (seatedIdx < 0) return
        setSeat(seatedIdx, emptySeat)
    }
    const rightClicked = (idx: number) => {
        if (selected.id < 0) return
        setSeat(idx, selected)
        let mIdx = members.findIndex(m => m.id == selected.id)
        while (++mIdx < members.length) {
            if (isSeated(members[mIdx])) continue
            setSelected(members[mIdx])
            return
        }
        setSelected(emptySeat)
    }
    const clearAllSeats = () => {
        setSeated([])
        setSeated(seated.fill(emptySeat))
    }
    const addSeats = () => {
        setSeated(seated.concat([emptySeat, emptySeat]))
    }
    const removeSeats = () => {
        if (seated.length < 3 || seated[seated.length - 1].id >= 0 || seated[seated.length - 2].id >= 0) return
        setSeated(seated.slice(0, seated.length - 2))
    }
    const back = () => {
        voteStore.members = seated
        voteStore.saveMembers()
        edit(false)
    }

    return (
        <div class="seat-editor">
            <div class="buttonbar">
                <button onClick={back} class="has-icon ic-chevron-left">Zurück</button>
                <button class="has-icon ic-user-minus" onClick={removeSeats}>Weniger</button>
                <button class="has-icon ic-user-plus" onClick={addSeats}>Mehr</button>
                <button class="has-icon ic-trash" onClick={clearAllSeats}>Leeren</button>
            </div>
            <div class="content">
                <div class="srclist">
                    <ul>
                        {members.map(m => <li onClick={() => leftClicked(m)} class={[
                            isSeated(m) ? 'is-seated' : '',
                            isSelected(m) ? 'is-selected' : ''
                        ].join(' ')}>{m.fname} {m.lname} ({m.fraction?.shortName})
                            <div class='avatar' style={{backgroundImage: `url(${voteStore.getImage(m.image)})`}}/>
                        </li>)}
                    </ul>
                </div>
                <div class="namelist">
                    {seated.map((m, idx) =>
                        <button onClick={() => rightClicked(idx)} class={m.id >= 0 ? 'has-seat' : ''}>
                            {m.fname} {m.lname}<br/>
                            {m.fraction ? `(${m.fraction?.shortName})` : '\xA0'}
                        </button>)}
                </div>
            </div>
        </div>
    )
}

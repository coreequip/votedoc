import {h} from 'preact';
import {Member, VoteState} from "../models/member";
import {useEffect, useState} from "preact/hooks";
import {voteStore} from "../store/VoteStore";
import bus from "../services/bus";

export default ({member}: { member: Member }) => {
    const [vote, setVote] = useState<VoteState>(VoteState.NONE)
    const setState = (state: VoteState, triggerEvent: boolean = true) => {
        if (state == vote) return
        setVote(state)
        voteStore.setVoteResult(member.id, state)
        triggerEvent ? bus.$emit('voteFraction', member.fraction?.id, state) : 0
    }
    const setStateIfUndefined = (state: VoteState) => {
        window.console.log('setStateIfUndefined', state, vote)
        setVote(state)
    }

    const setStoreVoteState = () => setVote(voteStore.getResultForCurrentDraftAndMember(member))

    useEffect(() => {
        bus.$on('voteUpdate', setStoreVoteState)
        bus.$on('voteFraction', (fractionId: string, state: VoteState) => {
            if (fractionId !== member.fraction?.id || voteStore.getResultForCurrentDraftAndMember(member) !== VoteState.NONE) return
            setState(state, false)
            window.console.log('Member', member.lname, 'will also vote', state, vote)
        })
        setStoreVoteState()
    }, [])

    return (
        <div class="name-control">
            <div class='avatar' style={{backgroundImage: `url(${voteStore.getImage(member.image)})`}}
                 onClick={() => setState(VoteState.NONE, false)}>
                {member.fname} {member.lname}<br />{member.fraction ? `(${member.fraction?.shortName})`:''}
            </div>
            <button className={'btn ' + (vote == VoteState.YES ? 'selected' : '')}
                    onClick={() => setState(VoteState.YES)}>J
            </button>
            <button className={'btn ' + (vote == VoteState.NO ? 'selected' : '')}
                    onClick={() => setState(VoteState.NO)}>N
            </button>
            <button className={'btn ' + (vote == VoteState.ABS ? 'selected' : '')}
                    onClick={() => setState(VoteState.ABS)}>E
            </button>
        </div>
    )
}
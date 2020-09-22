import {h} from 'preact';
import {useEffect, useState} from "preact/hooks";
import NameControl from './namecontrol'
import {voteStore} from "../store/VoteStore";
import {Member} from "../models/member";

export default ({edit}: { edit: Function }) => {
    let [members, setMembers] = useState<Member[]>([]);

    useEffect(() => {
        console.debug('Started load images ...')
        voteStore.loadImages().then(()=>{
            console.debug('Finished loading images!')
            setMembers([])
            setMembers(voteStore.members)
        })
        if (!voteStore.members.length) {
            edit(true)
            return
        }
        setMembers(voteStore.members)
    }, [])

    return (
        <div class='namelist'>{members.map(m => <NameControl member={m}/>)}</div>
    )
}
import {h} from 'preact';
import {useEffect, useRef, useState} from "preact/hooks";
import {voteStore} from "../store/VoteStore";
import bus from "../services/bus";
import {DraftResolution} from "../models/member";
import {api} from "../services/api";

export default ({edit}: { edit: Function }) => {
    const [draftIdx, setDraftIdx] = useState<number>(0)
    const [drafts, setDrafts] = useState<DraftResolution[]>([{
        session: '', draftResolution: 'Lade Daten ...    ', description: '', date: ''
    } as DraftResolution])
    const [isEnabled, setEnabled] = useState<boolean>(false)
    const [uploadInProgress, setUploadInProgress] = useState<boolean>(false)

    const setDraftIndex = (idx: number) => {
        setDraftIdx(idx)
        voteStore.currentDraftResolution = drafts[idx].draftResolution
        sel && sel.current ? sel.current.selectedIndex = idx : 0
        bus.$emit('voteUpdate')
    }

    const nextDraft = () => setDraftIndex(draftIdx < drafts.length - 1 ? draftIdx + 1 : draftIdx)
    const prevDraft = () => setDraftIndex(draftIdx > 0 ? draftIdx - 1 : draftIdx)
    const onChange = () => setDraftIndex(sel?.current?.selectedIndex || 0)

    const sel = useRef<HTMLSelectElement>(null)

    useEffect(() => {
        api.getDraftResolutions().then(dr => {
            setDrafts(dr)
            voteStore.setDraftResolutions(dr)
            voteStore.currentDraftResolution = dr.length ? dr[0].draftResolution : ''
            voteStore.cleanUp(dr.map((dr) => dr.draftResolution))
            bus.$emit('voteUpdate')
            setEnabled(true)
        })
        setTimeout(() => bus.$emit('voteUpdate'), 10)
    }, [])

    const toggleFullscreen = () => document.fullscreenElement ? document.exitFullscreen()
        : document.body.requestFullscreen()

    const clearVotes = () => {
        if (!window.confirm('Ergebniss für diesen Beschluss zurücksetzen?')) return
        voteStore.resetCurrentDraft()
        bus.$emit('voteUpdate')
    }

    const clearAllVotes = () => {
        if (!window.confirm('Ergebniss für A L L E Beschlüsse zurücksetzen?')) return
        voteStore.resetAllDrafts()
        bus.$emit('voteUpdate')
    }

    const uploadResults = () => {
        voteStore.uploadResults().then(() => {

        })
    }

    let tapTime = 0
    const longTap = (e: MouseEvent) => {
        window.console.log(e)
        if (e.type == 'mousedown') {
            tapTime = new Date().getTime()
            return
        }
        new Date().getTime() - tapTime < 500 ? clearVotes() : clearAllVotes()
    }

    return (
        <div class="draft-resoulution-control">
            <select ref={sel} onChange={onChange} disabled={!isEnabled}>
                {drafts.map(d => <option>{d.draftResolution} - {d.description}</option>)}
            </select>
            <button onClick={prevDraft} class="has-icon ic-caret-left"/>
            <button onClick={nextDraft} class="has-icon ic-caret-right"/>
            <button onClick={uploadResults} class="has-icon ic-cloud-upload" disabled={uploadInProgress}/>
            <button onClick={toggleFullscreen} class="has-icon ic-expand"/>
            <button onClick={() => edit(true)} class="has-icon ic-cog"/>
        </div>
    )
}

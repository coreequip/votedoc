import {DraftResolution, Member, StringMap, VoteState} from "../models/member";
import {api} from "../services/api";
import {persistence} from "../services/persistence";

export type MemberVotes = { [key: number]: { s: VoteState, t: number } }
const EMPTY_GIF = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7'

class VoteStore {
    private voteResults: Record<string, MemberVotes> = {}
    private _currentDraftResolution: string = ''
    private _members: Member[] = []
    private _images: StringMap = {}
    private _draftResolutions: Record<string, DraftResolution> = {}

    constructor() {
        this.voteResults = persistence.voteResults
        this._members = persistence.members
    }

    get members(): Member[] {
        return this._members;
    }

    set members(value: Member[]) {
        this._members = value;
    }

    get currentDraftResolution(): string {
        return this._currentDraftResolution;
    }

    set currentDraftResolution(value: string) {
        this._currentDraftResolution = value;
    }

    getDraftResolution(id: string): DraftResolution {
        return this._draftResolutions[id];
    }

    setDraftResolutions(resolutions: DraftResolution[]) {
        resolutions.forEach(r => this._draftResolutions[r.draftResolution] = r)
    }

    public setVoteResult(memberId: number, result: VoteState) {
        if (!this.voteResults[this.currentDraftResolution]) this.voteResults[this.currentDraftResolution] = {}
        this.voteResults[this.currentDraftResolution][memberId] = {
            s: result,
            t: ~~(new Date().getTime() / 1000)
        }
        this.saveVoteResults();
    }

    private saveVoteResults() {
        persistence.voteResults = this.voteResults
    }

    public saveMembers() {
        persistence.members = this._members
    }

    public getResultsForCurrentDraft(): MemberVotes {
        return this.voteResults[this._currentDraftResolution] || {}
    }

    public getResultForCurrentDraftAndMember(member: Member): VoteState {
        return (this.voteResults[this._currentDraftResolution] || {})[member.id]?.s || VoteState.NONE
    }

    public resetCurrentDraft() {
        this.voteResults[this._currentDraftResolution] = {}
        this.saveVoteResults()
    }

    public resetAllDrafts() {
        this.voteResults = {}
        this.saveVoteResults()
    }

    public getMemberById(memberId: number): Member | undefined {
        return this._members.find((m) => m.id == memberId)
    }

    public async uploadResults() {
        let lines = []
        for (const res of Object.keys(this.voteResults)) {
            const sessionId = this._draftResolutions[res].session
            for (const memberId of Object.keys(this.voteResults[res] as MemberVotes)) {

                const mId = parseInt(memberId)
                if (mId < 0) continue

                let state = this.voteResults[res][mId]

                lines.push([
                    sessionId,
                    new Date(state.t * 1000).toLocaleString('de-DE'),
                    res,
                    (this.getMemberById(mId)?.fname || '') + ' ' + (this.getMemberById(mId)?.lname || ''),
                    state.s == VoteState.YES ? 1 : 0,
                    state.s == VoteState.NO ? 1 : 0,
                    state.s == VoteState.ABS ? 1 : 0
                ] as string[])
            }
        }
        await api.saveResults(lines)
    }


    public downloadResults() {
        const lines = [[
            'Datum',
            'Besschluss',
            'Mitgliedsname',
            'Ja',
            'Nein',
            'Enthaltung'
        ].join(';')]
        for (const res of Object.keys(this.voteResults))
            for (const memberId of Object.keys(this.voteResults[res] as MemberVotes)) {
                const mId = parseInt(memberId)
                let state = this.voteResults[res][mId]
                lines.push([
                    new Date(state.t * 1000).toISOString().substr(0, 16).replace('T', ' '),
                    res,
                    (this.getMemberById(mId)?.fname || '') + ' ' + (this.getMemberById(mId)?.lname || ''),
                    state.s == VoteState.YES ? 1 : 0,
                    state.s == VoteState.NO ? 1 : 0,
                    state.s == VoteState.ABS ? 1 : 0
                ].join(';'))
            }

        const link = document.createElement('a')
        link.href = 'data:text/plain;charset=utf-8,%EF%BB%BF' + encodeURIComponent(lines.join('\r\n'))
        link.download = 'vote-results.csv'
        link.click()
    }

    public async loadImages() {
        if (Object.keys(this._images).length) return
        this._images = await api.getImages()
    }

    public getImage(name: string): string {
        if (!Object.keys(this._images).length) return EMPTY_GIF
        return this._images[name] ? this._images[name] : this._images['generic.png']
    }

    cleanUp(validDraftResolutions: string[]) {
        for (const dr of Object.keys(this.voteResults)) {
            if (validDraftResolutions.indexOf(dr) >= 0) continue
            delete this.voteResults[dr]
        }
        this.saveVoteResults()
    }

}

export const voteStore = new VoteStore()

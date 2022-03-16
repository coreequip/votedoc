import {DraftResolution, Fraction, Member, StringMap, VoteState} from "../models/member";
import {persistence} from "./persistence";


class Api {

    constructor() {
    }

    private BASE_URL = ''

    private checkBaseUrl() {
        if (this.BASE_URL) return

        this.BASE_URL = persistence.baseUrl
        if (this.BASE_URL) return

        this.BASE_URL = prompt('API-URL:') || ''
        if (!this.BASE_URL) {
            alert('Sorry, this information is mandatory.')
            location.reload()
            return
        }
        persistence.baseUrl = this.BASE_URL
    }

    private async get(query: string): Promise<any> {
        this.checkBaseUrl()
        let response = await fetch(`${this.BASE_URL}?${query}`)
        if (!response.ok) throw new Error(response.statusText)
        return response.json()
    }

    private async post(query: string, data: string): Promise<any> {
        this.checkBaseUrl()
        // fire & forget
        await fetch(`${this.BASE_URL}?${query}`, {
            method: 'POST',
            mode: 'no-cors',
            headers: {'Content-Type': 'application/json'},
            body: data
        })
    }

    public async getDraftResolutions(): Promise<DraftResolution[]> {
        const res = await this.get('draftresolutions')
        return res.map((map: StringMap) => {
            return {
                session: map.sitzung,
                date: map.sitzungsdatum,
                draftResolution: map.beschlussvorlage,
                description: map.kurzbeschreibung
            } as DraftResolution
        })
    }

    public async getMembers(): Promise<Member[]> {
        let res = await this.get('config')

        const fractions: Fraction[] = res.fractions.map((map: StringMap) => {
            return {
                id: map['nr'],
                name: map['fraktionsname'],
                shortName: map['kurzname']
            } as Fraction
        })

        return res.members.map((map: StringMap, idx: number) => {
            return new Member(
                idx + 1,
                map['vorname'],
                map['name'],
                fractions.find(el => el.id == map['fraktion']),
                map['bild'],
                VoteState.NONE
            )
        })
    }

    public async saveResults(data: string[][]) {
        return await this.post('save', JSON.stringify(data))
    }

    public async getImages(): Promise<StringMap> {
        return await this.get('images')
    }
}

export const api = new Api()

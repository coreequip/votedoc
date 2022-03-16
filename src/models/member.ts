export class Member {
    id: number
    fname: string
    lname: string
    fraction: Fraction | undefined
    image: string
    state: VoteState

    constructor(id: number, fname: string, lname: string, fraction: Fraction | undefined, image: string, state: VoteState) {
        this.id = id;
        this.fname = fname;
        this.lname = lname;
        this.fraction = fraction;
        this.image = image;
        this.state = state;
    }

    static empty() :Member {
        return new Member(-1, 'Leer', '', undefined, 'generic.png', VoteState.NONE)
    }


    makeNameId(): string {
        return (this.fname.substr(0, 1) + this.lname.substr(0, 2)).toUpperCase()
    }
}

export interface Fraction {
    id: string
    name: string
    shortName: string
}

export enum VoteState {
    NONE,
    YES,
    NO,
    ABS// abstention
}

export interface DraftResolution {
    session: string // Sitzung
    date: string // Sitzungsdatum
    draftResolution: string // Beschlussvorlage
    description: string // Kurzbeschreibung
}

export type StringMap = Record<string, string>

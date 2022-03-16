import {MemberVotes} from "../store/VoteStore";
import {Member} from "../models/member";

class Persistence {
    constructor() {
    }

    public get voteResults() {
        return JSON.parse(localStorage.getItem('votes') || '{}')
    }

    public set voteResults(data: Record<string, MemberVotes>) {
        localStorage.setItem('votes', JSON.stringify(data))
    }


    public get members() {
        return JSON.parse(localStorage.getItem('members') || '[]')
    }

    public set members(data: Member[]) {
        localStorage.setItem('members', JSON.stringify(data))
    }

    public get baseUrl() {
        return JSON.parse(localStorage.getItem('base-url') || '""')
    }

    public set baseUrl(data :string) {
        localStorage.setItem('base-url', JSON.stringify(data))
    }
}

export const persistence = new Persistence()

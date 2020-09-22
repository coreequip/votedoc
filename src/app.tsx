import {h} from 'preact';
import NameList from './components/namelist';
import DraftResolutionControl from './components/draftresolutioncontrol';
import SeatEditor from './components/seateditor';
import {useState} from "preact/hooks";

export default () => {
    const [isEdit, setEdit] = useState<boolean>(false)
    return (
        <div class="app">
            {
                isEdit ? <SeatEditor edit={setEdit}/> : <div>
                    <DraftResolutionControl edit={setEdit}/>
                    <NameList edit={setEdit}/>
                </div>
            }

        </div>
    )
}

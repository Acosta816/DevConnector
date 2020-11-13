import { SET_ALERT, REMOVE_ALERT } from '../actions/types';

const initialState = [];

//function that takes in a piece of state (that has to do with alerts) as well as an action.
// eslint-disable-next-line import/no-anonymous-default-export
export default function (state = initialState, action) { //action= {TYPE: , data/payload:}
    const { type, payload } = action;
    switch (type) {
        case SET_ALERT:
            return [...state, payload]
        case REMOVE_ALERT:
            return state.filter(alert => alert.id !== payload);
        default:
            return state;
    };//end of switch
}

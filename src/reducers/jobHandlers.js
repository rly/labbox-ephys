import { ADD_JOB_HANDLER, SET_JOB_HANDLER_NAME, DELETE_JOB_HANDLER } from '../actions/jobHandlers'
import { ASSIGN_JOB_HANDLER_TO_ROLE } from '../actions/jobHandlers'

const jobHandlers = (state = {
    roleAssignments: {},
    jobHandlers: []
}, action) => {
    switch (action.type) {
        case ADD_JOB_HANDLER:
            if (findJobHandlerById(state, action.jobHandlerId)) {
                console.warn(`Job handler with id already exists: ${action.jobHandlerId}`);
                return state;
            }
            return {
                ...state,
                jobHandlers: [
                    ...state.jobHandlers,
                    {
                        jobHandlerId: action.jobHandlerId,
                        name: action.name,
                        jobHandlerType: action.jobHandlerType,
                        config: action.config
                    }
                ]
            };
        case SET_JOB_HANDLER_NAME:
            if (!findJobHandlerById(state, action.jobHandlerId)) {
                console.warn(`Unable to find job handler with id: ${action.jobHandlerId}`);
                return state;
            }
            return {
                ...state,
                jobHandlers: state.jobHandlers.map(jh => (
                    (jh.jobHandlerId === action.jobHandlers) ? { ...jh, name: action.name } : jh
                ))
            };
        case DELETE_JOB_HANDLER:
            if (!findJobHandlerById(state, action.jobHandlerId)) {
                console.warn(`Unable to find job handler with id: ${action.jobHandlerId}`);
                return state;
            }
            if (state.defaultJobHandlerId === action.jobHandlerId) {
                state.defaultJobHandlerId = null;
            }
            if (state.sortingJobHandlerId === action.jobHandlerId) {
                state.sortingJobHandlerId = null;
            }
            return {
                ...state,
                jobHandlers: state.jobHandlers.filter(jh => (jh.jobHandlerId !== action.jobHandlerId))
            };
        case ASSIGN_JOB_HANDLER_TO_ROLE:
            if ((action.jobHandlerId) && (!findJobHandlerById(state, action.jobHandlerId))) {
                console.warn(`Unable to find job handler with id: ${action.jobHandlerId}. Not assigning to role.`);
                return state;
            }
            let roleAssignments = {...state.roleAssignments};
            if (!action.jobHandlerId) {
                if (action.role in roleAssignments) {
                    delete roleAssignments[action.role];
                }
            }
            else {
                roleAssignments = {...roleAssignments, [action.role]: action.jobHandlerId};
            }
            return {
                ...state,
                roleAssignments
            }
        default:
            return state
    }
}

function findJobHandlerById(state, id) {
    const x = state.jobHandlers.filter(jh => (jh.jobHandlerId === id))[0];
    return x;
}

export default jobHandlers
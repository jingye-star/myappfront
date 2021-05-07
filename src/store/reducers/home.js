const initialState = {
    name: "hyt",
    list: []
};

function homeReducer(state = initialState, action) {
    switch (action.type) {
        case "TEST_REDUCER":
            return {
                ...state,
            };
        case "INIT_DATA":
            return {
                ...state,
                ...action.payload
            };
        default:
            return state;
    }
}

export default homeReducer
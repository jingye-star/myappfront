export const getHomeData = () => {
    return dispatch => {
        return Promise.resolve().then(res => {
            dispatch({
                type: 'INIT_DATA',
                payload: {
                    list: [1, 2, 3],
                    name:"11111"
                }
            })
        })
    }
}
import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { getHomeData } from 'src/store/actions/home';

const Home = () => {
    const state = useSelector((state:any) => {
        console.log(state)
        return state.home
    })
    const dispatch = useDispatch()
    console.log(state, 'state')

    useEffect(() => {
        dispatch(getHomeData())
    }, [])
    return (
        <div>page Home1</div>
    )
}
export default Home
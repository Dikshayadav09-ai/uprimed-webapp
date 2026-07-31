import {createSlice,PayloadAction} from '@reduxjs/toolkit'

const LoggedIn = createSlice({
    name:"LoggedIn",
    initialState : false,
    reducers:{
        setLogin: (state, action:PayloadAction<boolean>):boolean=>{
            return action.payload
        }
    }
})

export const {setLogin} = LoggedIn.actions;
export default LoggedIn.reducer
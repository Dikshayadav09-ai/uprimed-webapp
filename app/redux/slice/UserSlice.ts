import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface userSlcie {
    id: string | null,
    name: string | null
    data: any 
    email:string | null
    plan : string | null
}

const user: userSlcie = {
    id: null,
    name: 'user',
    data: null,
    email:null,
    plan:null
}
export const userSlcie = createSlice({
    name: "user",
    initialState: user,
    reducers: {
        setUser: (state, action: PayloadAction<{ id:string, data: any, name: string , email:string , plan : string }>) => {
            state.id = action.payload.id
            state.data = action.payload.data
            state.name = action.payload.name
            state.email = action.payload.email
            state.plan = action.payload.plan
        },
    }
})

export const { setUser } = userSlcie.actions

export default userSlcie.reducer
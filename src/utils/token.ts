

export const generateToken = () => {
    const token = Math.floor(100000 + Math.random() * 900000).toString()
    if(process.env.NODE_ENV !== "production"){
        globalThis.cashTrackrConfirmationToken = token
    }
    return token
}
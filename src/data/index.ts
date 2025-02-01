import { exit } from "node:process"
import { db } from "../config/db"
import colors from "colors"

const clearData = async () => {
    try {
        await db.sync({ force: true })
        console.log(colors.cyan.bold("Datos eliminados correctamente"))
        exit(0)
    } catch (error) {
        console.log(error)
        exit(1)
    }
}

if(process.argv[2] === "--clear"){
    clearData()
}
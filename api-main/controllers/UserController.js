const bcrypt = require('bcrypt')
const userModel = require ('../models/UserModel')

const passwordValidation = (pwd) => {
    let result = false
    /*if(pwd.length >= 8) console.log("pwd length > 8");
    if(/[A-Z]/.test(pwd)) console.log("pwd contain One letter is capital");
    if(/\d/.test(pwd)) console.log("pwd contain alphanumeric");
    if( /\W/.test(pwd)) console.log("pwd contain a special character");
    if( /\W/.test(pwd)) console.log("pwd contain no spaces");*/
    if (
        pwd.length >= 8 &&   //length must be greater than 8 characters.
        /[A-Z]/.test(pwd) && // One letter should be capital.
        /\d/.test(pwd) &&    // contain alphanumeric.
        /\W/.test(pwd) &&    // contain a special character (@, $, !, &, etc).
        !/\s/.test(pwd)      // no spaces
    ) {
        result = true
        console.log("pwdValidation", result);
        return result
    }
    console.log("pwdValidation", result);
    return result
}
const hash =  (pwd) => {
    const saltRounds = 10;
console.log('inH')
    return new Promise ((resolve,reject)  => {
        bcrypt.hash(pwd, saltRounds, (err, hash) => {
            if (err){
                console.log("h",err);
                throw (err);
                reject(err)
            }
            console.log("H",hash);
            resolve(hash)
        });
    })
}
const isInDb = async (mail) => {
try {
    const checkMail = await userModel.isUserMailExist(mail);
    return checkMail
}catch (e){
    console.error(e)
    return false
}
}
const newUser = async (hashPwd, name, email, city, longitude, latitude) => {
    try{
        //verify if email is unique
        
        //add user
        const addUser = await userModel.saveNewUser(hashPwd, name, email, city, longitude, latitude);
        return addUser
    }
    catch (error){
        console.error("Erreur lors de l'enregistrement :", error);
        return null;
    }
}

const showUsers = async () => {
    try{
        return userModel.getUsers()
    }
    catch (error){
        console.error("Erreur lors de la recherche des utilisateurs :", error);
        return null;
    }
}

const findUser = async (Pwd,email) => {
    try{
        const user = await userModel.isUserMailExist(email);
        console.log("user",user);
        if(user){
            const match = await bcrypt.compare(Pwd, user[0].password);
            if(match) {
                return true
            }else {
                throw new Error ("wrong password");
            }
        }else{
            throw new Error ("wrong mail");
        }
    }
    catch (e){
        console.error(e);
        return false;
    }
}

module.exports={passwordValidation,hash, newUser, showUsers, findUser, isInDb}
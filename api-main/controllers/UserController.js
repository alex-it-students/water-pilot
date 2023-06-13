const bcrypt = require('bcrypt');
const {findUserInDb,saveNewUser,getUsersFromDb,updateLocation,deleteUserInDb} = require ('../models/UserModel');
const jwt = require('jsonwebtoken');
const validator = require('validator');
const {CustomError} = require ('../errors/CustomError')

const isUserExist = async (userId) => {
    //send true if valve is in DB
    const getAllUsers = await getUsers();
    console.log("getValves",getAllUsers);
    return !!getAllUsers.find(e => e.id === userId)
}
const generateToken = (user) => {
    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: '10d' });
    return token;
}
const deleteUser = async (userId) => {
    try{
        const deleteU = await deleteUserInDb(userId);
        return deleteU
    }catch (e){
        throw new CustomError("Unable to delete the user",500)
    }
}
const passwordValidation = (pwd) => {

    let response = [];
    if (! pwd.length >= 8)  response.push("le password doit contenir au moins 8 caractères.");
    if (! /[A-Z]/.test(pwd)) response.push("le password doit contenir une majuscule.") ;
    if (! /\d/.test(pwd)) response.push("le password doit contenir un chiffre.") ;
    if (! /\W/.test(pwd)) response.push("le password doit contenir un caractère spécial (@, $, !, &, etc).") ;
    if ( /\s/.test(pwd)) response.push("le password ne doit pas contenir d'espace.");

    if (response.length != 0) {
        throw new CustomError(response.join(","),500);
    }
}
const hash =  (pwd) => {
    const saltRounds = 10;
    return new Promise ((resolve,reject)  => {
        bcrypt.hash(pwd, saltRounds, (err, hash) => {
            if (err){
                console.log("h",err);
                throw new CustomError("Un problème est survenu lors du hachage du mot de passe",500);
                reject(err);
            }
            console.log("H",hash);
            resolve(hash)
        });
    })
}
const isInDb = async (mail) => {
    const isMailAlreadyInDb = await findUserInDb(mail);
    console.log("isMailAlreadyInDb",isMailAlreadyInDb)
    if(isMailAlreadyInDb.length){
        throw new CustomError("Cet email est déjà utilisé",500);
    }
    return isMailAlreadyInDb
}
const newUser = async (hashPwd, name, email, city, longitude, latitude) => {
    try{
        //add user
        const addUser = await saveNewUser(hashPwd, name, email, city, longitude, latitude);
        return addUser
    }
    catch (error){
        console.error("Erreur lors de l'enregistrement :", error);
        return null;
    }
}
const isEmailValid = (email) => {
    if (!validator.isEmail(email)) {
        throw new CustomError("Veuillez fournir une adresse e-mail valide.",500)
    } else return true
}
const getUsers = async () => {
    try{
        return getUsersFromDb()
    }
    catch (error){
        console.log(error)
        throw new CustomError("Erreur lors de la recherche des utilisateurs"+error,500)
    }
}
const findUser = async (Pwd,email) => {
    try{
        const user = await findUserInDb(email);
        console.log("user",user);
        if(user){
            const match = await bcrypt.compare(Pwd, user[0].password);
            if(match) {
                return user
            }else throw new CustomError ('Email ou mot de passe incorrect',500);
        }else throw new CustomError ('Email ou mot de passe incorrect',500);

    }
    catch (e){
        console.error(e);
        throw new CustomError(e,500);
    }
}
const updateGardenLocation = async (userId, longitude, latitude) => {
    try{
        const updateLoc =await updateLocation(userId, longitude, latitude);
        console.log(updateLoc);
    }catch(err){
        console.log(err);
        throw new CustomError("Impossible de modifier les coordonnées du jardin.",500)
    }
}

module.exports={isUserExist,passwordValidation,hash, newUser, getUsers, findUser, isInDb, generateToken, updateGardenLocation, isEmailValid,deleteUser}
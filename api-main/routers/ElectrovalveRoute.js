const express = require('express');
const router = express.Router();
const {isElectrovalveExist,updateValveIsAutomatic,updateValveName,isValveNameAlreadyInDb,getElectrovalves,addElectrovalve,deleteElectrovalve,isValvePositionAlreadyInDb} = require ('../controllers/ElectrovalveController');
const {authenticate} = require ('../middlewares/AuthMiddleware');
const {CustomError} = require ('../errors/CustomError')
const {checkArgumentsDefined,checkArgumentsType} = require ('../controllers/Utils/Utils')

router.route('/')
    //renvoi toutes les éléctrovalves de l'utilisateur
    .get(authenticate,async (req,res,next) => {
        try{
            const getValves = await getElectrovalves(req.userId);
            res.status(200).json(getValves)
        }catch(err){
            next(err);
            return
        }
    })

    .post(authenticate,async (req,res,next) => {
        console.log("userId",req.userId);
        let { pinPosition, name } = req.body;
        pinPosition = parseInt(pinPosition)

        try {
            //vérifier que les arguments sont bien définis et du bon type
            checkArgumentsDefined(pinPosition,name);
            checkArgumentsType(pinPosition,"number",name,"string");

            //vérifier que la position de l'éléctrovanne n'est pas déjà prise
            const PositionAlreadyInDB =await isValvePositionAlreadyInDb(req.userId, pinPosition);
            if(PositionAlreadyInDB) next (new CustomError ("Une électrovanne existe déjà à cette position.",500));
            //vérifier que le nom n'est pas déjà pris
            const isNameAlreadyExist = await isValveNameAlreadyInDb(req.userId, name);
            if(isNameAlreadyExist) next (new CustomError ("Un circuit d'arrosage existe déjà avec ce nom.",500));
            //enregistrement de l'electrovalve, isAutomatic est true par défaut
            const addValve = await addElectrovalve(req.userId,pinPosition,name,isAutomatic=true);
            res.status(200).json(addValve)
        } catch (err) {
            next(err);
            return
        }
    })
router.route('/:idValve')
    .patch(authenticate,async (req,res,next) => {
        console.log(req.params);
        const idElectrovalve = parseInt(req.params.idValve) ;
        let { name, isAutomatic } = req.body;
        console.log("name",name,"isAutomatic",isAutomatic)

        //route utilisée pour modifier le nom ou isAutomatique d'une electrovanne
        try{
            if(isNaN(idElectrovalve)) next (new CustomError ("idValve doit être un nombre",500));
            //vérifier que l'electrovanne existe bien
            const isValveExist = await isElectrovalveExist(idElectrovalve, req.userId);
            if(!isValveExist) next (new CustomError ("Cette électrovanne n'existe pas",500));


            if(name){
                checkArgumentsDefined(name,idElectrovalve);
                checkArgumentsType(name,"string",idElectrovalve,"number");
                //vérifier que le nom n'est pas déjà pris
                const isNameAlreadyExist = await isValveNameAlreadyInDb(req.userId, name);
                if(isNameAlreadyExist) next (new CustomError ("Un circuit d'arrosage existe déjà avec ce nom.",500));
                await updateValveName(req.userId,idElectrovalve,name)
            }
            if(isAutomatic){
                checkArgumentsDefined(isAutomatic);
                let boolIsAutomatic = isAutomatic.toLowerCase()==="true";//converti en boolean
                checkArgumentsType(boolIsAutomatic,"boolean",idElectrovalve,"number");
                await updateValveIsAutomatic(req.userId,idElectrovalve,boolIsAutomatic)
            }
            res.status(200).json({"msg":"modification effectuée"})
        }catch (err){
            next(err);
            return
        }
    })
    .delete(authenticate,async (req,res,next) => {
        const idElectrovalve = parseInt(req.params.idValve) ;
            try{
                checkArgumentsType(idElectrovalve,"number");
                //vérifier que l'electrovanne existe bien
                const isValveExist = await isElectrovalveExist(idElectrovalve, req.userId);
                if(!isValveExist) next (new CustomError ("Cette électrovanne n'existe pas",500));
                const deleteValve = await deleteElectrovalve(idElectrovalve, req.userId);

                res.status(200).json(deleteValve.msg)
            }catch(err){
                next(err);
                return
            }
    })

module.exports=router;
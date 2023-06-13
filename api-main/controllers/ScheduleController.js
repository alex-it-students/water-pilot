const {putScheduleInDb,getSchedulesInDb, addScheduleInDb, deleteScheduleInDb} = require ('../models/ScheduleModel');
const {giveValvePostion} = require ('../controllers/ElectrovalveController');
const {isSettingNotInDb} = require ('../controllers/ValveSettingController');
const {CustomError} = require ('../errors/CustomError')


const getSchedules = async (idSettings) => {
    //checking if idSetting exist and belong this user
    try{
        return await getSchedulesInDb(idSettings);
    }catch(e){
        throw new CustomError("Unable to get schedules.",500)
    }
}

const addSchedule = async (hourStart, hourEnd, days, idSettings, isActivated) => {
    try {
        const scheduleAdded =  await addScheduleInDb (hourStart, hourEnd, days, idSettings, isActivated);
        return {
            id: scheduleAdded.insertId,
            hourStart: hourStart,
            hourEnd: hourEnd,
            days: days,
            idSettings: idSettings
        } ;

    } catch (e) {
        throw new CustomError("Unable to add schedule.",500);
    }
}
const deleteSchedule = async (idSchedule) => {
    try {
        const scheduledeleted =  await deleteScheduleInDb (idSchedule) ;
        return scheduledeleted ;
    } catch (e) {
        throw new CustomError("Unable to delete schedule.Errormsg:",500);
    }
}
const updateSchedule =  async (hourStart, hourEnd, days, idSettings, isActivated,idSchedule) => {
    try{
        const schedulePut = await putScheduleInDb (hourStart, hourEnd, days, idSettings, isActivated, idSchedule);
    }catch(err){
        throw new CustomError("Impossible de modifier la plannification",500);
    }
}


module.exports={updateSchedule,getSchedules,addSchedule,deleteSchedule}
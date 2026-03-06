import { Appointment } from "../entities/appointment";
import AppDataSource from "../../config/database";
import { AppointmentParams } from '../../types/types.interface';



type Doctor = {
  id: string;
  firstName: string;
  lastName: string;
};

type Apointment = {
  id: string;
  doctorId: string;
  date: string;
  time: string;
  reason: string;
  type: string;
  status: string;
};

export class AppointmentService {

    private dataSource: typeof AppDataSource


    constructor() {
        this.dataSource = AppDataSource;
    }

    private getRepository () {
        return this.dataSource.getRepository(Appointment)
    }

    getNextAvailableAppointment(schedule: any): Date | null {

            const days = [
        "sunday",
        "monday",
        "tuesday",
        "wednesday",
        "thursday",
        "friday",
        "saturday"
      ];
        const today = new Date();
        const todayIndex = today.getDay();

        for (let i = 1; i <= 7; i++) {
          const nextDayIndex = (todayIndex + i) % 7;
          const nextDay = days[nextDayIndex];

      const daySchedule = schedule[nextDay];

      if (daySchedule && daySchedule.active) {
        const [hour, minute] = daySchedule.start.split(":").map(Number);

        const appointmentDate = new Date();
        appointmentDate.setDate(today.getDate() + i);
        appointmentDate.setHours(hour);
        appointmentDate.setMinutes(minute + 30);
        appointmentDate.setSeconds(0);

        return appointmentDate;
      }
    }

    return null;
  }
    async createAppointment (appointmentParams: AppointmentParams ) {
      // calculate the date and time based on available days


      const appointmentData = {
        session_id : appointmentParams.sessionId,
        doctor_id: appointmentParams.doctorId,
        patient_id: appointmentParams.patientId,
        reason: appointmentParams.reason,
        appointment_date:,
        appointment_time:
      }

       return await  this.getRepository().save(appointmentData);
    }

    async getAllAppointments(patientId: string) {
      // add limit and offset afterwards
      //get appointment in descending order of the latest and the pending befor the completed
      return await this.getRepository().find({
        where: {
          patient_id: patientId,
        }
      });
    }
}
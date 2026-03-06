import { Appointment } from './../entities/appointment';
import AppDataSource from "../../config/database";
import { AppointmentParams, AppointmentType, doctorsData } from '../../types/types.interface';
import { WeeklySchedule } from "../../types/types.interface";
import { apiFetch } from '../../helpers/utils';


export class AppointmentService {

    private dataSource: typeof AppDataSource


    constructor() {
        this.dataSource = AppDataSource;
    }

    private getRepository () {
        return this.dataSource.getRepository(Appointment)
    }

    getNextAvailableAppointment(schedule: WeeklySchedule): {appointmentDate: Date, 
      appointmentTime:string} | null {

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

          if (daySchedule && daySchedule.isAvailable) {
            const [hour, minute] = daySchedule.startTime.split(":").map(Number);

            const appointmentDate = new Date();
            appointmentDate.setDate(today.getDate() + i);
            appointmentDate.setHours(hour);
            appointmentDate.setMinutes(minute + 30);
            appointmentDate.setSeconds(0);
            const appointmentTime = `${appointmentDate.getHours()}:${appointmentDate.getMinutes()}`.toString()

            return {appointmentDate, appointmentTime };
      }
    }

    return null;
  }
    async createAppointment (appointmentParams: AppointmentParams ): 
    Promise<{appointmentId: string}> {
      // calculate the date and time based on available days
     const appointmentTiming = this.getNextAvailableAppointment(
      appointmentParams.availableDays)

      const appointmentData = {
        session_id : appointmentParams.sessionId,
        doctor_id: appointmentParams.doctorId,
        patient_id: appointmentParams.patientId,
        reason: appointmentParams.reason,
        appointment_date:appointmentTiming?.appointmentDate,
        appointment_time: appointmentTiming?.appointmentTime
      }

       const appointment = await  this.getRepository().save(appointmentData);
       return {appointmentId: appointment.id}
    }

    async getAllAppointments(patientId: string): Promise<AppointmentType[]> {
      // add limit and offset afterwards
      // get appointment in descending order of the latest and the pending befor the completed
    
      const appointments = await this.getRepository().find({
        where: {
          patient_id: patientId,
        }
      });
      const doctorIds = [...new Set(appointments.map(a => a.doctor_id))];

       const doctors: doctorsData[] = await apiFetch('/api/doctors/profilebyIds', 
        {method: 'POST',
      body: JSON.stringify({ids: doctorIds})});

        const doctorMap = new Map(
            doctors.map(d => [d.userId, d])
          );

        const result = appointments.map(a => ({
        id: a.id,
        date: (a.appointment_date).toISOString(),
        time: a.appointment_time,
        reason: a.reason,
        type: 'consultation',
        status: a.status,
        doctor: {
          userId: doctorMap.get(a.doctor_id)?.userId,
          firstName: doctorMap.get(a.doctor_id)?.firstName,
          lastName: doctorMap.get(a.doctor_id)?.lastName
        }
      }));
      return result
    }
}
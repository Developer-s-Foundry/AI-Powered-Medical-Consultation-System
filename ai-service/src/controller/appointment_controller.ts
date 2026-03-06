import { Controller, Route, Post, Get, Body, Path  } from 'tsoa';
import { AppointmentParams } from '../types/types.interface';
import { AppointmentService } from '../model/service/appointment_service';


@Route('ai-service')
export class AppointmentController extends Controller {

    private appointmentService = new AppointmentService();

    @Post('/appointment')
    public async createAppointment(
        @Body() appointmentData: AppointmentParams
    ) {
       return await this.appointmentService.
       createAppointment(appointmentData);
    }

    @Get('/appointment/"{patientId}"')
    public async getAllAppointment(
        @Path() patientId: string
    ) {
        this.appointmentService.getAllAppointments(patientId);
    }
}
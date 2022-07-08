import { NextFunction, Response, Request } from 'express';

export interface IAppointmentController {
	create: (req: Request, res: Response, next: NextFunction) => void;
	getSingle: (req: Request, res: Response, next: NextFunction) => void;
	getAppointmentsByStatus: (req: Request, res: Response, next: NextFunction) => void;
	statusUpdate: (req: Request, res: Response, next: NextFunction) => void;
}

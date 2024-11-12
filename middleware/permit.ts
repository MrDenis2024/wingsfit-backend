import {RequestWithUser} from './auth';
import {NextFunction, Request, Response,} from 'express';

const permit = (...role: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const user = (req as RequestWithUser).user;
    if (!user || !role.includes(user.role)) {
      return res.status(403).send({error: 'Forbidden'});
    }
    return next();
  }
};

export default permit;
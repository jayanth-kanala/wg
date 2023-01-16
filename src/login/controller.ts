import { Request, Response, NextFunction } from "express";

class Login {
  async authenticate(req: Request, res: Response, next: NextFunction) {
    const { password } = req.body;
    if (!password) {
      return next(new Error("Password required!"))
    } else if (password !== process.env.PASSWORD) {
      return next(new Error("Invalid password!"))
    } else if (password === process.env.PASSWORD) {
      req.session.authenticated = true;
      res.locals.outResponse = { error: false, message: 'success' };
    }
    return next();
  }

  async logout(req: Request, res: Response, next: NextFunction) {
    req.session.destroy((error) => {
      if (error) {
        console.error(error);
        return;
      }
      next();
    });
  }

  async checkLogin(req: Request, res: Response, next: NextFunction) {
    if (req.session.authenticated) {
      next();
    } else {
      res.locals.statusCode = 401;
      next(new Error("PLEASE_LOGIN"));
    }
  }
}
export default new Login();
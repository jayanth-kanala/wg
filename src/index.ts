import express, { NextFunction, Request, Response, Express } from "express"
import session from 'express-session';
import { randomUUID } from "crypto";

import Utils from "./utils";
import Clients from './clients/routes'
import Login from './login/routes'
import path from "path";
import { PORT } from "./config";
import LoginController from './login/controller'

const app: Express = express()

declare module 'express-session' {
  interface SessionData {
    authenticated: boolean;
  }
}

app
  .use('/', express.static(path.join(__dirname, '..', 'ui')))
  .disable('etag')
  .set('trust proxy', 1)
  .use(express.json())
  .use(session({
    secret: randomUUID(),
    resave: false,
    saveUninitialized: false,
    cookie: { maxAge: 120000, secure: false },
    unset: 'destroy'
  }))
  .use('/auth', Login)
  .use(LoginController.checkLogin)
  .use('/clients', Clients)
  .use(errorHandler)
  .use(clientErrorHandler)
  .use(successHandler)
  .listen(PORT, async () => {
    console.log(`⚡️[server]: Server is running at ${PORT}`);
    await Utils.initServer();
  })

function errorHandler(err: Error, req: Request, res: Response, next: NextFunction) {
  console.error(err)
  next(err);
}

function clientErrorHandler(err: Error, req: Request, res: Response, next: NextFunction) {
  let code = res.locals.statusCode || 500;
  res.status(code).json({ error: true, message: err.message })
}

function successHandler(req: Request, res: Response, next: NextFunction) {
  res.status(200).json({ error: false, data: res.locals.outResponse })
}
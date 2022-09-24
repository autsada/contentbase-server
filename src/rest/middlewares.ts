import type { Request, Response, NextFunction } from 'express'

import { getUserFromAuthorizationHeader } from '../lib'

export async function verifyAuth(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const authorizationHeaders = req.headers['authorization']
  const { user } = await getUserFromAuthorizationHeader(authorizationHeaders)

  if (!user) {
    res.status(403).send('Forbidden')
  } else {
    req.userId = user.uid
    next()
  }
}

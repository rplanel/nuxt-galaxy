import { eq, and } from 'drizzle-orm'
import { createError } from 'h3'
import { users } from '../../db/schema/galaxy/users'
import { useDrizzle } from '../drizzle'
import { instances } from '../../db/schema/galaxy/instances'

export async function getCurrentUser(url: string, email: string) {
  const galaxyUsers = await useDrizzle().select().from(users)
    .innerJoin(instances, eq(users.instanceId, instances.id))
    .where(and(
      eq(users.email, email),
      eq(instances.url, url),
    ))
  if (galaxyUsers.length === 1) {
    return galaxyUsers[0]
  }
  else {
    if (galaxyUsers.length === 0) {
      throw createError('No galaxy user defined')
    }
    else {
      throw createError('Multiple galaxy user.')
    }
  }
}

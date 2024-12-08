import { createError } from 'h3'

export const takeUniqueOrThrow = <T extends unknown[]>(values: T): T[number] => {
  // if (values.length === 0) throw createError({
  //     statusCode: 404,
  //     statusMessage: "inexistent value"
  // })

  // if (values.length > 1) throw createError({
  //     statusCode: 500,
  //     statusMessage: "Found non unique"
  // })
  if (values.length > 1) createError({
    statusCode: 500,
    statusMessage: 'Found non unique',
  })
  if (values.length === 1) {
    return values[0]!
  }
}
